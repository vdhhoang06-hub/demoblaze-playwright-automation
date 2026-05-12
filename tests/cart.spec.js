// tests/cart.spec.js
const { test, expect } = require('@playwright/test');
const CartPage = require('../pages/cartPage');

test.describe('Demoblaze Cart Feature', () => {
  let cartPage;

  test.beforeEach(async ({ page }) => {
    cartPage = new CartPage(page);
    await cartPage.navigate('/'); 
  });

  test('Should place order successfully', async ({ page }) => {
    // 1. Thêm một sản phẩm vào giỏ hàng trước (Samsung galaxy s6)
    await page.locator('a', { hasText: 'Samsung galaxy s6' }).click();
    
    // Xử lý alert thêm thành công
    page.once('dialog', dialog => dialog.accept());
    await page.locator('a', { hasText: 'Add to cart' }).click();
    await page.waitForTimeout(1000); // Chờ 1 chút để add vào db giỏ hàng

    // 2. Vào giỏ hàng và thanh toán
    await cartPage.goToCart();
    
    const orderData = {
      name: 'QA Master',
      country: 'Australia',
      city: 'Tikin',
      card: '1234567890123456',
      month: '12',
      year: '2025'
    };

    await cartPage.placeOrder(orderData);

    // 3. Kiểm tra thông báo mua thành công
    const successMsg = await cartPage.getSuccessMessage();
    expect(successMsg).toBe('Thank you for your purchase!');
    await cartPage.clickElement(cartPage.okBtn);
  });
});
