import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

export default class excelSummary {
    constructor(outputFilePath) {
        this.outputFilePath = outputFilePath;
        this.oldTestResults = [];
        this.testResults = [];
        this.workbook = new ExcelJS.Workbook();
        this.runName = process.env.RUN_NAME || 'Unnamed Run';
        this.initializeStyles();
    }

    async addTestSummaryToExcel(folderPath) {
        if (fs.existsSync(this.outputFilePath)) {
            console.log('Excel file exists!');
            await this.readExcelFile();
        } else {
            console.log('Excel file does not exist.');
        }
        try {
            const files = fs.readdirSync(folderPath);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(folderPath, file);
                    const jsonContent = await fs.promises.readFile(filePath, 'utf8');
                    const testData = JSON.parse(jsonContent);
                    if (Array.isArray(testData)) {
                        for (const test of testData) {
                            this.addTestResult(test);
                        }
                    }
                }
            }
            this.writeSummary();
            this.generateExcelReport();
        } catch (error) {
            console.error('Error converting JSON to Excel:', error);
        }
    }

    async readExcelFile() {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(this.outputFilePath);
        const worksheet = workbook.getWorksheet('Summary') || workbook.worksheets[0]; // First sheet
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // skip header row
            const suiteName = row.getCell(1).value;
            const total = row.getCell(2).value;
            const passed = row.getCell(3).value;
            const failed = row.getCell(4).value;
            this.oldTestResults.push({ suiteName, total, passed, failed });
        });
    }

    addTestResult(test) {
        const suiteName = this.runName;
        const error = test.error || '';
        const status = test.status || 'UNKNOWN';
        this.testResults.push({ suiteName, testName: test.testName, status, error });
    }

    writeSummary() {
        const summarySheet = this.workbook.addWorksheet('Summary');
        summarySheet.columns = [
            { header: 'Suite Name', key: 'suiteName', width: 30 },
            { header: 'Total Tests', key: 'total', width: 15 },
            { header: 'Passed Tests', key: 'passed', width: 15 },
            { header: 'Failed Tests', key: 'failed', width: 15 }
        ];

        const headerRow = summarySheet.getRow(1);
        headerRow.eachCell(cell => {
            cell.style = this.styles.summaryHeader;
        });

        // Add old test results
        this.oldTestResults.forEach(result => {
            summarySheet.addRow({
                suiteName: result.suiteName,
                total: result.total,
                passed: result.passed,
                failed: result.failed
            });
        });
        // Add summary stats
        const summaryStats = this.calculateSummaryStats(); // Assuming you have a method for calculating summary statistics
        summaryStats.forEach(stat => {
            summarySheet.addRow(stat);
        });
        summarySheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                row.eachCell(cell => {
                    cell.style = this.styles.dataCell;
                });
            }
        });
        summarySheet.views = [{ state: 'frozen', ySplit: 1 }];
    }

    generateExcelReport() {
        this.workbook.xlsx
            .writeFile(this.outputFilePath)
            .then(() => {
                console.log(`Excel report successfully written to ${this.outputFilePath}`);
            })
            .catch(error => {
                console.error('Error writing Excel report:', error);
            });
    }

    initializeStyles() {
        this.styles = {
            header: {
                font: { name: 'Calibri', bold: true, color: { argb: 'FFFFFF' } },
                alignment: { horizontal: 'center' },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F81BD' } },
                border: this.getBorderStyle('medium'),
            },
            cellBorder: this.getBorderStyle('thin'),
            passedFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '92D050' } },
            failedFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0000' } },
            suiteName: { font: { bold: true } },
            summaryHeader: {
                font: { name: 'Calibri', bold: true, color: { argb: 'FFFFFF' } },
                alignment: { horizontal: 'center' },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '002060' } },
                border: this.getBorderStyle('medium'),
            },
            dataCell: {
                font: { name: 'Calibri', bold: false },
                alignment: { horizontal: 'center' },
                border: this.getBorderStyle('thin'),
            },
        };
    }

    getBorderStyle(style) {
        return {
            top: { style, color: { argb: '000000' } },
            left: { style, color: { argb: '000000' } },
            bottom: { style, color: { argb: '000000' } },
            right: { style, color: { argb: '000000' } },
        };
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
}