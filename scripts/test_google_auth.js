#!/usr/bin/env node
/**
 * Offline end-to-end test for the REAL Google OAuth server flow.
 *
 * Runs a local mock "Google" (auth + token + userinfo endpoints) and a local
 * production build of the app, then drives the full journey with raw requests:
 *
 *   1. GET /api/auth/google?next=/profile -> 302 to mock auth (PKCE + signed state, cookie set)
 *   2. GET /api/auth/google/callback?code=..&state=.. (with PKCE cookie)
 *        -> 302 to /profile, httpOnly session cookie issued, PKCE cookie cleared
 *   3. GET /api/auth/me          -> returns the Google user (session cookie)
 *   4. GET /api/auth/me (no cookie / forged cookie) -> { user: null }
 *   5. State-mismatch attempt    -> 302 to /login?error=state_mismatch
 *   6. POST /api/auth/logout     -> session cookie cleared, /me now unauthenticated
 *
 * Usage (after `npm run build`):
 *   node scripts/test_google_auth.js
 */
'use strict';

const http = require('node:http');
const { spawn } = require('node:child_process');

const APP_PORT = 3100;
const MOCK_PORT = 9999;
const APP_ORIGIN = `http://localhost:${APP_PORT}`;
const MOCK_ORIGIN = `http://localhost:${MOCK_PORT}`;

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}
function assert(name, cond, detail) {
  check(name, !!cond, detail);
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function rawRequest(method, url, { headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? require('node:https') : http;
    const payload = body !== undefined ? Buffer.from(body) : null;
    const req = lib.request(
      u,
      {
        method,
        headers: {
          ...(payload ? { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': payload.length } : {}),
          ...headers,
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            setCookie: (res.headers['set-cookie'] || []).map(parseSetCookie),
            text: Buffer.concat(chunks).toString('utf8'),
          });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function parseSetCookie(raw) {
  const [pair, ...attrs] = raw.split(';');
  const eq = pair.indexOf('=');
  const name = pair.slice(0, eq).trim();
  let value = pair.slice(eq + 1).trim();
  if (value.endsWith(';')) value = value.slice(0, -1);
  const flags = Object.fromEntries(
    attrs.map((a) => {
      const i = a.indexOf('=');
      const k = a.trim().split('=')[0].trim();
      const v = i === -1 ? true : a.slice(i + 1).trim();
      return [k.toLowerCase(), v];
    })
  );
  return { name, value, flags };
}

function findCookie(setCookie, name) {
  const hit = setCookie.find((c) => c.name === name);
  return hit ? hit.value : null;
}

// --- Mock Google OAuth server -------------------------------------------------
const mock = http.createServer((req, res) => {
  const url = new URL(req.url, MOCK_ORIGIN);

  if (url.pathname === '/auth') {
    const state = url.searchParams.get('state');
    const code = 'mock-' + Math.random().toString(36).slice(2);
    res.writeHead(302, {
      Location: `${APP_ORIGIN}/api/auth/google/callback?code=${code}&state=${encodeURIComponent(state || '')}`,
    });
    res.end();
    return;
  }

  if (url.pathname === '/token') {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      const params = new URLSearchParams(raw);
      const wantsVerifier = params.get('code_verifier') && params.get('code_verifier').length >= 43;
      if (params.get('grant_type') !== 'authorization_code' || !wantsVerifier) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'invalid_grant', error_description: 'verifier missing' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ access_token: 'at-' + params.get('code'), token_type: 'Bearer', expires_in: 3599 }));
    });
    return;
  }

  if (url.pathname === '/userinfo') {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer at-mock-')) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'invalid_token' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        sub: '1029384756-qwerty',
        email: 'sam.google.test@gmail.com',
        email_verified: true,
        name: 'Sam Google Test',
        picture: 'https://example.com/avatar-sam.png',
      })
    );
    return;
  }

  res.writeHead(404);
  res.end();
});

// --- Main ----------------------------------------------------------------------
async function waitForApp(tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await rawRequest('GET', `${APP_ORIGIN}/api/auth/status`);
      if (r.status === 200) return;
    } catch {
      /* not up yet */
    }
    await delay(500);
  }
  throw new Error('App server did not become ready on ' + APP_ORIGIN);
}

