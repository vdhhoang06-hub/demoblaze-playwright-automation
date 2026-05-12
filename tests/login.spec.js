// tests/login.spec.js
const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/loginPage');
const SignupPage = require('../pages/signupPage');
const testData = require('../data/testData.json');
const { generateRandomUser } = require('../utils/helpers');

test.describe('Demoblaze Login Feature', () => {
  // CONFIGURATION OVERRIDE: Do not use the pre-authenticated state for login tests
  test.use({ storageState: { cookies: [], origins: [] } });

  let loginPage;
  let dynamicUser;

  // Create a new user before running login test cases (prevents account invalidation issues)
  test.beforeAll(async ({ browser }) => {
    dynamicUser = generateRandomUser();
    const context = await browser.newContext();
    const page = await context.newPage();
    const signupPage = new SignupPage(page);
    await signupPage.navigate('/');
    await signupPage.openSignupModal();
    // Skip strict alert verification here since the goal is solely account creation
    page.once('dialog', dialog => dialog.accept());
    await signupPage.performSignup(dynamicUser.username, dynamicUser.password);
    // Add a slight delay to ensure Demoblaze's backend persists the user
    await page.waitForTimeout(2000);
    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    // Since baseURL is configured in playwright.config.js, we only need to navigate to '/'
    await loginPage.navigate('/'); 
  });

  // Scenario 1: Happy Path (Successful Login)
  test('Should login successfully with valid credentials', async () => {
    // 2. Interact with the UI via the Page Object
    await loginPage.openLoginModal();
    await loginPage.performLogin(dynamicUser.username, dynamicUser.password);

    // Wait for Demoblaze to process the login and reload the navbar (Anti-flaky practice)
    await loginPage.page.waitForTimeout(2000);

    // 3. Verification (Check Results)
    const welcomeText = await loginPage.getWelcomeMessage();
    
    // Check against real data
    expect.soft(welcomeText).toContain(dynamicUser.username);
  });

  // Scenario 2: Negative Path (Failed Login, verifying Alert)
  test('Should show error alert with invalid credentials', async ({ page }) => {
    const invalidUser = testData.login.invalidUser;

    await loginPage.openLoginModal();
    
    /* --- ADVANCED TECHNIQUE: Asynchronous Alert Handling ---
       Playwright executes very quickly. If you fill in credentials and click login, the Alert surfaces instantly.
       If the listener is attached after the click, it will miss the event entirely.
       Therefore, we use Promise.all() to concurrently execute:
       - Action 1: Set up the Alert listener.
       - Action 2: Click the Login button to trigger the UI event.
       Both run in parallel!
    */
    const [alertMessage] = await Promise.all([
      loginPage.acceptAlertAndGetText(), // Start listening
      loginPage.performLogin(invalidUser.username, invalidUser.password) // Trigger the UI element
    ]);

    // Validate that the Alert message matches the anticipated text from the JSON configuration
    expect(alertMessage).toBe(testData.messages.loginFail);
  });
});