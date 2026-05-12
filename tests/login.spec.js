// tests/login.spec.js
const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/loginPage');
const SignupPage = require('../pages/signupPage');
const testData = require('../data/testData.json');
const { generateRandomUser } = require('../utils/helpers');

test.describe('Demoblaze Login Feature', () => {
  // GHI ĐÈ CẤU HÌNH: Không dùng auth state cho các test login
  test.use({ storageState: { cookies: [], origins: [] } });

  let loginPage;
  let dynamicUser;

  // Tạo user mới truớc khi chạy các test case Login (để tránh việc acc bị xóa/đổi pass)
  test.beforeAll(async ({ browser }) => {
    dynamicUser = generateRandomUser();
    const context = await browser.newContext();
    const page = await context.newPage();
    const signupPage = new SignupPage(page);
    await signupPage.navigate('/');
    await signupPage.openSignupModal();
    // Bỏ qua việc check Alert kỹ ở đây vì ta chỉ cần tạo acc
    page.once('dialog', dialog => dialog.accept());
    await signupPage.performSignup(dynamicUser.username, dynamicUser.password);
    // Chờ 1 chút để backend Demoblaze lưu user
    await page.waitForTimeout(2000);
    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    // Vì ta đã setup baseURL trong playwright.config.js, nên ở đây chỉ cần truyền '/'
    await loginPage.navigate('/'); 
  });

  // Kịch bản 1: Happy Path (Đăng nhập thành công)
  test('Should login successfully with valid credentials', async () => {
    // 2. Tương tác với UI qua Page Object
    await loginPage.openLoginModal();
    await loginPage.performLogin(dynamicUser.username, dynamicUser.password);

    // Chờ Demoblaze xử lý login và reload navbar (Bí kíp tránh flaky test)
    await loginPage.page.waitForTimeout(2000);

    // 3. Verification (Kiểm tra kết quả)
    const welcomeText = await loginPage.getWelcomeMessage();
    
    // Check against real data
    expect.soft(welcomeText).toContain(dynamicUser.username);
  });

  // Kịch bản 2: Negative Path (Đăng nhập thất bại, kiểm tra Alert)
  test('Should show error alert with invalid credentials', async ({ page }) => {
    const invalidUser = testData.login.invalidUser;

    await loginPage.openLoginModal();
    
    /* --- KỸ THUẬT NÂNG CAO: Xử lý Bất đồng bộ (Async) với Alert ---
       Playwright chạy rất nhanh. Nếu em điền user/pass rồi click login, Alert sẽ bắn ra ngay lập tức.
       Nếu lúc đó em mới gọi hàm lắng nghe Alert thì đã quá muộn (Alert đã biến mất).
       Do đó, ta phải dùng Promise.all() để:
       - Hành động 1: Căng tai ra "Lắng nghe" Alert.
       - Hành động 2: Click nút Login để "Kích hoạt" Alert.
       Cả 2 chạy song song!
    */
    const [alertMessage] = await Promise.all([
      loginPage.acceptAlertAndGetText(), // Bắt đầu lắng nghe
      loginPage.performLogin(invalidUser.username, invalidUser.password) // Kích hoạt UI
    ]);

    // Kiểm tra câu thông báo trên Alert có đúng như trong file JSON không
    expect(alertMessage).toBe(testData.messages.loginFail);
  });
});