import { google } from 'googleapis';

export default class googleSheetsSummary {
    constructor() {
        this.spreadsheetId = process.env.SPREADSHEET_ID;
        this.credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
        this.runName = process.env.RUN_NAME || 'Unnamed Run';
        this.testResults = [];
        this.sheetsClient = null;
    }

    async initializeSheetsClient() {
        // Authenticate using the credentials
        const auth = new google.auth.GoogleAuth({
            credentials: this.credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const client = await auth.getClient();
        this.sheetsClient = google.sheets({ version: 'v4', auth: client });
    }

    async readSummaryFromSheet() {
        if (!this.sheetsClient) {
            await this.initializeSheetsClient();
        }

        const range = 'Summary!A2:D'; // Assuming your summary data starts at row 2

        try {
            const response = await this.sheetsClient.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: range,
            });

            const rows = response.data.values;
            if (rows && rows.length > 0) {
                this.oldTestResults = rows.map(row => ({
                    suiteName: row[0],
                    total: row[1],
                    passed: row[2],
                    failed: row[3],
                }));
            }
        } catch (error) {
            console.error('Error reading from Google Sheet:', error);
            // Decide how to handle this, e.g., proceed with an empty summary
        }
    }

    // ... (Your addTestResult and removeSuiteSuffix methods remain the same) ...

    async writeSummaryToSheet() {
        if (!this.sheetsClient) {
            await this.initializeSheetsClient();
        }

        const summaryStats = this.calculateSummaryStats();
        const values = summaryStats.map(stat => [
            stat.suiteName,
            stat.total,
            stat.passed,
            stat.failed
        ]);

        const resource = {
            values,
        };
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

    // ... (Your calculateSummaryStats method remains the same) ...
}