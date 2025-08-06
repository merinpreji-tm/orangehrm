class Qualifications{
    constructor(){
        this.$addButton = (section) => $(`//h6[text()='${section}']/..//button[@type="button"]`);
        this.$inputElement = (section, labelName) => $(`//h6[text()="${section}"]/../../..//label[text()='${labelName}']/../..//input`);
        this.$comments = (section) => $(`//h6[text()="${section}"]/../../..//textarea`);
        this.$dropdown = (section, labelName) => $(`//h6[text()="${section}"]/../../..//label[text()="${labelName}"]/../..//div[@class="oxd-select-wrapper"]`);
        this.$dropdownOption = (option) => $(`//span[text()="${option}"]`);
        this.$saveButton = (section) => $(`//h6[text()='${section}']/../../..//button[@type="submit" and contains(normalize-space(.), "Save")]`);
        // this.$recordsFound = (section) => $(`//h6[text()='${section}']/../../..//span[@class="oxd-text oxd-text--span"]`);
        // this.$$companyNames = (section) => $$(`//h6[text()="${section}"]/../../..//div[@class="oxd-table-card"]//div[@role="cell"][2]`);
        this.$checkSavedRecord = (value) => $(`//div[text()="${value}"]`);
    }
    async saveWorkExperience(companyName, jobTitle, fromDate, toDate, comments){
        await this.$addButton('Work Experience').click();
        await this.$inputElement('Work Experience', 'Company').setValue(companyName);
        await this.$inputElement('Work Experience', 'Job Title').setValue(jobTitle);
        await this.$inputElement('Work Experience', 'From').setValue(fromDate);
        await this.$inputElement('Work Experience', 'To').setValue(toDate);
        await this.$comments('Work Experience').setValue(comments);
        await this.$saveButton('Work Experience').click();
    }
    // async checkDataIsPresent(companyName) {
    //     const elements = await this.$$companyNames('Work Experience');
    //     for (let i = 0; i < elements.length; i++) {
    //         const text = await elements[i].getText();
    //         if (text === companyName) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }
    
    async saveEducationDetails(level, institute, specialization, year, score, startDate, endDate){
        await this.$addButton('Education').click();
        await this.$dropdown('Education', 'Level').click();
        await this.$dropdownOption(level).click();
        await this.$inputElement('Education', 'Institute').setValue(institute);
        await this.$inputElement('Education', 'Major/Specialization').setValue(specialization);
        await this.$inputElement('Education', 'Year').setValue(year);
        await this.$inputElement('Education', 'GPA/Score').setValue(score);
        await this.$inputElement('Education', 'Start Date').setValue(startDate);
        await this.$inputElement('Education', 'End Date').setValue(endDate);
        await this.$saveButton('Education').click();
    }
    async saveSkills(skill, yearOfExperience, comments){
        await this.$addButton('Skills').click();
        await this.$dropdown('Skills', 'Skill').click();
        await this.$dropdownOption(skill).click();
        await this.$inputElement('Skills', 'Years of Experience').setValue(yearOfExperience);
        await this.$comments('Skills').setValue(comments);
        await this.$saveButton('Skills').click();
    }
    async saveLanguages(language, fluency, competency, comments){
        await this.$addButton('Languages').click();
        await this.$dropdown('Languages', 'Language').scrollIntoView({ block: 'center' });
        await this.$dropdown('Languages', 'Language').click();
        await this.$dropdownOption(language).click();
        await this.$dropdown('Languages', 'Fluency').click();
        await this.$dropdownOption(fluency).click();
        await this.$dropdown('Languages', 'Competency').click();
        await this.$dropdownOption(competency).click();
        await this.$comments('Languages').setValue(comments);
        await this.$saveButton('Languages').click();
    }
    async saveLicenseDetails(licenseType, licenseNumber, issuedDate, expiryDate){
        await this.$addButton('License').click();
        await this.$dropdown('License', 'License Type').scrollIntoView({ block: 'center' });
        await this.$dropdown('License', 'License Type').click();
        await this.$dropdownOption(licenseType).click();
        await this.$inputElement('License', 'License Number').setValue(licenseNumber);
        await this.$inputElement('License', 'Issued Date').setValue(issuedDate);
        await this.$inputElement('License', 'Expiry Date').setValue(expiryDate);
        await this.$saveButton('License').click();
    }
}
export default new Qualifications();