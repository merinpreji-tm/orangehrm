class CommonPage {
  constructor() {
    this.$username = () => $(`//input[@name="username"]`);
    this.$password = () => $(`//input[@name="password"]`);
    this.$loginButton = () => $(`//button[contains(@class,'orangehrm-login-button')]`);
    this.$pageHeading = (heading) => $(`//h6[text()='${heading}']`);
    this.$pageSubHeading = (subHeading) => $(`//h5[text()='${subHeading}']`);
  }
  async launchUrl(){
    await browser.url('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await browser.maximizeWindow();
  }
 
  async loginToTheApplication(loginUsername,loginPassword){
    await this.$username().setValue(loginUsername);
    await this.$password().setValue(loginPassword);
    await this.$loginButton().click();
  }

  async scroll(){
    await browser.execute(() => window.scrollBy(0, 500)); // scrolls down 500px
  }
}
export default new CommonPage();