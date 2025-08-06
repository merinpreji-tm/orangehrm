class Dashboard {
  constructor() {
    this.$sideMenu = (menu) => $(`//ul[@class="oxd-main-menu"]/descendant::span[text()='${menu}']`);
  }
}
export default new Dashboard();