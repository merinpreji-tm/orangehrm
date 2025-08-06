import testData from "../testData/testData.json";
import commonPage from "../pageobjects/common-page";
import dashboard from "../pageobjects/dashboard";
import adminPage from "../pageobjects/admin-page";
import addUser from "../pageobjects/add-user";
import myInfoPage from "../pageobjects/my-info-page";
import personalDetailsPage from "../pageobjects/personal-details-page";
import qualificationsPage from "../pageobjects/qualifications-page";

describe('TC-01 | Verify that the admin can add a new user', function(){
  it('Launch the landing page and verify the title to be "OrangeHRM"', async () => {
    await commonPage.launchUrl();
    await expect(browser).toHaveTitle('OrangeHRM');
  });
  it('Check successful login to the application with correct username, password and verify that the dashboard is displayed.', async ()=> {
    await commonPage.loginToTheApplication(testData.login.username,testData.login.password);
    await expect(await commonPage.$pageHeading('Dashboard')).withContext('Expected Dashboard to be displayed').toBeDisplayed();
    expect(await commonPage.$pageHeading('Dashboard').isDisplayed()).withContext('Expected Dashboard to be displayed').toBeTrue();
  });
  it('Check the successful navigation to Admin page and verify the page title to be "Admin"', async () => {
    await dashboard.$sideMenu('Admin').click();
    expect(await commonPage.$pageHeading('Admin')).withContext('Expected Admin title to be displayed').toBeDisplayed();
  });
  it('Check the successful navigation to Add User page and verify the page title to be "Add User"', async () => {
    await adminPage.$addUserButton().click();
    await expect(await commonPage.$pageHeading('Add User')).withContext('Expected Add User to be displayed').toBeDisplayed();
  });
  it('Check that admin can add a user successfully by giving valid User Role, Employee Name, Status, Username, Password, Confirm Password and verify that the user is navigated back to the Admin Page', async () => {
    await addUser.addNewUser(testData.user.userRole,testData.user.searchValue,testData.user.status,testData.user.username,testData.user.password);
    await expect(await commonPage.$pageHeading('Admin')).withContext('Expected Admin to be displayed').toBeDisplayed();
  });
});

describe('TC-02 | Verify that the admin can search for the created user', function(){
  it('Launch the landing page and verify the title to be "OrangeHRM"', async () => {
    await commonPage.launchUrl();
    await expect(browser).toHaveTitle('OrangeHRM');
  });
  it('Check successful login to the application with correct username, password and verify that the dashboard is displayed.', async ()=> {
    await commonPage.loginToTheApplication(testData.login.username,testData.login.password);
    await expect(await commonPage.$pageHeading('Dashboard')).withContext('Expected Dashboard to be displayed').toBeDisplayed();
    expect(await commonPage.$pageHeading('Dashboard').isDisplayed()).withContext('Expected Dashboard to be displayed').toBeTrue();
  });
  it('Check the successful navigation to Admin page and verify the page title to be "Admin"', async () => {
    await dashboard.$sideMenu('Admin').click();
    expect(await commonPage.$pageHeading('Admin')).withContext('Expected Admin title to be displayed').toBeDisplayed();
  });
  
  it('Check that the admin can search for a user successfully by giving valid User Role, Employee Name, Status, Username and verify that searched user(s) is/are displayed', async () => {
    await commonPage.$pageSubHeading('System Users').waitForDisplayed({timeout: 10000});
    await adminPage.searchUser(testData.user.userRole,testData.user.searchValue,testData.user.status,testData.user.username);
    await expect(await adminPage.$recordsFound()).toBeDisplayed();
    await expect(await adminPage.$usernameCell()).toHaveText(testData.user.username);
    await expect(await adminPage.$userRoleCell()).toHaveText(testData.user.userRole);
    await expect(await adminPage.$employeeNameCell()).toHaveText(testData.user.employeeName);
    await expect(await adminPage.$statusCell()).toHaveText(testData.user.status);
  });
});

