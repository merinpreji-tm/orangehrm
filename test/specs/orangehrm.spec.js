import testData from "../testData/testData.json";
import commonPage from "../pageobjects/common-page";
import dashboard from "../pageobjects/dashboard";
import adminPage from "../pageobjects/admin-page";
import addUser from "../pageobjects/add-user";
import myInfoPage from "../pageobjects/my-info-page";
import personalDetailsPage from "../pageobjects/personal-details-page";
import qualificationsPage from "../pageobjects/qualifications-page";

describe('Verify that the admin can add a new user, search for the created user and save Personal Details and Qualifications', function(){
  it('Launch the landing page', async ()=> {
    await commonPage.launchUrl();
    await expect(browser).toHaveTitle('OrangeHRM');
  });
  it('Check successful login to the application with correct username and password', async ()=> {
    await commonPage.loginToTheApplication(testData.login.username,testData.login.password);
    await expect(await commonPage.$pageHeading('Dashboard')).withContext('Expected Dashboard to be displayed').toBeDisplayed();
    expect(await commonPage.$pageHeading('Dashboard').isDisplayed()).withContext('Expected Dashboard to be displayed').toBeTrue();
  });
  it('Check the successful navigation to Admin page', async () => {
    await dashboard.$sideMenu('Admin').click();
    expect(await commonPage.$pageHeading('Admin')).withContext('Expected Admin title to be displayed').toBeDisplayed();
  });
  it('Check the successful navigation to Add User page', async () => {
    await adminPage.$addUserButton().click();
    await expect(await commonPage.$pageHeading('Add User')).withContext('Expected Add User to be displayed').toBeDisplayed();
  });
  it('Check that admin can add a user successfully by giving valid User Role, Employee Name, Status, Username, Password and Confirm Password', async () => {
    await addUser.addNewUser(testData.user.userRole,testData.user.searchValue,testData.user.status,testData.user.username,testData.user.password);
    await expect(await commonPage.$pageHeading('Admin')).withContext('Expected Admin to be displayed').toBeDisplayed();
  });
  it('Check that the user can upload files in the Attachments section of Personal Details successfully', async () => {
    await commonPage.$pageHeading('Attachments').scrollIntoView({block: 'center'});
    await personalDetailsPage.addAttachments(testData.personalDetails.filePath, testData.personalDetails.comments);
  });
});