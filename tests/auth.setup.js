// auth.setup.js
const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/loginPage');
const SignupPage = require('../pages/signupPage');
// const testData = require('../data/testData.json'); // Not needed as a random user is generated
const { generateRandomUser } = require('../utils/helpers');

const authFile = 'playwright/.auth/user.json';

test('Initialize state: Create User and perform UI Login exactly once', async ({ page }) => {
  const dynamicUser = generateRandomUser();
  const signupPage = new SignupPage(page);
  
  await signupPage.navigate('/');
  
  // --- STEP 1: SIGNUP ---
  await signupPage.openSignupModal();
  
  // Enterprise best practice: Handle Alert without waitForTimeout
  // Listen for the Alert and click Sign up concurrently
  await Promise.all([
    signupPage.acceptAlertAndGetText(), // This automatically waits for the Alert to appear then resolves
    signupPage.performSignup(dynamicUser.username, dynamicUser.password)
  ]);
  
  // --- STEP 2: LOGIN ---
  const loginPage = new LoginPage(page);
  await loginPage.openLoginModal();
  
  // Skip waitForTimeout, leverage Playwright's locator auto-wait (Wait until Welcome text appears)
  await loginPage.performLogin(dynamicUser.username, dynamicUser.password);

  // Instead of fetching text via getWelcomeMessage() and doing a static assertion,
  // we pass the Locator directly into expect(), allowing Playwright to auto-wait (poll)
  // until the Welcome text is rendered into the UI. It resolves immediately whether it takes 0.1s or 5s!
  await expect(loginPage.nameDisplay).toContainText(dynamicUser.username);

  // --- STEP 3: SAVE STATE ---
  await page.context().storageState({ path: authFile });
});