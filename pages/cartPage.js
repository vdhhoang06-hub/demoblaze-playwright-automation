// pages/cartPage.js
const BasePage = require('./basePage');

class CartPage extends BasePage {
  constructor(page) {
    super(page);
    this.cartNavLink = page.locator('#cartur');
    this.placeOrderBtn = page.getByRole('button', { name: 'Place Order' });
    this.nameInput = page.locator('#name');
    this.countryInput = page.locator('#country');
    this.cityInput = page.locator('#city');
    this.cardInput = page.locator('#card');
    this.monthInput = page.locator('#month');
    this.yearInput = page.locator('#year');
    this.purchaseBtn = page.getByRole('button', { name: 'Purchase' });
    this.successIcon = page.locator('.sa-success');
    this.successMessage = page.locator('.sweet-alert > h2');
    this.okBtn = page.getByRole('button', { name: 'OK' });
  }

  async goToCart() {
    await this.clickElement(this.cartNavLink);
  }

  async placeOrder(orderData) {
    await this.clickElement(this.placeOrderBtn);
    await this.fillText(this.nameInput, orderData.name);
    await this.fillText(this.countryInput, orderData.country);
    await this.fillText(this.cityInput, orderData.city);
    await this.fillText(this.cardInput, orderData.card);
    await this.fillText(this.monthInput, orderData.month);
    await this.fillText(this.yearInput, orderData.year);
    await this.clickElement(this.purchaseBtn);
  }

  async getSuccessMessage() {
    return await this.getText(this.successMessage);
  }
}

module.exports = CartPage;
