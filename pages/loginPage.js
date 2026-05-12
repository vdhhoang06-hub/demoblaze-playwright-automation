// pages/loginPage.js
const BasePage = require('./basePage');

class LoginPage extends BasePage {
  /**
   * Khởi tạo LoginPage kế thừa từ BasePage
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // BƯỚC 1: ĐỊNH NGHĨA LOCATORS

    // 1. Nút "Log in" trên thanh menu (Sử dụng getByRole - Ưu tiên hàng đầu)
    this.loginNavLink = page.getByRole('link', { name: 'Log in' });

    /* --- BÀI HỌC THỰC CHIẾN TỪ SƯ PHỤ ---
      Theo quy tắc, đáng lẽ ta dùng: page.getByLabel('Username:')
      Tuy nhiên, trang Demoblaze code HTML bị lỗi Accessibility (tiếp cận).
      Thẻ <label for="log-name"> nhưng ô <input> lại có id="loginusername".
      Vì chúng không khớp nhau, Playwright không thể tìm thấy qua label.
      
      Trong dự án thực tế, sư phụ sẽ yêu cầu Dev thêm thẻ `data-testid="login-username"`.
      Vì ta không sửa được code của Demoblaze, ta đành dùng CSS ID (#) thay thế. 
      ID vẫn tốt hơn là XPath dài ngoằng.
    */
    this.usernameInput = page.locator('#loginusername');
    this.passwordInput = page.locator('#loginpassword');

    // Nút "Log in" bên trong form (Sử dụng getByRole)
    this.submitLoginBtn = page.getByRole('button', { name: 'Log in' });

    // Tên user hiển thị trên thanh menu sau khi login thành công (Dùng để Assert)
    this.nameDisplay = page.locator('#nameofuser');
  }

  // BƯỚC 2: ĐỊNH NGHĨA CÁC HÀM HÀNH ĐỘNG (ACTIONS)

  /**
   * Mở popup đăng nhập từ trang chủ
   */
  async openLoginModal() {
    await this.clickElement(this.loginNavLink);
  }

  /**
   * Điền thông tin và click đăng nhập
   * Chú ý: Hàm này tiêu thụ data từ file JSON mà ta sẽ truyền vào từ Test Script
   * @param {string} username 
   * @param {string} password 
   */
  async performLogin(username, password) {
    await this.fillText(this.usernameInput, username);
    await this.fillText(this.passwordInput, password);
    await this.clickElement(this.submitLoginBtn);
  }

  /**
   * Lấy lời chào hiển thị trên góc phải để kiểm tra đăng nhập thành công
   * @returns {Promise<string>}
   */
  async getWelcomeMessage() {
    return await this.getText(this.nameDisplay);
  }
}

module.exports = LoginPage;