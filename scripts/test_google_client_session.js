#!/usr/bin/env node
/**
 * Client-side Google session lifecycle test (browser level).
 *
 * Covers the pieces that are client-only and therefore not reachable from the
 * raw-HTTP E2E: the mount-time /api/auth/status + /api/auth/me sync, profile
 * restore from the signed session cookie, protected-route redirect while signed
 * out, and the honest "not configured" Google-button state.
 *
 * Requires the local dev server on :3000 (fresh build of this source).
 */
'use strict';

const puppeteer = require('puppeteer-core');
const crypto = require('node:crypto');

const BASE = 'http://localhost:3000';
const CHROME_PATH = process.env.CHROME_PATH || (process.platform === 'win32'
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
const DEV_SECRET = 'synapselearn-local-dev-secret-not-for-production';

// Replicate signToken() from src/lib/auth.ts with the dev secret so the browser
// holds a cookie the server will accept exactly as a real Google callback would.
function signSessionCookie(user) {
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    provider: 'google',
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', DEV_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  try {
    const googleUser = {
      id: 'google-1029384756-qwerty',
      name: 'Sam Google Test',
      email: 'sam.google.test@gmail.com',
      avatar: 'https://example.com/avatar-sam.png',
    };
    const cookieValue = signSessionCookie(googleUser);

    // --- A. Honest "not configured" / real configured state on the login page ----
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' });
    const configured = await page.evaluate(async () => {
      const r = await fetch('/api/auth/status');
      return (await r.json()).googleConfigured;
    });

    const googleBtn = await page.$('[data-testid="google-signin-btn"]');
    check('login -> "Continue with Google" button present', !!googleBtn);

    if (!configured) {
      const notConfigNotice = await page.evaluate(() =>
        document.body.innerText.includes('AUTH_GOOGLE_CLIENT_ID')
      );
      check('login -> shows honest "Google not configured" notice', notConfigNotice);
      if (googleBtn) {
        await googleBtn.click();
        await new Promise((r) => setTimeout(r, 800));
        const toast = await page.evaluate(() => {
          const t = document.querySelector('[data-testid="toast-container"], [role="status"]');
          return t ? t.innerText : document.body.innerText;
        });
        const stayed = page.url().includes('/login');
        check(
          'login -> clicking Google when unconfigured stays put + explains (NO fake login)',
          stayed && /not configured/i.test(toast),
          page.url()
        );
      }
    } else {
      check('login -> configured mode (notice intentionally absent)', true, 'AUTH_GOOGLE creds present');
    }

    // --- B. Restore a Google session from the signed cookie (simulates OAuth return)
    await page.setCookie({
      name: 'synapse_session',
      value: cookieValue,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    });

    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1200)); // let /me sync resolve

    const dashText = await page.evaluate(() => document.body.innerText);
    check('dashboard -> Google user restored from session cookie', dashText.includes('Sam Google Test'));
    const stayedOnDash = page.url().includes('/dashboard');
    check('dashboard -> no bounce to /login while restoring Google session', stayedOnDash, page.url());

    // Profile reflects the Google identity
    await page.goto(`${BASE}/profile`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 800));
    const profileText = await page.evaluate(() => document.body.innerText);
    check('profile -> Google name shown', profileText.includes('Sam Google Test'));
    const hasAvatarImg = await page.evaluate(() =>
      Array.from(document.images).some((i) => i.src.includes('example.com/avatar-sam.png'))
    );
    check('profile -> Google avatar rendered', hasAvatarImg);

    // Account email (private, visible in Settings)
    await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 800));
    const settingsText = await page.evaluate(() => document.body.innerText);
    check('settings -> Google account email associated', settingsText.includes('sam.google.test@gmail.com'));

    // --- C. Real logout (app UI) invalidates local + server session -------------
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 800));
    await page.waitForSelector('button[aria-label="Open account menu"]', { timeout: 8000 });
    await page.click('button[aria-label="Open account menu"]');
    await new Promise((r) => setTimeout(r, 300));
    const signedOut = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find((x) => x.textContent && x.textContent.trim() === 'Sign Out');
      if (b) { b.click(); return true; }
      return false;
    });
    check('logout -> Sign Out available in account menu', signedOut);

    await new Promise((r) => setTimeout(r, 600));
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));
    const afterLogoutUrl = page.url();
    check(
      'logout -> protected /dashboard now redirects to /login?next=…',
      afterLogoutUrl.includes('/login') && afterLogoutUrl.includes('next='),
      afterLogoutUrl
    );

    const afterText = await page.evaluate(() => document.body.innerText);
    check(
      'logout -> Google identity no longer rendered',
      !afterText.includes('Sam Google Test'),
      afterText.slice(0, 80)
    );

    // --- D. Direct deep link while signed out keeps the destination -------------
    await page.goto(`${BASE}/messages`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));
    const deepUrl = page.url();
    check(
      'signed out -> deep link /messages captured into ?next=',
      deepUrl.includes('/login') && decodeURIComponent(deepUrl).includes('next=/messages'),
      deepUrl
    );
  } finally {
    await browser.close();
  }

  const failures = results.filter((r) => !r.ok);
  console.log('\n====================================================');
  console.log(`GOOGLE CLIENT SESSION: ${results.length - failures.length}/${results.length} checks passed`);
  console.log('====================================================');
  if (failures.length) {
    for (const f of failures) console.error(`  - ${f.name}: ${f.detail || 'unexpected'}`);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});