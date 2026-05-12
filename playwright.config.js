// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  /* Thư mục chứa các kịch bản test */
  testDir: './tests',

  /* Thời gian tối đa cho MỘT test case. Nếu quá 30s test sẽ bị đánh fail (Timeout) */
  timeout: 30 * 1000,

  expect: {
    /* Thời gian tối đa cho các hàm assert (VD: expect(locator).toBeVisible()). 
       Mặc định là 5s, đủ để chờ UI phản hồi. */
    timeout: 5000
  },

  /* Chạy các file test song song để tiết kiệm thời gian */
  fullyParallel: true,

  /* Cấm sử dụng test.only khi chạy trên CI (để tránh việc vô tình chỉ chạy 1 test case) */
  forbidOnly: !!process.env.CI,

  /* Chiến lược chạy lại (Retry) khi test fail: Local chạy lại 1 lần, CI chạy lại 2 lần */
  retries: process.env.CI ? 2 : 1,

  /* Số lượng worker chạy song song. Tùy thuộc vào cấu hình máy. */
  workers: process.env.CI ? 1 : undefined,

  /* Report xuất ra dạng HTML và hiển thị danh sách trên màn hình Console */
  reporter: [['html'], ['list']],

  /* CẤU HÌNH CHUNG DÙNG CHO MỌI PROJECT TRONG FILE NÀY */
  use: {
    /* Trái tim của config: Base URL.
       Từ giờ trong test script, em chỉ cần page.goto('/login') thay vì gõ cả URL dài. */
    baseURL: 'https://www.demoblaze.com',

    /* Thời gian tối đa cho một hành động (click, fill...). Nếu quá 10s sẽ báo lỗi. */
    actionTimeout: 10 * 1000,

    /* --- CẤU HÌNH DEBUG DÀNH CHO ENTERPRISE --- */
    /* Chỉ lưu Trace viewer, chụp ảnh màn hình và quay video KHI TEST FAIL để tiết kiệm dung lượng ổ cứng */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    /* Gợi ý cho tương lai: Đường dẫn lưu trữ phiên đăng nhập (Session Storage) để bỏ qua login */
    // storageState: './playwright/.auth/user.json',
  },

  /* Cấu hình chạy trên các trình duyệt khác nhau */
  projects: [
    // Project Setup chạy ĐẦU TIÊN để lấy Cookies/Token
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,
    },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Chỉ định file Auth để trình duyệt mặc định load vào
        storageState: 'playwright/.auth/user.json',
      },
      // Quy định: chromium phải đợt setup chạy xong mới được chạy
      dependencies: ['setup'],
    },
    // Tạm thời comment Firefox và Webkit lại. 
    // Trong quá trình dev local, ta chỉ nên chạy Chrome cho nhanh. 
    // Khi nào đẩy lên CI/CD mới bật các trình duyệt này lên để test Cross-browser.
    /*
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    */
  ],
});