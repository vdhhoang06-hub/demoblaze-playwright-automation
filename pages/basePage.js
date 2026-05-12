// pages/basePage.js

class BasePage {
  /**
   * Initializes BasePage
   * Using JSDoc (import type) here enables Playwright IntelliSense for the 'page' variable,
   * significantly enhancing code completion and developer experience.
   * * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Generic navigation function
   * @param {string} path - Relative path (e.g., '/', '/cart.html')
   */
  async navigate(path) {
    await this.page.goto(path);
    // Demoblaze API data loading can be occasionally slow.
    // We use domcontentloaded instead of networkidle to avoid timeouts caused by background scripts.
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * DEMOBLAZE SPECIFIC FIX: Handle Dialogs (Alert/Confirm)
   * This function listens for an alert event, extracts the message, and accepts it.
   * Essential for testing Signup / Login / Add to Cart workflows on this site.
   * * @returns {Promise<string>} - Returns the alert text content for assertions
   */
  async acceptAlertAndGetText() {
    return new Promise((resolve) => {
      // Use 'once' instead of 'on' ensuring the event listener is triggered only once for the subsequent action
      this.page.once('dialog', async (dialog) => {
        const message = dialog.message(); // Extract text (e.g., "Sign up successful")
        await dialog.accept();            // Click OK button on the alert
        resolve(message);                 // Return text to the test script
      });
    });
  }

  /**
   * Wrapper for Click action
   * Although Playwright has auto-wait, this structure allows easily adding Try/Catch blocks
   * or custom custom logs later as the project scales.
   * * @param {import('@playwright/test').Locator} locator 
   */
  async clickElement(locator) {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  /**
   * Wrapper for Fill text action
   * @param {import('@playwright/test').Locator} locator 
   * @param {string} text 
   */
  async fillText(locator, text) {
    await locator.waitFor({ state: 'visible' });
    // Clear old data before proceeding to guarantee stability
    await locator.clear(); 
    await locator.fill(text);
  }

  /**
   * Safe text retrieval function
   * @param {import('@playwright/test').Locator} locator 
   * @returns {Promise<string>}
   */
  async getText(locator) {
    await locator.waitFor({ state: 'visible' });
    // innerText() fetches the visible UI text, structurally cleaner than textContent()
    return await locator.innerText(); 
  }
}

// Mandatory export to allow inheritance by child classes (e.g., LoginPage)
module.exports = BasePage;