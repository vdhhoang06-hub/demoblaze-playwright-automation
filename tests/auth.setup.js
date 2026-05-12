// auth.setup.js
const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/loginPage');
const SignupPage = require('../pages/signupPage');
// const testData = require('../data/testData.json'); // Không cần dùng đến vì đã dùng random
const { generateRandomUser } = require('../utils/helpers');

const authFile = 'playwright/.auth/user.json';

test('Khởi tạo state: Tạo User và Đăng nhập UI 1 lần duy nhất', async ({ page }) => {
  const dynamicUser = generateRandomUser();
  const signupPage = new SignupPage(page);
  
  await signupPage.navigate('/');
  
  // --- BƯỚC 1: SIGNUP ---
  await signupPage.openSignupModal();
  
  // Tuyệt chiêu xử lý Alert không dùng waitForTimeout
  // Lắng nghe Alert và Click Đăng ký chạy song song
  await Promise.all([
    signupPage.acceptAlertAndGetText(), // Hàm này sẽ tự động chờ Alert hiện ra rồi mới pass
    signupPage.performSignup(dynamicUser.username, dynamicUser.password)
  ]);
  
  // --- BƯỚC 2: LOGIN ---
  const loginPage = new LoginPage(page);
  await loginPage.openLoginModal();
  
  // Bỏ waitForTimeout, dùng Playwright locator auto-wait (Chờ đến khi chữ Welcome xuất hiện)
  await loginPage.performLogin(dynamicUser.username, dynamicUser.password);

  // Thay vì dùng hàm getWelcomeMessage() lấy text rồi so sánh tĩnh,
  // Ta ném thẳng cái Locator vào hàm expect() để Playwright tự động chờ (poll) 
  // cho đến khi UI render xong chữ Welcome. Mất 0.1s hay 5s nó đều xử lý được!
  await expect(loginPage.nameDisplay).toContainText(dynamicUser.username);

  // --- BƯỚC 3: LƯU STATE ---
  await page.context().storageState({ path: authFile });
});