import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

export default class JSONToExcelConverter {
	constructor(outputFilePath) {
		this.outputFilePath = outputFilePath;
		this.testResults = [];
		this.workbook = new ExcelJS.Workbook();
		this.initializeStyles();
	}

	async convertJSONFolderToExcel(folderPath) {
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
			this.createTestResultSheet();
			this.writeSummary();
			this.generateExcelReport();
		} catch (error) {
			console.error('Error converting JSON to Excel:', error);
		}
	}

	addTestResult(test) {
		const suiteName = this.removeSuiteSuffix(test.suiteName || 'Default Suite');
		const error = test.error || '';
		const status = test.status || 'UNKNOWN';
		const screenshotPath = test.screenshotPath || ''; // added
		this.testResults.push({ suiteName, testName: test.testName, status, error, screenshotPath }); // edited
	}

	removeSuiteSuffix(suiteName) {
		// Check if the suiteName contains "suite" followed by a number
		const regex = /suite\d+$/i;
		if (regex.test(suiteName)) {
			// If it matches, remove "suite" followed by the number
			return suiteName.replace(regex, '');
		} else {
			// Otherwise, return the original suiteName
			return suiteName;
		}
	}

	createTestResultSheet() {
		this.worksheet = this.workbook.addWorksheet('Test Results', { views: [{ state: 'frozen', ySplit: 1 }] });

		// Define header columns
		this.worksheet.columns = [
			{ header: 'Suite Name', key: 'suiteName', width: 25 },
			{ header: 'Test Name', key: 'testName', width: 30 },
			{ header: 'Status', key: 'status', width: 15 },
			{ header: 'Error', key: 'error', width: 60 },
			{ header: 'Screenshot', key: 'screenshotPath', width: 40 } // added
		];

		// Apply styles to headers
		this.worksheet.getRow(1).eachCell(cell => {
			cell.style = this.styles.header;
		});

		let prevSuiteName = null;
		let mergeStartRow = 1;

		// Add test result rows to worksheet with styling
		this.testResults.forEach((testResult, index) => {
			const currentSuiteName = testResult.suiteName;
			if (prevSuiteName !== currentSuiteName) {
				if (mergeStartRow !== index + 1) {
					this.worksheet.mergeCells(mergeStartRow + 1, 1, index + 1, 1);
					this.worksheet.getCell(mergeStartRow + 1, 1).style = this.styles.suiteName;
				}
				mergeStartRow = index + 1;
			}
			prevSuiteName = currentSuiteName;

			const row = this.worksheet.addRow(testResult);
			row.getCell(3).alignment = { horizontal: 'center' }; // Center-align the status
			row.getCell(4).alignment = { wrapText: true }; // Wrap text for the error message
			row.eachCell(cell => {
				cell.border = this.styles.cellBorder;
			});

			// added
			const colNumber = 5; // Screenshot column
			if (testResult.screenshotPath && fs.existsSync(testResult.screenshotPath)) {
				const imageId = this.workbook.addImage({
					filename: testResult.screenshotPath,
					extension: 'png',
				});

				const rowNumber = index + 2; // Row number in Excel

				// Clear the cell value (remove text path)
				const screenshotCell = this.worksheet.getCell(rowNumber, colNumber);
				screenshotCell.value = ''; // Remove any existing text

				// Adjust column width and row height dynamically
				this.worksheet.getColumn(colNumber).width = 35; // Adjust width to fit image
				this.worksheet.getRow(rowNumber).height = 100; // Adjust height to fit image

				// Insert image in the cell
				this.worksheet.addImage(imageId, {
					tl: { col: colNumber - 1, row: rowNumber - 1 }, // Top-left position (0-indexed)
					ext: { width: 250, height: 140 }, // Image size in pixels
				});
			} else {
				const screenshotCell = this.worksheet.getCell(index + 2, colNumber);
				screenshotCell.value = 'No Screenshot';
				screenshotCell.alignment = { horizontal: 'center', vertical: 'middle' };
				screenshotCell.font = { italic: true, color: { argb: '808080' } };
			}

			if (testResult.status === 'FAILED') {
				row.getCell(3).fill = this.styles.failedFill;
			} else {
				row.getCell(3).fill = this.styles.passedFill;
			}
		});

		// Merge cells for the last suite name group if necessary
		if (mergeStartRow !== this.testResults.length) {
			this.worksheet.mergeCells(mergeStartRow + 1, 1, this.testResults.length + 1, 1);
			this.worksheet.getCell(mergeStartRow + 1, 1).style = this.styles.suiteName;
		}
	}

	writeSummary() {
		const summarySheet = this.workbook.addWorksheet('Summary');
		summarySheet.columns = [
			{ header: 'Metric', key: 'metric', width: 25 },
			{ header: 'Value', key: 'value', width: 15 },
		];

		const headerRow = summarySheet.getRow(1);
		headerRow.eachCell(cell => {
			cell.style = this.styles.summaryHeader;
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

	sanitizeErrorMessage(errorMessage) {
		if (errorMessage) {
			return errorMessage
				.replace(/[\u001b\u009b]\[\d{1,2}(;\d{1,2})?(m|K)/g, '')
				.split('\n')[0]
				.trim();
		}
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
		// Example implementation of summary stats calculation
		const passedCount = this.testResults.filter(test => test.status === 'PASSED').length;
		const failedCount = this.testResults.filter(test => test.status === 'FAILED').length;
		const totalCount = this.testResults.length;

		return [
			{ metric: 'Total Tests', value: totalCount },
			{ metric: 'Passed Tests', value: passedCount },
			{ metric: 'Failed Tests', value: failedCount },
		];

	}

	/**
	 * Creating a text-formatted report summary for use in the GitHub job summary
	 * @param {string} filePath
	 */
	writeSummaryInTextFile(filePath) {
		const testSummary = this.calculateSummaryStats()
			.map(data => Object.values(data))
			.map(values => `${values[0]}: ${values[1]}`)
			.join(', ');
		filePath = `${filePath}/test-summary.txt`;
		fs.writeFileSync(filePath, '');
		fs.appendFileSync(filePath, testSummary);
	}
}