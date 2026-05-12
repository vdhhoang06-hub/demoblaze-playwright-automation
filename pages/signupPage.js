// pages/signupPage.js
const BasePage = require('./basePage');

class SignupPage extends BasePage {
  constructor(page) {
    super(page);

    this.signupNavLink = page.locator('#signin2');
    this.usernameInput = page.locator('#sign-username');
    this.passwordInput = page.locator('#sign-password');
    this.submitSignupBtn = page.getByRole('button', { name: 'Sign up' });
  }

  async openSignupModal() {
    await this.clickElement(this.signupNavLink);
  }

  async performSignup(username, password) {
    await this.fillText(this.usernameInput, username);
    await this.fillText(this.passwordInput, password);
    await this.clickElement(this.submitSignupBtn);
  }
}

module.exports = SignupPage;