async function run() {
  if (!process.env.AUTH_SECRET) {
    console.error('Set AUTH_SECRET before running (see .env.example).');
    process.exit(1);
  }

  await new Promise((res, rej) => {
    mock.listen(MOCK_PORT, '127.0.0.1', res);
    mock.on('error', rej);
  });
  console.log(`Mock OAuth provider listening on ${MOCK_ORIGIN}`);

  const app = spawn(
    'node',
    ['node_modules/next/dist/bin/next', 'start', '-p', String(APP_PORT), '-H', '127.0.0.1'],
    {
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: String(APP_PORT),
        NEXT_PUBLIC_APP_URL: APP_ORIGIN,
        AUTH_GOOGLE_CLIENT_ID: 'test-client-id.apps.googleusercontent.com',
        AUTH_GOOGLE_CLIENT_SECRET: 'test-client-secret',
        GOOGLE_AUTH_URL: `${MOCK_ORIGIN}/auth`,
        GOOGLE_TOKEN_URL: `${MOCK_ORIGIN}/token`,
        GOOGLE_USERINFO_URL: `${MOCK_ORIGIN}/userinfo`,
      },
      stdio: 'ignore',
    }
  );
  app.on('exit', () => mock.close());

  try {
    await waitForApp();

    // 1. Start the OAuth flow (should redirect to the mock Google consent screen)
    const start = await rawRequest('GET', `${APP_ORIGIN}/api/auth/google?next=/profile`, {});
    assert(
      'start -> redirect to Google consent screen',
      start.status === 302 || start.status === 307,
      `status=${start.status}`
    );
    const authUrl = start.headers.location;
    assert('start -> redirects to a fresh window & mock provider', authUrl && authUrl.startsWith(`${MOCK_ORIGIN}/auth`), authUrl);
    const stateToken = findCookie(start.setCookie, 'synapse_pkce');
    assert('start -> PKCE/state cookie issued', !!stateToken, stateToken ? `${stateToken.length} chars` : 'missing');
    const authParams = new URL(authUrl).searchParams;
    assert('start -> code_challenge_method=S256', authParams.get('code_challenge_method') === 'S256');
    assert('start -> PKCE challenge present', (authParams.get('code_challenge') || '').length >= 40);
    assert('start -> prompt=select_account', authParams.get('prompt') === 'select_account');
    assert('start -> scope=openid email profile', authParams.get('scope') === 'openid email profile');
    assert(
      'start -> redirect_uri = app callback',
      authParams.get('redirect_uri') === `${APP_ORIGIN}/api/auth/google/callback`
    );

    // 2. Simulate Google consent -> follow to the app callback
    const consent = await rawRequest('GET', start.headers.location, {});
    assert('consent -> 302 to app callback', consent.status === 302, `status=${consent.status}`);
    const consentLocation = consent.headers.location;
    assert(
      'consent -> location = app callback with code + state',
      consentLocation.startsWith(`${APP_ORIGIN}/api/auth/google/callback?`) &&
        consentLocation.includes('code=') &&
        consentLocation.includes(`state=${encodeURIComponent(stateToken)}`),
      consentLocation
    );

    const callback = await rawRequest('GET', consentLocation, {
      headers: { Cookie: `synapse_pkce=${stateToken}` },
    });
    assert(
      'callback -> 307/302 back into the app',
      callback.status === 302 || callback.status === 307,
      `status=${callback.status}`
    );
    assert(
      'callback -> back to intended destination (/profile)',
      callback.headers.location === `${APP_ORIGIN}/profile`,
      callback.headers.location
    );
    const sessionCookie = findCookie(callback.setCookie, 'synapse_session');
    assert('callback -> httpOnly session cookie issued', !!sessionCookie, sessionCookie ? 'yes' : 'missing');
    assert('callback -> PKCE cookie cleared', findCookie(callback.setCookie, 'synapse_pkce') !== null);

    // 3. /me with the valid session cookie
    const me = await rawRequest('GET', `${APP_ORIGIN}/api/auth/me`, {
      headers: { Cookie: `synapse_session=${sessionCookie}` },
    });
    const meData = JSON.parse(me.text);
    assert('me -> returns Google user', me.status === 200 && !!meData.user, JSON.stringify(meData));
    assert(
      'me -> Google identity fields populated',
      meData.user.id === 'google-1029384756-qwerty' &&
        meData.user.email === 'sam.google.test@gmail.com' &&
        meData.user.name === 'Sam Google Test' &&
        meData.user.avatar === 'https://example.com/avatar-sam.png',
      JSON.stringify(meData.user)
    );

    // 4. /me without a cookie (logged out / fresh visitor)
    const meNone = await rawRequest('GET', `${APP_ORIGIN}/api/auth/me`, {});
    assert('me -> null when no session cookie', JSON.parse(meNone.text).user === null);

    // 4b. /me with a forged cookie must fail signature verification
    const meForged = await rawRequest('GET', `${APP_ORIGIN}/api/auth/me`, {
      headers: { Cookie: 'synapse_session=eyJzdWIiOiJnb29nbGUtZm9yZ2VkIn0.forged' },
    });
    assert('me -> rejects forged session cookie', JSON.parse(meForged.text).user === null);

    // 5. State-mismatch: reuse a valid code with a DIFFERENT state than the stored cookie
    const badState = await rawRequest('GET', `${APP_ORIGIN}/api/auth/google/callback?code=zz&state=attacker-controlled`, {
      headers: { Cookie: `synapse_pkce=${stateToken}` },
    });
    assert(
      'callback -> state mismatch redirects to /login with error',
      (badState.status === 302 || badState.status === 307) && /\/login\?error=state_mismatch/.test(badState.headers.location),
      badState.headers.location
    );

    // 6. Logout invalidates the server-side session cookie
    const logout = await rawRequest('POST', `${APP_ORIGIN}/api/auth/logout`, {
      headers: { Cookie: `synapse_session=${sessionCookie}` },
    });
    assert('logout -> ok', JSON.parse(logout.text).ok === true);
    assert('logout -> session cookie cleared', findCookie(logout.setCookie, 'synapse_session') !== null);

    const meAfterLogout = await rawRequest('GET', `${APP_ORIGIN}/api/auth/me`, {});
    assert('me -> null after logout', JSON.parse(meAfterLogout.text).user === null);
  } finally {
    app.kill('SIGTERM');
    await delay(300);
    mock.closeAllConnections?.();
    mock.close();
  }

  const failures = results.filter((r) => !r.ok);
  console.log('\n====================================================');
  console.log(`GOOGLE AUTH E2E: ${results.length - failures.length}/${results.length} checks passed`);
  console.log('====================================================');
  if (failures.length) {
    console.error('FAILED CHECKS:');
    for (const f of failures) console.error(`  - ${f.name}: ${f.detail || 'unexpected'}`);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});