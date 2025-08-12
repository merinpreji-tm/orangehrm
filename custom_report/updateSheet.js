import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';

export default class GoogleSheetsSummary {
    constructor() {
        this.spreadsheetId = process.env.SPREADSHEET_ID;
        this.credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
        this.project = process.env.PROJECT || '';
        this.suiteName = process.env.SUITE_NAME || '';
        this.env = process.env.ENV || '';
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

    async addTestSummaryToSheet(folderPath) {
        if (!this.sheetsClient) {
            await this.initializeSheetsClient();
        }
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
        await this.writeSummaryToSheet();
    }

    addTestResult(test) {
        const suiteName = this.suiteName;
        const status = test.status || 'UNKNOWN';
        const error = test.error || '';
        this.testResults.push({ suiteName, testName: test.testName, status, error });
    }

    async addHeaderRow(sheetName) {
        try {
            const response = await this.sheetsClient.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!A1:E1`,
            });

            const rows = response.data.values;

            if (!rows || rows.length === 0) {
                const headers = [
                    ['Project', 'Suite Name', 'Test Environment', 'Total tests', 'Passed', 'Failed', 'Pass Percentage']
                ];

                await this.sheetsClient.spreadsheets.values.update({
                    spreadsheetId: this.spreadsheetId,
                    range: `${sheetName}!A1`,
                    valueInputOption: 'RAW',
                    resource: { values: headers },
                });

                // Get sheet ID to apply formatting
                const spreadsheet = await this.sheetsClient.spreadsheets.get({
                    spreadsheetId: this.spreadsheetId,
                });

                const sheet = spreadsheet.data.sheets.find(
                    s => s.properties.title === sheetName
                );
                const sheetId = sheet?.properties?.sheetId;

                if (sheetId !== undefined) {
                    await this.sheetsClient.spreadsheets.batchUpdate({
                        spreadsheetId: this.spreadsheetId,
                        requestBody: {
                            requests: [
                                {
                                    repeatCell: {
                                        range: {
                                            sheetId: sheetId,
                                            startRowIndex: 0,
                                            endRowIndex: 1,
                                            startColumnIndex: 0,
                                            endColumnIndex: 5,
                                        },
                                        cell: {
                                            userEnteredFormat: {
                                                textFormat: { bold: true },
                                            },
                                        },
                                        fields: 'userEnteredFormat.textFormat.bold',
                                    },
                                },
                            ],
                        },
                    });
                } else {
                    console.warn(`Sheet ID not found for "${sheetName}"`);
                }
            }
        } catch (error) {
            console.error(`Failed to check/add header for sheet "${sheetName}":`, error);
        }
    }

    calculateSummaryStats() {
        const statsMap = {};
        for (const test of this.testResults) {
            const suite = this.suiteName;
            if (!statsMap[suite]) {
                statsMap[suite] = { project:this.project, suiteName: suite, env: this.env, total: 0, passed: 0, failed: 0 };
            }
            statsMap[suite].total++;
            if (test.status === 'PASSED') {
                statsMap[suite].passed++;
            } else if (test.status === 'FAILED') {
                statsMap[suite].failed++;
            }
        }
        // Calculate pass percentage for each suite
        for (const suite in statsMap) {
            const { total, passed } = statsMap[suite];
            statsMap[suite].passPercentage = total === 0 ? 0 : ((passed / total) * 100).toFixed(2);
        }
        return Object.values(statsMap);
    }

    async writeSummaryToSheet() {
        const summaryStats = this.calculateSummaryStats();
        if (summaryStats.length === 0) {
            console.log('No test results to write to Google Sheet.');
            return;
        }
        await this.addHeaderRow('Summary');
        await this.ensureSheetExists(this.suiteName);
        const values = summaryStats.map(stat => [
            stat.project,
            stat.suiteName,
            stat.env,
            stat.total,
            stat.passed,
            stat.failed,
            stat.passPercentage
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
            await this.updatePassTrendChart(this.suiteName);
        } catch (error) {
            console.error('Error writing to Google Sheet:', error);
        }
    }

    async ensureSheetExists(sheetTitle) {
        try {
            const sheetsMeta = await this.sheetsClient.spreadsheets.get({ spreadsheetId: this.spreadsheetId, });
            const sheetExists = sheetsMeta.data.sheets.some(sheet => sheet.properties.title === sheetTitle);
            if (!sheetExists) {
                console.log(`Creating sheet: ${sheetTitle}`);
                await this.sheetsClient.spreadsheets.batchUpdate({
                    spreadsheetId: this.spreadsheetId,
                    requestBody: {
                        requests: [
                            {
                                addSheet: {
                                    properties: {
                                        title: sheetTitle,
                                    },
                                },
                            },
                        ],
                    },
                });
            }
        } catch (error) {
            console.error('Error checking/creating sheet:', error);
            throw error;
        }
    }

    async updatePassTrendChart(sheetName) {
        try {
            // 1. Fetch metadata to find sheetId and row count
            const meta = await this.sheetsClient.spreadsheets.get({
                spreadsheetId: this.spreadsheetId,
                includeGridData: false,
            });

            const sheet = meta.data.sheets.find(s => s.properties.title === sheetName);
            const sheetId = sheet.properties.sheetId;
            const totalRows = sheet.properties.gridProperties.rowCount;

            // 2. Define the chart creation/update request
            const chartRequest = {
                addChart: {
                    chart: {
                        spec: {
                            title: 'Pass % Trend',
                            basicChart: {
                                chartType: 'LINE',
                                legendPosition: 'BOTTOM_LEGEND',
                                axis: [
                                    { position: 'BOTTOM_AXIS', title: 'Run # (chronological)' },
                                    { position: 'LEFT_AXIS', title: 'Pass Percentage' },
                                ],
                                domains: [
                                    {
                                        domain: {
                                            sourceRange: {
                                                sources: [
                                                    {
                                                        sheetId,
                                                        startRowIndex: 1,  // skip header
                                                        endRowIndex: totalRows,
                                                        startColumnIndex: 0, // column A: Suite Name or Run Name
                                                        endColumnIndex: 1,
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                ],
                                series: [
                                    {
                                        series: {
                                            sourceRange: {
                                                sources: [
                                                    {
                                                        sheetId,
                                                        startRowIndex: 1,
                                                        endRowIndex: totalRows,
                                                        startColumnIndex: 4, // pass %
                                                        endColumnIndex: 5,
                                                    },
                                                ],
                                            },
                                        },
                                        targetAxis: 'LEFT_AXIS',
                                    },
                                ],
                                headerCount: 1,
                            },
                        },
                        position: {
                            overlayPosition: {
                                anchorCell: { sheetId, rowIndex: 0, columnIndex: 6 },
                                offsetXPixels: 10,
                                offsetYPixels: 10,
                            },
                        },
                    },
                },
            };

            // 3. Send the batchUpdate request to add or update the chart
            await this.sheetsClient.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                requestBody: { requests: [chartRequest] },
            });

            console.log(`Trend chart updated in sheet "${sheetName}"`);
        } catch (err) {
            console.error(`Failed to update Trend chart in "${sheetName}"`, err);
        }
    }
}