describe("TC-03 | Verify that the admin can save Personal Details in 'My Info' section", function(){
  it('Launch the landing page and verify the title to be "OrangeHRM"', async () => {
    await commonPage.launchUrl();
    await expect(browser).toHaveTitle('OrangeHRM');
  });
  it('Check successful login to the application with correct username, password and verify that the dashboard is displayed.', async ()=> {
    await commonPage.loginToTheApplication(testData.login.username,testData.login.password);
    await expect(await commonPage.$pageHeading('Dashboard')).withContext('Expected Dashboard to be displayed').toBeDisplayed();
    expect(await commonPage.$pageHeading('Dashboard').isDisplayed()).withContext('Expected Dashboard to be displayed').toBeTrue();
  });
  
  it('Check the successful navigation to My Info page and verify the page title to be "PIM"', async () => {
    await dashboard.$sideMenu('My Info').click();
    expect(await commonPage.$pageHeading('PIM')).withContext('Expected PIM title to be displayed').toBeDisplayed();
  });
  it('Check that the user can save the personal details successfully with valid Employee Full Name, Employee Id, Other Id, Driver\'s License Number, License Expiry Date, Nationality, Marital Status, Date of Birth, Gender and verify that the saved details are correctly displayed in the respective input fields', async () => {
    await commonPage.$pageHeading('Personal Details').waitForDisplayed({timeout:4000});
    await expect(await myInfoPage.$activeItem('Personal Details')).toBeDisplayed();
    await personalDetailsPage.savePersonalDetails(testData.personalDetails.firstName, testData.personalDetails.middleName, testData.personalDetails.lastName, testData.personalDetails.employeeId, testData.personalDetails.otherId, testData.personalDetails.drivingLicenseNumber, testData.personalDetails.drivingLicenseExpiryDate, testData.personalDetails.nationality, testData.personalDetails.maritalstatus, testData.personalDetails.dob, testData.personalDetails.gender);
    await expect(await personalDetailsPage.$firstName()).toHaveValue(testData.personalDetails.firstName);
    await expect(await personalDetailsPage.$middleName()).toHaveValue(testData.personalDetails.middleName);
    await expect(await personalDetailsPage.$lastName()).toHaveValue(testData.personalDetails.lastName);
    await expect(await personalDetailsPage.$employeeId()).toHaveValue(testData.personalDetails.employeeId);
    await expect(await personalDetailsPage.$otherId()).toHaveValue(testData.personalDetails.otherId);
    await expect(await personalDetailsPage.$drivingLicenseNumber()).toHaveValue(testData.personalDetails.drivingLicenseNumber);
    await expect(await personalDetailsPage.$licenseExpiryDate()).toHaveValue(testData.personalDetails.drivingLicenseExpiryDate);
    await expect(await personalDetailsPage.$nationality()).toHaveText(testData.personalDetails.nationality);
    await expect(await personalDetailsPage.$maritalStatus()).toHaveText(testData.personalDetails.maritalStatus);
    await expect(await personalDetailsPage.$dateOfBirth()).toHaveValue(testData.personalDetails.dob);
    await expect(await personalDetailsPage.$genderSelected(testData.personalDetails.gender)).toBeSelected();
  });
  it('Check that the user can save the Custom Fields in Personal Details successfully with valid Blood Type, Test Field and verify that the saved details are correctly displayed in the respective input fields', async () => {
    await commonPage.$pageHeading('Custom Fields').scrollIntoView({block: 'center'});
    await personalDetailsPage.saveCustomFields(testData.personalDetails.bloodGroup, testData.personalDetails.testValue);
    await expect(await personalDetailsPage.$bloodType()).toHaveText(testData.personalDetails.bloodGroup);
    await expect(await personalDetailsPage.$testField()).toHaveValue(testData.personalDetails.testValue);
  });
  xit('Check that the user can upload files in the Attachments section of Personal Details successfully', async () => {
    await commonPage.$pageHeading('Attachments').scrollIntoView({block: 'center'});
    await personalDetailsPage.addAttachments(testData.personalDetails.filePath, testData.personalDetails.comments);
  });
});

