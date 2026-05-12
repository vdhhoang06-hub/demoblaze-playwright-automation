// pages/loginPage.js
const BasePage = require('./basePage');

class LoginPage extends BasePage {
  /**
   * Initializes LoginPage inherited from BasePage
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // STEP 1: DEFINE LOCATORS

    // 1. "Log in" button on the navigation menu (Using getByRole - Highest priority)
    this.loginNavLink = page.getByRole('link', { name: 'Log in' });

    /* --- REAL-WORLD LESSON ---
      Fundamentally, we should use: page.getByLabel('Username:')
      However, the Demoblaze HTML has Accessibility (a11y) issues.
      It uses <label for="log-name"> but the <input> has id="loginusername".
      Since they mismatch, Playwright cannot locate it via label.
      
      In an actual enterprise project, we would request Devs to add a `data-testid="login-username"` attribute.
      Because we cannot edit Demoblaze's code, we fallback to CSS IDs (#). 
      Using IDs is still considerably better than fragile XPaths.
    */
    this.usernameInput = page.locator('#loginusername');
    this.passwordInput = page.locator('#loginpassword');

    // "Log in" button inside the modal form (Using getByRole)
    this.submitLoginBtn = page.getByRole('button', { name: 'Log in' });

    // User's name displayed on the navigation bar after successful login (Used for assertions)
    this.nameDisplay = page.locator('#nameofuser');
  }

  // STEP 2: DEFINE ACTION FUNCTIONS

  /**
   * Opens the login modal from the homepage
   */
  async openLoginModal() {
    await this.clickElement(this.loginNavLink);
  }

  /**
   * Fills credentials and submits the login form
   * Note: This function consumes data loaded from a JSON file in the Test Script
   * @param {string} username 
   * @param {string} password 
   */
  async performLogin(username, password) {
    await this.fillText(this.usernameInput, username);
    await this.fillText(this.passwordInput, password);
    await this.clickElement(this.submitLoginBtn);
  }

  /**
   * Retrieves the welcome message displayed on the top right to verify successful login
   * @returns {Promise<string>}
   */
  async getWelcomeMessage() {
    return await this.getText(this.nameDisplay);
  }
}

module.exports = LoginPage;