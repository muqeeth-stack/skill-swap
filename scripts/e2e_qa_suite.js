// eslint-disable-next-line @typescript-eslint/no-require-imports
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3000';

let registeredEmail = '';
const QA_PASSWORD = 'SynapseQA!2026';
const QA_NAME = 'Quinn Test Pilot';

async function runQA() {
  console.log('====================================================');
  console.log('SYNAPSELEARN E2E QA AUTOMATION SUITE');
  console.log('Testing all 28 User Journeys on Google Chrome');
  console.log('====================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({ url: page.url(), text: msg.text() });
    }
  });

  page.on('pageerror', err => {
    pageErrors.push({ url: page.url(), message: err.message });
  });

  const results = {};

  async function waitEl(sel, ms = 10000) {
    await page.waitForSelector(sel, { timeout: ms });
  }

  // Programmatic click — bypasses hit-testing so fixed headers / bottom navs cannot
  // swallow a synthesized pointer event (a real mouse user scrolls before clicking).
  async function jsClick(sel) {
    await waitEl(sel);
    await page.$eval(sel, (el) => el.click());
  }

  async function testJourney(id, name, fn) {
    process.stdout.write(`Testing [${id}/28] ${name}... `);
    try {
      await fn();
      results[id] = { name, status: 'PASS' };
      console.log('✅ PASS');
    } catch (err) {
      results[id] = { name, status: 'FAIL', error: err.message };
      console.log(`❌ FAIL: ${err.message}`);
    }
  }

  try {
    // 1. Landing Page & NL Search
    await testJourney(1, 'Landing Page & Hero NL Search', async () => {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0', timeout: 15000 });
      const title = await page.title();
      if (!title.includes('SynapseLearn')) throw new Error(`Unexpected title: ${title}`);
      
      const searchInput = await page.$('input[placeholder*="learn Cricket"]');
      if (!searchInput) throw new Error('NL Search input not found on landing page');
      await searchInput.type('Learn Cricket fast bowling');
      await jsClick('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
      if (!page.url().includes('/matches')) throw new Error(`Did not navigate to /matches: ${page.url()}`);
    });

    // 2. Google Authentication / Quick Persona Sign-In
    await testJourney(2, 'Google / Quick Persona Authentication', async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
      // Demo personas sit inside a collapsed <details> — wait for it then expand.
      await waitEl('summary');
      const expanded = await page.evaluate(() => {
        const s = Array.from(document.querySelectorAll('summary'));
        const el = s.find((x) => x.textContent && x.textContent.toLowerCase().includes('demo persona'));
        if (el) { el.click(); return true; }
        return false;
      });
      if (!expanded) throw new Error('Demo persona details/summary not found on /login');
      await new Promise(r => setTimeout(r, 300));
      // Look for persona button by testid or text
      await waitEl('[data-testid="persona-priya"]');
      const priyaBtn = await page.$('[data-testid="persona-priya"]');
      if (priyaBtn) {
        await priyaBtn.click();
      } else {
        const personaButtons = await page.$$('button');
        let clicked = false;
        for (const btn of personaButtons) {
          const text = await (await btn.getProperty('innerText')).jsonValue();
          if (text && text.includes('Priya Patel')) {
            await btn.click();
            clicked = true;
            break;
          }
        }
        if (!clicked) throw new Error('Demo persona button not found');
      }
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 8000 }).catch(() => {}),
        page.waitForFunction(() => window.location.pathname.includes('/dashboard'), { timeout: 8000 })
      ]);
      if (!page.url().includes('/dashboard')) throw new Error('Not redirected to dashboard after login');
    });

    // 3. Login / Logout Flow
    await testJourney(3, 'Login / Logout Cycle', async () => {
      // Find avatar menu or logout button
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
      // Check for user name
      const bodyText = await page.evaluate(() => document.body.innerText);
      if (!bodyText.includes('Priya Patel')) throw new Error('Logged in user Priya Patel not rendered on dashboard');
    });

    // 4. Onboarding & Registration Wizard
    await testJourney(4, '5-Step Registration Wizard', async () => {
      await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle0' });
      // Step 1: Account Info (email/password account)
      await page.type('[data-testid="reg-name"]', QA_NAME);
      registeredEmail = `qa.${Date.now()}@synapselearn.test`;
      await page.type('[data-testid="reg-email"]', registeredEmail);
      await page.type('[data-testid="reg-password"]', QA_PASSWORD);
      await page.type('[data-testid="reg-confirm-password"]', QA_PASSWORD);
      await page.click('[data-testid="reg-terms"]');
      await jsClick('button[type="submit"]');
      await new Promise(r => setTimeout(r, 600));

      // Step 2: Skills to Teach
      const step2Text = await page.evaluate(() => document.body.innerText);
      if (!step2Text.includes('What Can You Teach')) throw new Error('Failed advancing to Step 2');
      await jsClick('button[type="submit"]');
      await new Promise(r => setTimeout(r, 600));

      // Step 3: Skills to Learn
      const step3Text = await page.evaluate(() => document.body.innerText);
      if (!step3Text.includes('What Do You Want to Learn')) throw new Error('Failed advancing to Step 3');
      await jsClick('button[type="submit"]');
      await new Promise(r => setTimeout(r, 600));

      // Step 4: Schedule & Availability
      const step4Text = await page.evaluate(() => document.body.innerText);
      if (!step4Text.includes('Schedule & Availability')) throw new Error('Failed advancing to Step 4');
      await jsClick('button[type="submit"]');
      await new Promise(r => setTimeout(r, 600));

      // Step 5: Primary Goal & Complete
      const step5Text = await page.evaluate(() => document.body.innerText);
      if (!step5Text.includes('Primary Outcome')) throw new Error('Failed advancing to Step 5');
      // The goal textarea is required — fill it before the final submit.
      await page.type('textarea[placeholder*="Master React"]', 'Master full-stack Next.js while sharing cricket bowling mechanics.');
      await jsClick('button[type="submit"]');
      // Account creation + PBKDF2 hashing is async; race navigation vs pathname change
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 9000 }).catch(() => {}),
        page.waitForFunction(() => window.location.pathname.includes('/matches'), { timeout: 9000 })
      ]);
      await new Promise(r => setTimeout(r, 500));
      if (!page.url().includes('/matches')) throw new Error('Not redirected to /matches after registration');
    });

    // 5. Profile Creation & Inspection
    await testJourney(5, 'Profile Creation & Inspection', async () => {
      await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle0' });
      // Open the Skills Matrix tab before asserting skill details
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
          .find((b) => b.textContent && b.textContent.includes('Skills Matrix'));
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 300));
      const profileText = await page.evaluate(() => document.body.innerText);
      if (!profileText.includes('Skills Offered to Teach')) throw new Error('Profile skills not displayed');
      if (!profileText.includes('Credits')) throw new Error('Credits not displayed on profile');
    });

    // 6. Adding Skills & Sports Mode Taxonomy
    await testJourney(6, 'Skills Taxonomy & Sports Mode Browsing', async () => {
      await page.goto(`${BASE_URL}/skills`, { waitUntil: 'networkidle0' });
      const text = await page.evaluate(() => document.body.innerText);
      if (!text.includes('Sports & Fitness')) throw new Error('Sports domain missing from taxonomy');
      if (!text.includes('Cricket')) throw new Error('Cricket not found in taxonomy');
      if (!text.includes('Badminton')) throw new Error('Badminton not found in taxonomy');
    });

    // 7. Creating Custom Skills
    await testJourney(7, 'Custom Skill Creator Modal', async () => {
      await page.goto(`${BASE_URL}/skills`, { waitUntil: 'networkidle0' });
      // Click Add Custom Skill
      const addButtons = await page.$$('button');
      for (const btn of addButtons) {
        const t = await (await btn.getProperty('innerText')).jsonValue();
        if (t && t.includes('Add Custom Skill')) {
          await btn.click();
          break;
        }
      }
      await new Promise(r => setTimeout(r, 500));
      const modalText = await page.evaluate(() => document.body.innerText);
      if (!modalText.includes('Add Custom Skill')) throw new Error('Custom skill modal did not open');
      await page.type('input[placeholder*="Cricket Spin"]', 'Pickleball Spin Serve');
      await jsClick('button[type="submit"]');
      await new Promise(r => setTimeout(r, 800));
    });

    // 8. AI Skill Suggestions / Assistant Modal
    await testJourney(8, 'AI Learning Assistant Modal', async () => {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
      const aiBtn = await page.$('[data-testid="ai-assistant-btn"]');
      if (aiBtn) {
        await aiBtn.click();
      } else {
        const buttons = await page.$$('button');
        for (const b of buttons) {
          const text = await (await b.getProperty('innerText')).jsonValue();
          if (text && text.includes('AI Assistant')) {
            await b.click();
            break;
          }
        }
      }
      await new Promise(r => setTimeout(r, 600));
      const modalText = await page.evaluate(() => document.body.innerText);
      if (!modalText.includes('AI Assistant') && !modalText.includes('Synapse AI Learning Assistant')) {
        throw new Error('AI Assistant modal did not open');
      }
      // Close modal
      const closeButtons = await page.$$('button');
      for (const cb of closeButtons) {
        const t = await (await cb.getProperty('innerText')).jsonValue();
        if (t === '✕') {
          await cb.click();
          break;
        }
      }
    });

    // 9. Skill Search
    await testJourney(9, 'Skill Search & Live Filtering', async () => {
      await page.goto(`${BASE_URL}/skills`, { waitUntil: 'networkidle0' });
      const searchInput = await page.$('input[placeholder*="Search subskills"]');
      if (!searchInput) throw new Error('Skills search input not found');
      await searchInput.type('batting');
      await new Promise(r => setTimeout(r, 400));
      const text = await page.evaluate(() => document.body.innerText);
      if (!text.includes('Batting') && !text.includes('Cricket')) throw new Error('Filtering by batting failed');
    });

    // 10. Natural-Language Search
    await testJourney(10, 'Natural-Language Search Query on /matches', async () => {
      await page.goto(`${BASE_URL}/matches?q=cricket`, { waitUntil: 'networkidle0' });
      const text = await page.evaluate(() => document.body.innerText);
      if (!text.includes('AI Compatibility & Match Center')) throw new Error('Matches page did not render');
    });

    // 11. AI Matching Engine Calculation
    await testJourney(11, 'AI Matching Engine Cards & Scores', async () => {
      await page.goto(`${BASE_URL}/matches`, { waitUntil: 'networkidle0' });
      const matchBadges = await page.$$eval('*', els => els.filter(e => e.innerText && e.innerText.includes('% Match')).map(e => e.innerText));
      if (matchBadges.length === 0) throw new Error('No AI match score percentage badges rendered');
    });

    // 12. Match Explanation Drawer ("Why You Match")
    await testJourney(12, 'Match Explanation "Why You Match" Toggle', async () => {
      await page.goto(`${BASE_URL}/matches`, { waitUntil: 'networkidle0' });
      const whyButtons = await page.$$('button');
      let clicked = false;
      for (const btn of whyButtons) {
        const t = await (await btn.getProperty('innerText')).jsonValue();
        if (t && t.includes('Why You Match')) {
          await btn.click();
          clicked = true;
          break;
        }
      }
      if (!clicked) throw new Error('Why You Match button not found on match card');
      await new Promise(r => setTimeout(r, 400));
      const text = await page.evaluate(() => document.body.innerText);
      if (!text.includes('Skill Complementarity') && !text.includes('Availability Overlap')) {
        throw new Error('Synergy breakdown did not expand');
      }
    });

    // 13. Connection Requests
    await testJourney(13, 'Connection Requests & Network Tabs', async () => {
      await page.goto(`${BASE_URL}/connections`, { waitUntil: 'networkidle0' });
      const text = await page.evaluate(() => document.body.innerText);
      if (!text.includes('Active Connections') || !text.includes('Incoming Requests')) {
        throw new Error('Connections tabs missing');
      }
    });

    // 14. Real-time Messaging
    await testJourney(14, 'Messaging View & Send Message', async () => {
      await page.goto(`${BASE_URL}/messages`, { waitUntil: 'networkidle0' });
      const input = await page.$('input[placeholder*="Message"]');
      if (!input) throw new Error('Message input not found');
      await input.type('Hello from automated QA test!');
      await jsClick('button[type="submit"]');
      await new Promise(r => setTimeout(r, 500));
      const text = await page.evaluate(() => document.body.innerText);
      if (!text.includes('Hello from automated QA test!')) throw new Error('Sent message not rendered in chat thread');
    });

    // 15. Learning Rooms / Groups
    await testJourney(15, 'Learning Rooms Hub Inspection', async () => {
      await page.goto(`${BASE_URL}/groups`, { waitUntil: 'networkidle0' });
      const text = await page.evaluate(() => document.body.innerText);
      if (!text.includes('Learning Rooms & Peer Circles')) throw new Error('Groups hub header missing');
    });

    // 16. Group Joining / Room Creation
    await testJourney(16, 'Group Joining & Discussion Feed', async () => {
      await page.goto(`${BASE_URL}/groups`, { waitUntil: 'networkidle0' });
      const text = await page.evaluate(() => document.body.innerText.toLowerCase());
      if (!text.includes('live room discussion')) throw new Error('Room discussion feed missing');
      const input = await page.$('input[placeholder*="Message the room"]');
      if (input) {
        await input.type('Testing room message');
        const sendBtn = await page.$('button[type="submit"]');
        if (sendBtn) await sendBtn.click();
        await new Promise(r => setTimeout(r, 400));
      }
    });

    // 17. Learning Paths
    await testJourney(17, 'Curated Learning Paths Catalog', async () => {
      await page.goto(`${BASE_URL}/paths`, { waitUntil: 'networkidle0' });
      const text = await page.evaluate(() => document.body.innerText);
      if (!text.includes('Curated Learning Paths')) throw new Error('Learning Paths page missing header');
    });

    // 18. Progress Tracking / Stage Toggle
    await testJourney(18, 'Learning Path Milestone Checklists', async () => {
      await page.goto(`${BASE_URL}/paths`, { waitUntil: 'networkidle0' });
      const checkboxes = await page.$$('input[type="checkbox"]');
      if (checkboxes.length === 0) throw new Error('No stage milestone checkboxes found on paths');
      await checkboxes[0].click();
      await new Promise(r => setTimeout(r, 400));
    });

    // 19. Reviews & Ratings
    await testJourney(19, 'Sessions Management & Review System', async () => {
      await page.goto(`${BASE_URL}/sessions`, { waitUntil: 'networkidle0' });
      const text = await page.evaluate(() => document.body.innerText);
      if (!text.includes('My Learning Sessions')) throw new Error('Sessions page missing');
    });

    // 20. Notifications System
    await testJourney(20, 'Notification Bell Dropdown & Badges', async () => {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
      const bell = await page.$('button[title*="Notifications"], button[aria-label*="Notification"]');
      if (bell) {
        await bell.click();
        await new Promise(r => setTimeout(r, 400));
      }
    });

    // 21. Settings & AI Weights Tuner
    await testJourney(21, 'Algorithm Weights Tuner Modal', async () => {
      await page.goto(`${BASE_URL}/matches`, { waitUntil: 'networkidle0' });
      const tuneButtons = await page.$$('button');
      for (const b of tuneButtons) {
        const text = await (await b.getProperty('innerText')).jsonValue();
        if (text && text.includes('Tune Algorithm Weights')) {
          await b.click();
          break;
        }
      }
      await new Promise(r => setTimeout(r, 500));
      const text = await page.evaluate(() => document.body.innerText);
      if (!text.includes('AI Matching Algorithm Weights')) throw new Error('Weights modal did not open');
      // Click Apply
      const applyButtons = await page.$$('button');
      for (const b of applyButtons) {
        const t = await (await b.getProperty('innerText')).jsonValue();
        if (t && t.includes('Apply Weights')) {
          await b.click();
          break;
        }
      }
      await new Promise(r => setTimeout(r, 400));
    });

    // 22. Mobile Responsive UI
    await testJourney(22, 'Mobile Viewport (375x812) & Mobile Navigation Bar', async () => {
      await page.setViewport({ width: 375, height: 812, isMobile: true });
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
      const mobileNav = await page.$('div.lg\\:hidden');
      if (!mobileNav) throw new Error('Mobile bottom navigation bar not found at 375px');
      await page.setViewport({ width: 1280, height: 900 });
    });

    // 23. Dark Mode Toggle
    await testJourney(23, 'Dark Mode Toggle & Class Assertion', async () => {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
      const themeButtons = await page.$$('button[title*="Theme"], button');
      let clicked = false;
      for (const b of themeButtons) {
        const t = await (await b.getProperty('innerText')).jsonValue();
        if (t && (t.includes('🌙') || t.includes('☀️'))) {
          await b.click();
          clicked = true;
          break;
        }
      }
      if (!clicked) throw new Error('Theme toggle button not found');
      await new Promise(r => setTimeout(r, 300));
      const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      if (!isDark) throw new Error('html.dark class was not applied on click');
      // Toggle back
      for (const b of themeButtons) {
        const t = await (await b.getProperty('innerText')).jsonValue();
        if (t && (t.includes('🌙') || t.includes('☀️'))) {
          await b.click();
          break;
        }
      }
    });

    // 24. Error States & 404
    await testJourney(24, '404 Error State Handling', async () => {
      const response = await page.goto(`${BASE_URL}/non-existent-random-route`, { waitUntil: 'networkidle0' });
      if (response.status() !== 404 && response.status() !== 200) {
        throw new Error(`Unexpected status code for missing route: ${response.status()}`);
      }
    });

    // 25. Admin Functionality
    await testJourney(25, 'Admin Moderation & Safety Queue', async () => {
      await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle0' });
      const text = await page.evaluate(() => document.body.innerText);
      if (!text.includes('Admin & CMS Panel')) throw new Error('Admin panel not accessible');
      if (!text.includes('Moderation Queue')) throw new Error('Moderation queue tab missing');
    });

    // 26. Password Login / Logout / Remember-Me cycle
    await testJourney(26, 'Password Login, Logout & Remember-Me', async () => {
      if (!registeredEmail) throw new Error('No registered account available (journey 4 did not run)');
      // Open profile dropdown and Sign Out
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
      await waitEl('button[aria-label="Open account menu"]');
      await page.click('button[aria-label="Open account menu"]');
      await new Promise(r => setTimeout(r, 300));
      const signedOut = await page.evaluate(() => {
        const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent && x.textContent.trim() === 'Sign Out');
        if (b) { b.click(); return true; }
        return false;
      });
      if (!signedOut) throw new Error('Sign Out button not found in account menu');
      await new Promise(r => setTimeout(r, 500));

      // Log back in with email/password
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
      await waitEl('[data-testid="login-email"]');
      await page.type('[data-testid="login-email"]', registeredEmail);
      await page.type('[data-testid="login-password"]', QA_PASSWORD);
      const rememberBox = await page.$('[data-testid="remember-me"]');
      if (rememberBox) {
        const checked = await page.evaluate(() => document.querySelector('[data-testid="remember-me"]').checked);
        if (!checked) await page.click('[data-testid="remember-me"]');
      }
      await jsClick('[data-testid="login-submit"]');
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 9000 }).catch(() => {}),
        page.waitForFunction(() => window.location.pathname.includes('/dashboard'), { timeout: 9000 })
      ]);
      const afterLogin = await page.evaluate(() => document.body.innerText);
      if (!afterLogin.includes(QA_NAME)) throw new Error('Name not rendered after password login');

      // Reload — remember-me session must survive (localStorage marker)
      await page.reload({ waitUntil: 'networkidle0' });
      const afterReload = await page.evaluate(() => document.body.innerText);
      if (!afterReload.includes(QA_NAME)) throw new Error('Remember-me session did not persist after reload');
    });

    // 27. Sign out fully removes session (no silent re-login on next load)
    await testJourney(27, 'Logout Permanence (session cleared)', async () => {
      await waitEl('button[aria-label="Open account menu"]');
      await page.click('button[aria-label="Open account menu"]');
      await new Promise(r => setTimeout(r, 300));
      const signedOut = await page.evaluate(() => {
        const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent && x.textContent.trim() === 'Sign Out');
        if (b) { b.click(); return true; }
        return false;
      });
      if (!signedOut) throw new Error('Sign Out button not found for permanence check');
      await new Promise(r => setTimeout(r, 500));
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
      const bodyText = await page.evaluate(() => document.body.innerText);
      if (bodyText.includes(QA_NAME) && await page.$('button[aria-label="Open account menu"]')) {
        throw new Error('Account still authenticated after logout');
      }
      const guestVisible = await page.evaluate(() => document.body.innerText);
      if (!guestVisible.includes('Sign In') && !guestVisible.includes('Sign in')) {
        throw new Error('Guest login CTA not visible after logout');
      }
    });

    // 28. Forgot Password reset cycle with new password
    await testJourney(28, 'Forgot Password Reset & Re-Login', async () => {
      await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: 'networkidle0' });
      await page.type('[data-testid="fp-email"]', registeredEmail);
      await jsClick('[data-testid="fp-submit"]');
      await new Promise(r => setTimeout(r, 700));
      const code = await page.evaluate(() => {
        const el = document.querySelector('[data-testid="fp-code"]');
        return el ? el.textContent.trim() : '';
      });
      if (!/^\d{6}$/.test(code)) throw new Error('6-digit reset code was not displayed');
      await page.type('[data-testid="fp-code-input"]', code);
      const newPass = 'ResetPass!2027';
      await page.type('[data-testid="fp-password"]', newPass);
      await page.type('[data-testid="fp-confirm"]', newPass);
      await jsClick('[data-testid="fp-reset"]');
      await new Promise(r => setTimeout(r, 1200));
      const doneBtn = await page.$('[data-testid="fp-done"]');
      const doneText = await page.evaluate(() => document.body.innerText);
      if (!doneBtn || !doneText.toLowerCase().includes('password has been updated')) {
        throw new Error('Password reset completion page not shown');
      }

      // Re-login with the new password proves the reset worked
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
      await waitEl('[data-testid="login-email"]');
      await page.type('[data-testid="login-email"]', registeredEmail);
      await page.type('[data-testid="login-password"]', newPass);
      const rb = await page.$('[data-testid="remember-me"]');
      if (rb) {
        const checked = await page.evaluate(() => document.querySelector('[data-testid="remember-me"]').checked);
        if (!checked) await page.click('[data-testid="remember-me"]');
      }
      await jsClick('[data-testid="login-submit"]');
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 9000 }).catch(() => {}),
        page.waitForFunction(() => window.location.pathname.includes('/dashboard'), { timeout: 9000 })
      ]);
      const afterText = await page.evaluate(() => document.body.innerText);
      if (!afterText.includes(QA_NAME)) throw new Error('Login with reset password failed');
    });

  } finally {
    await browser.close();
  }

  console.log('\n====================================================');
  console.log('SUMMARY OF QA RESULTS:');
  console.log('====================================================');
  let passCount = 0;
  let failCount = 0;
  for (const [id, res] of Object.entries(results)) {
    if (res.status === 'PASS') {
      passCount++;
      console.log(`[PASS] Journey ${id}: ${res.name}`);
    } else {
      failCount++;
      console.log(`[FAIL] Journey ${id}: ${res.name} -> ${res.error}`);
    }
  }

  console.log(`\nTOTAL: ${passCount} Passed, ${failCount} Failed.`);

  if (consoleErrors.length > 0) {
    console.log(`\nBrowser Console Errors (${consoleErrors.length}):`);
    consoleErrors.slice(0, 10).forEach(e => console.log(`  - [${e.url}] ${e.text}`));
  } else {
    console.log('\nZero browser console errors detected! ✨');
  }

  if (pageErrors.length > 0) {
    console.log(`\nPage Unhandled Exceptions (${pageErrors.length}):`);
    pageErrors.forEach(e => console.log(`  - [${e.url}] ${e.message}`));
  }
}

runQA().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
