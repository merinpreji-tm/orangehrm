describe('Sample test', () => {
    it('Test A - should load example.com and verify the title', async () => {
        await browser.url('https://example.com');
        const title = await browser.getTitle();
        await expect(title).toContain('Example');
    });

    it('Test B - should load playwright.dev and verify the title', async () => {
        await browser.url('https://playwright.dev');
        const title = await browser.getTitle();
        await expect(title).toContain('Playwright');
    });
});