describe('TC-04 | Verify that the admin can save Qualifications details in "My Info" section', function(){
  it('Launch the landing page and verify the title to be "OrangeHRM"', async () => {
    await commonPage.launchUrl();
    await expect(browser).toHaveTitle('OrangeHRM');
  });
  it('Check successful login to the application with correct username, password and verify that the dashboard is displayed.', async ()=> {
    await commonPage.loginToTheApplication(testData.login.username,testData.login.password);
    await expect(await commonPage.$pageHeading('Dashboard')).withContext('Expected Dashboard to be displayed').toBeDisplayed();
    expect(await commonPage.$pageHeading('Dashboard').isDisplayed()).withContext('Expected Dashboard to be displayed').toBeTrue();
  });
  
  it('Check the successful navigation to My Info page and verify the page title to be "PIM"', async () => {
    await dashboard.$sideMenu('My Info').click();
    expect(await commonPage.$pageHeading('PIM')).withContext('Expected PIM title to be displayed').toBeDisplayed();
  });
  
  it('Check successful navigation to Qualifications in My Info menu and verify that the "Qualifications" menu is highlighted', async () =>{
    await myInfoPage.$subMenu('Qualifications').scrollIntoView({block: 'center'})
    await myInfoPage.$subMenu('Qualifications').click();
    await expect(myInfoPage.$activeItem('Qualifications')).toBeDisplayed();
  });
  it('Check that the user can save the Work Experience details in Qualifications successfully with valid Company, Tob Title, From, To and Comment, and verify that the saved records displays all the entered details correctly', async () => {
    await qualificationsPage.saveWorkExperience(testData.workExperience.companyName,testData.workExperience.jobTitle,testData.workExperience.fromDate,testData.workExperience.toDate,testData.workExperience.comments);
    // await expect(await qualificationsPage.checkDataIsPresent(companyName)).toBeTrue();
    await expect(await qualificationsPage.$checkSavedRecord(testData.workExperience.companyName)).toBeDisplayed();
    await expect(await qualificationsPage.$checkSavedRecord(testData.workExperience.jobTitle)).toBeDisplayed();
    await expect(await qualificationsPage.$checkSavedRecord(testData.workExperience.fromDate)).toBeDisplayed();
    await expect(await qualificationsPage.$checkSavedRecord(testData.workExperience.toDate)).toBeDisplayed();
    await expect(await qualificationsPage.$checkSavedRecord(testData.workExperience.comments)).toBeDisplayed();
  });
  it('Check that the user can save the Education details in Qualifications successfully with valid Levels, Institute, Major/Specialization, Year, GPA/Score, Start Date and End Date, and verify that the saved records displays all the entered details correctly', async () => {
    await qualificationsPage.saveEducationDetails(testData.education.level, testData.education.institute, testData.education.specialization, testData.education.year, testData.education.score, testData.education.startDate, testData.education.endDate);
    await expect(await qualificationsPage.$checkSavedRecord(testData.education.level)).toBeDisplayed();
    await expect(await qualificationsPage.$checkSavedRecord(testData.education.year)).toBeDisplayed();
    await expect(await qualificationsPage.$checkSavedRecord(testData.education.score)).toBeDisplayed();
  });
  it('Check that the user can save the Skill details in Qualifications successfully with valid Skill, Years of Experience and Comments, and verify that the saved records displays all the entered details correctly', async () => {
    await qualificationsPage.saveSkills(testData.skills.skill, testData.skills.yearOfExperience, testData.skills.comments);
    await expect(await qualificationsPage.$checkSavedRecord(testData.skills.skill)).toBeDisplayed();
    await expect(await qualificationsPage.$checkSavedRecord(testData.skills.yearOfExperience)).toBeDisplayed();
  });
  it('Check that the user can save the Languages in Qualifications successfully with valid Language, Fluency, Competency and Comments, and verify that the saved records displays all the entered details correctly', async () => {
    await qualificationsPage.saveLanguages(testData.languages.language, testData.languages.fluency, testData.languages.competency, testData.languages.comments);
    await expect(await qualificationsPage.$checkSavedRecord(testData.languages.language)).toBeDisplayed();
    await expect(await qualificationsPage.$checkSavedRecord(testData.languages.fluency)).toBeDisplayed();
    await expect(await qualificationsPage.$checkSavedRecord(testData.languages.competency)).toBeDisplayed();
    await expect(await qualificationsPage.$checkSavedRecord(testData.languages.comments)).toBeDisplayed();
  });
  it('Check that the user can save the License details in Qualifications successfully with valid License Type, License Number, Issued Date and Expiry Date, and verify that the saved records displays all the entered details correctly', async () => {
    await qualificationsPage.saveLicenseDetails(testData.licenseDetails.licenseType, testData.licenseDetails.licenseNumber, testData.licenseDetails.issuedDate, testData.licenseDetails.expiryDate);
    await expect(await qualificationsPage.$checkSavedRecord(testData.licenseDetails.licenseType)).toBeDisplayed();
    await expect(await qualificationsPage.$checkSavedRecord(testData.licenseDetails.issuedDate)).toBeDisplayed();
    await expect(await qualificationsPage.$checkSavedRecord(testData.licenseDetails.expiryDate)).toBeDisplayed();
  });
  // Add attachments
});