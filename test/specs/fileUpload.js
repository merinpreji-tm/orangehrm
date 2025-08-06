describe('Verify that attachment can be uploaded', function(){
  it('Upload attachment', async ()=> {
    await browser.url('http://uitestingplayground.com/upload');
    // await browser.url('https://www.playground.testingmavens.tools/components/upload');
    await browser.maximizeWindow();
    await expect(browser).toHaveTitle('File Upload');

    const iframe = await $('iframe[src="/static/upload.html"]');
    await iframe.waitForExist({ timeout: 5000 });
    await browser.switchFrame(iframe);

    // Step 1: Set the path to the file you want to upload (relative to your test folder)
    const filePath = 'C:/Users/MerinPReji/Downloads/Dummy Files/file-sample_150kB.pdf'; // your file path
 
    // Step 2: Use browser.uploadFile to upload it to a temporary path
    const remoteFilePath = await browser.uploadFile(filePath);

    // // Make the input visible
    // await browser.execute(() => {
    //     document.getElementById('browse').removeAttribute('hidden');
    // });
    // If it's hidden, force it to show
    await browser.execute(() => {
        const input = document.getElementById('browse');
        if (input) input.style.display = 'block';
    });
    
    // Step 3: Set the value of the file input element to the uploaded file path
    const fileInput = await $('//input[@type="file"]'); // file input selector
    await fileInput.setValue(remoteFilePath);

    // Step 4: Submit the form or perform any necessary assertion
    await browser.pause(2000); // just to see it in action (not mandatory)
    await browser.switchToParentFrame();   
  });
});