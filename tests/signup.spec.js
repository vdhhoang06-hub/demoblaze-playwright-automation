// tests/signup.spec.js
const { test, expect } = require('@playwright/test');
const SignupPage = require('../pages/signupPage');
const testData = require('../data/testData.json');
const { generateRandomUser } = require('../utils/helpers');

test.describe('Demoblaze Signup Feature', () => {
  // GHI ĐÈ CẤU HÌNH: Không dùng auth state cho các test signup
  test.use({ storageState: { cookies: [], origins: [] } });

  let signupPage;

  test.beforeEach(async ({ page }) => {
    signupPage = new SignupPage(page);
    await signupPage.navigate('/'); 
  });

  test('Should sign up successfully with random credentials', async ({ page }) => {
    const newUser = generateRandomUser();
    
    await signupPage.openSignupModal();
    
    const [alertMessage] = await Promise.all([
      signupPage.acceptAlertAndGetText(),
      signupPage.performSignup(newUser.username, newUser.password)
    ]);

    expect(alertMessage).toBe('Sign up successful.');
  });
});
