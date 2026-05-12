// pages/basePage.js

class BasePage {
  /**
   * Khởi tạo BasePage
   * Dùng JSDoc (import type) ở đây để VSCode hiểu biến 'page' là của Playwright,
   * từ đó tự động gợi ý code (IntelliSense) cực kỳ tiện lợi cho học trò.
   * * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Hàm điều hướng chung
   * @param {string} path - Đường dẫn tương đối (Ví dụ: '/', '/cart.html')
   */
  async navigate(path) {
    await this.page.goto(path);
    // Demoblaze đôi khi load data API hơi chậm. 
    // Chúng ta có thể dùng domcontentloaded thay vì networkidle để tránh timeout khi có script chạy ngầm.
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * BÍ KÍP ĐẶC TRỊ DEMOBLAZE: Xử lý Dialog (Alert/Confirm)
   * Hàm này sẽ lắng nghe sự kiện alert hiện lên, lấy ra câu thông báo, sau đó bấm OK.
   * Rất cần thiết khi test luồng Đăng ký / Đăng nhập / Thêm vào giỏ hàng trên trang này.
   * * @returns {Promise<string>} - Trả về nội dung text của Alert để làm Assertions
   */
  async acceptAlertAndGetText() {
    return new Promise((resolve) => {
      // Dùng once thay vì on để event listener chỉ kích hoạt 1 lần cho hành động tiếp theo
      this.page.once('dialog', async (dialog) => {
        const message = dialog.message(); // Lấy text (VD: "Sign up successful")
        await dialog.accept();            // Bấm nút OK trên alert
        resolve(message);                 // Trả text về cho test script
      });
    });
  }

  /**
   * Wrapper cho hành động Click
   * Dù Playwright có auto-wait, nhưng viết thế này giúp ta dễ dàng thêm Try/Catch 
   * hoặc custom log report sau này nếu dự án phình to.
   * * @param {import('@playwright/test').Locator} locator 
   */
  async clickElement(locator) {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  /**
   * Wrapper cho hành động Nhập text (Fill)
   * @param {import('@playwright/test').Locator} locator 
   * @param {string} text 
   */
  async fillText(locator, text) {
    await locator.waitFor({ state: 'visible' });
    // clear data cũ trước khi điền data mới để đảm bảo an toàn
    await locator.clear(); 
    await locator.fill(text);
  }

  /**
   * Hàm lấy text an toàn
   * @param {import('@playwright/test').Locator} locator 
   * @returns {Promise<string>}
   */
  async getText(locator) {
    await locator.waitFor({ state: 'visible' });
    // innerText() lấy text hiển thị trên UI, sạch hơn textContent()
    return await locator.innerText(); 
  }
}

// Bắt buộc phải export ra để các class con (như LoginPage) có thể kế thừa
module.exports = BasePage;