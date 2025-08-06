class MyInfo{
    constructor(){
        this.$subMenu = (menu) => $(`//a[@class="orangehrm-tabs-item" and text()="${menu}"]`);
        this.$activeItem = (item) => $(`//a[@class="orangehrm-tabs-item --active" and text()='${item}']`);
    }
}
export default new MyInfo();