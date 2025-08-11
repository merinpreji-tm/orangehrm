import { google } from 'googleapis';
import fs from 'fs/promises'; // Use fs.promises for async file operations
import path from 'path';

export default class GoogleSheetsSummary {
    constructor() {
        this.spreadsheetId = process.env.SPREADSHEET_ID;
        this.credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
        this.runName = process.env.RUN_NAME || 'Unnamed Run';
        this.testResults = [];
        this.sheetsClient = null;
    }

    async initializeSheetsClient() {
        try {
            const auth = new google.auth.GoogleAuth({
                credentials: this.credentials,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
            const client = await auth.getClient();
            this.sheetsClient = google.sheets({ version: 'v4', auth: client });
        } catch (error) {
            console.error('Error initializing Google Sheets client:', error);
            throw error;
        }
    }

    async addTestSummaryToSheet() {
        const folderPath = "test/.artifacts/json-reports";
        if (!this.sheetsClient) {
            await this.initializeSheetsClient();
        }

        console.log(`Reading test results from: ${folderPath}`);
        try {
            const files = await fs.readdir(folderPath);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(folderPath, file);
                    const jsonContent = await fs.readFile(filePath, 'utf8');
                    const testData = JSON.parse(jsonContent);

                    if (Array.isArray(testData)) {
                        for (const test of testData) {
                            this.addTestResult(test);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error processing JSON files:', error);
            return;
        }

        // After processing, write the summary
        await this.writeSummaryToSheet();
    }

    addTestResult(test) {
        const suiteName = this.runName;
        const status = test.status || 'UNKNOWN';
        const error = test.error || '';
        this.testResults.push({ suiteName, testName: test.testName, status, error });
    }

    calculateSummaryStats() {
        const statsMap = {};
        for (const test of this.testResults) {
            const suite = this.runName;
            if (!statsMap[suite]) {
                statsMap[suite] = { suiteName: suite, total: 0, passed: 0, failed: 0 };
            }
            statsMap[suite].total++;
            if (test.status === 'PASSED') {
                statsMap[suite].passed++;
            } else if (test.status === 'FAILED') {
                statsMap[suite].failed++;
            }
        }
        return Object.values(statsMap);
    }

    async writeSummaryToSheet() {
        const summaryStats = this.calculateSummaryStats();
        if (summaryStats.length === 0) {
            console.log('No test results to write to Google Sheet.');
            return;
        }
        
        const values = summaryStats.map(stat => [
            stat.suiteName,
            stat.total,
            stat.passed,
            stat.failed
        ]);

        const resource = { values };
        const range = 'Summary!A2'; // Append starting from row 2

        try {
            await this.sheetsClient.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: range,
                valueInputOption: 'RAW',
                resource: resource,
            });
            console.log('Successfully wrote summary to Google Sheet.');
        } catch (error) {
            console.error('Error writing to Google Sheet:', error);
        }
    }
}

// Main execution block
async function main() {
    // You'll need to specify the folder where your test results are stored.
    // WebdriverIO with Allure reporter typically uses a folder like './allure-results'
    const resultsFolder = './allure-results'; 
    const summary = new GoogleSheetsSummary();
    await summary.addTestSummaryToSheet(resultsFolder);
}

main().catch(console.error);