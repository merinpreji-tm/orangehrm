class PersonalDetails{
    constructor(){
        this.$firstName = () => $(`//input[@name="firstName"]`);
        this.$middleName = () => $(`//input[@name="middleName"]`);
        this.$lastName = () => $(`//input[@name="lastName"]`);
        this.$employeeId = () => $(`//label[text()='Employee Id']/../..//input`);
        this.$otherId = () => $(`//label[text()='Other Id']/../..//input`);
        this.$drivingLicenseNumber = () => $(`//label[text()="Driver's License Number"]/../..//input`);
        this.$licenseExpiryDate = () => $(`//label[text()="License Expiry Date"]/../..//input`);
        this.$nationality = () => $(`//label[text()="Nationality"]/../..//div[@class="oxd-select-text-input"]`);
        this.$nationalityOption = (nat) => $(`//span[text()="${nat}"]`);
        this.$maritalStatus = () => $(`//label[text()="Marital Status"]/../..//div[@class="oxd-select-text-input"]`);
        this.$maritalStatusOption = (maritalStat) => $(`//span[text()="${maritalStat}"]`);
        this.$dateOfBirth = () => $(`//label[text()="Date of Birth"]/../..//input`);
        this.$gender = (gender) => $(`//label[text()="${gender}"]//span[@class="oxd-radio-input oxd-radio-input--active --label-right oxd-radio-input"]`);
        this.$genderSelected = (gender) => $(`//label[text()="${gender}"]//input[@type="radio"]`);

        this.$bloodType = () => $(`//label[text()="Blood Type"]/../..//div[@class="oxd-select-wrapper"]`);
        this.$bloodTypeOption = (bloodGroup) => $(`//div[@class="oxd-select-option"]/span[text()="${bloodGroup}"]`)
        this.$testField = () => $(`//label[text()="Test_Field"]/../..//input`);

        this.$addButton = (section) => $(`//h6[text()='${section}']/..//button[@type="button"]`);
        this.$selectFile = () => $(`//div[@class="oxd-file-div oxd-file-div--active"]`);
        this.$fileInput = () => $(`//input[@type="file"]`);
        this.$comments = () => $(`//label[text()="Comment"]/../..//textarea`);
        this.$saveButton = (section) => $(`//h6[text()="${section}"]/..//button[@type="submit"]`);
    }

    async clearAll(){
        await browser.keys(['Control', 'a']);
        await browser.keys('Backspace');
    }

    async savePersonalDetails(firstName, middleName, lastName, employeeId, otherId, drivingLicenseNumber, 
        drivingLicenseExpiryDate, nationality, maritalStatus, dob, gender){
        await this.$firstName().click();
        await this.clearAll();
        await this.$firstName().setValue(firstName);
        await this.$middleName().click();
        await this.clearAll();
        await this.$middleName().setValue(middleName);
        await this.$lastName().click();
        await this.clearAll();
        await this.$lastName().setValue(lastName);
        await this.$employeeId().click();
        await this.clearAll();
        await this.$employeeId().setValue(employeeId);
        await this.$otherId().click();
        await this.clearAll();
        await this.$otherId().setValue(otherId);
        await this.$drivingLicenseNumber().click();
        await this.clearAll();
        await this.$drivingLicenseNumber().setValue(drivingLicenseNumber);
        await this.$licenseExpiryDate().click();
        await this.clearAll();
        await this.$licenseExpiryDate().setValue(drivingLicenseExpiryDate);
        await this.$nationality().click();
        await this.$nationalityOption(nationality).click();
        await this.$maritalStatus().click();
        await this.$maritalStatusOption(maritalStatus).click();
        await this.$dateOfBirth().click();
        await this.clearAll();
        await this.$dateOfBirth().setValue(dob);
        await this.$gender(gender).click();
        await this.$saveButton('Personal Details').click();
    }
    async saveCustomFields(bloodGroup, testValue){
        await this.$bloodType().click();
        await this.$bloodTypeOption(bloodGroup).click();
        await this.$testField().click();
        await this.clearAll();
        await this.$testField().setValue(testValue);
        await this.$saveButton('Custom Fields').click();
    }
    async addAttachments(filePath, comments){
        await this.$addButton('Attachments').click();
        // await this.$selectFile().click();
        await this.$fileInput().waitForExist({ timeout: 5000 });
        await this.$fileInput().waitForEnabled({ timeout: 5000 });
        const remoteFilePath = await browser.uploadFile(filePath);
        console.log('✅ Uploaded local file to remote path:', remoteFilePath);
        await this.$fileInput().setValue(remoteFilePath);
        await this.$comments().click();
        await this.clearAll();
        await this.$comments().setValue(comments);
        await this.$saveButton('Add Attachment').click();
    }
}
export default new PersonalDetails();