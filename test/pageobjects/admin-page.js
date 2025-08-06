class AdminPage {
  constructor() {
    this.$username = () => $(`//label[text()="Username"]/../..//input[@class="oxd-input oxd-input--active"]`);
    this.$userRoleDropdown = () => $(`//label[contains(text(),"User Role")]/../..//div[@class="oxd-select-wrapper"]`);
    this.$userRoleOption = (role) => $(`//div[@class="oxd-select-dropdown --positon-bottom"]/descendant::span[text()='${role}']`);
    this.$userRoleSelectedOption = () => $(`//label[contains(text(),"User Role")]/../..//div[@class="oxd-select-text-input"]`);
    this.$employeeName = () => $(`//label[text()='Employee Name']/../..//div[@class="oxd-autocomplete-wrapper"]`);
    this.$employeeNameOption = (name) => $(`//div[@role="option"]//span[text()="${name}"]`);
    this.$employeeNameSelectedOption = () => $(`//div[@class="oxd-autocomplete-text-input oxd-autocomplete-text-input--active"]`);
    this.$statusDropdown = () => $(`//label[contains(text(),"Status")]/../..//div[@class="oxd-select-wrapper"]`);
    this.$statusOption = (status) => $(`//div[@class="oxd-select-dropdown --positon-bottom"]/descendant::span[text()='${status}']`);
    this.$statusSelectedOption = () => $(`//label[contains(text(),"Status")]/../..//div[@class="oxd-select-text-input"]`);
    this.$searchButton = () => $(`//button[text()=' Search ']`);
    this.$addUserButton = () => $(`//button[contains(@class,'oxd-button') and .//i[contains(@class,'bi-plus')]]`);
    this.$recordsFound = () => $(`//span[@class="oxd-text oxd-text--span" and text()='(1) Record Found']`);
    this.$usernameCell = () => $(`//div[@class="oxd-table-card"][1]//div[@role="cell"][2]//div`);
    this.$userRoleCell = () => $(`//div[@class="oxd-table-card"][1]//div[@role="cell"][3]//div`);
    this.$employeeNameCell = () => $(`//div[@class="oxd-table-card"][1]//div[@role="cell"][4]//div`);
    this.$statusCell = () => $(`//div[@class="oxd-table-card"][1]//div[@role="cell"][5]//div`);
  }

  async searchUser(role,name,status,username) {
    // Select User Role
    await this.$userRoleDropdown().click();
    await this.$userRoleOption(role).click();
    await expect(await this.$userRoleSelectedOption()).toHaveText(role);
    // Enter Employee Name
    await this.$employeeName().click();
    await browser.keys(name);
    await this.$employeeNameOption(name).waitForDisplayed({ timeout: 6000, timeoutMsg: 'Expected options for Employee Name to be displayed'});
    await this.$employeeNameOption(name).click();
    await expect(await this.$employeeNameSelectedOption()).toExist();
    // Select Status
    await this.$statusDropdown().click();
    await this.$statusOption(status).click();
    await expect(await this.$statusSelectedOption()).toHaveText(status);
    // Enter Username
    await this.$username().setValue(username);
    // Click on Search
    await this.$searchButton().click();
  }
}
export default new AdminPage();