class AddUser {
  constructor() {
    this.$userRoleDropdown = () => $(`//label[contains(text(),"User Role")]/../..//div[@class="oxd-select-wrapper"]`);
    this.$userRoleOption = (role) => $(`//div[@class="oxd-select-dropdown --positon-bottom"]/descendant::span[text()='${role}']`);
    this.$userRoleSelectedOption = () => $(`//label[contains(text(),"User Role")]/../..//div[@class="oxd-select-text-input"]`);
    this.$employeeName = () => $(`//label[text()='Employee Name']/../..//div[@class="oxd-autocomplete-wrapper"]`);
    this.$employeeNameOption = (name) => $(`//div[@role="option"]//span[text()="${name}"]`);
    this.$employeeNameSelectedOption = () => $(`//div[@class="oxd-autocomplete-text-input oxd-autocomplete-text-input--active"]`);

    this.$statusDropdown = () => $(`//label[contains(text(),"Status")]/../..//div[@class="oxd-select-wrapper"]`);
    this.$statusOption = (status) => $(`//div[@class="oxd-select-dropdown --positon-bottom"]/descendant::span[text()='${status}']`);
    this.$statusSelectedOption = () => $(`//label[contains(text(),"Status")]/../..//div[@class="oxd-select-text-input"]`);
    this.$username = () => $(`//label[text()='Username']/../..//input[contains(@class, "oxd-input--active")]`);
    this.$usernameAfterInput = () => $(`//label[text()='Username']/../..//input[@class="oxd-input oxd-input--active"]`);

    this.$password = () => $(`//label[text()='Password']/../..//input[@class="oxd-input oxd-input--active"]`);
    this.$confirmPassword = () => $(`//label[text()='Confirm Password']/../..//input[@class="oxd-input oxd-input--active"]`);
    this.$saveButton = () => $(`//button[@type="submit"]`);
  }
  
  async addNewUser(role,name,status,username,password) {
    await this.$userRoleDropdown().click();
    await this.$userRoleOption(role).click();
    await expect(await this.$userRoleSelectedOption()).toHaveText(role);
    await this.$employeeName().click();
    await browser.keys(name);
    await this.$employeeNameOption(name).waitForDisplayed({ timeout: 6000, timeoutMsg: 'Expected options for Employee Name to be displayed'});
    await this.$employeeNameOption(name).click();
    await expect(await this.$employeeNameSelectedOption()).toExist();
    await this.$statusDropdown().click();
    await this.$statusOption(status).click();
    await expect(await this.$statusSelectedOption()).toHaveText(status);
    await this.$username().setValue(username);
    await this.$password().setValue(password);
    await this.$confirmPassword().setValue(password);
    await this.$saveButton().click();
  }
}
export default new AddUser();