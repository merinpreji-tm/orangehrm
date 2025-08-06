import fs from 'fs';
import path from 'path';

export default class JSONToCSVConverter {
	constructor(outputFilePath) {
		this.outputFilePath = outputFilePath;
		this.testResults = [];
	}

	async convertJSONFolderToCSV(folderPath) {
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
			this.generateCSVReport();
		} catch (error) {
			console.error('Error converting JSON to CSV:', error);
		}
	}

	addTestResult(test) {
		const suiteName = this.removeSuiteSuffix(test.suiteName || 'Default Suite');
		const error = test.error ? this.sanitizeErrorMessage(test.error) : '';
		const status = test.status || 'UNKNOWN';
		this.testResults.push({
			suiteName,
			testName: test.testName,
			status,
			error
		});
	}

	removeSuiteSuffix(suiteName) {
		const regex = /suite\d+$/i;
		return regex.test(suiteName) ? suiteName.replace(regex, '') : suiteName;
	}

	sanitizeErrorMessage(errorMessage) {
		return errorMessage
			.replace(/[\u001b\u009b]\[\d{1,2}(;\d{1,2})?(m|K)/g, '') // remove ANSI color codes
			.replace(/[\r\n]+/g, ' ') // remove line breaks
			.trim();
	}

	generateCSVReport() {
		const headers = ['Suite Name', 'Test Name', 'Status', 'Error'];
		const rows = this.testResults.map(result => [
			this.quote(result.suiteName),
			this.quote(result.testName),
			this.quote(result.status),
			this.quote(result.error)
		]);

		const csvContent = [
			headers.join(','),
			...rows.map(row => row.join(','))
		].join('\n');

		fs.writeFileSync(this.outputFilePath, csvContent);
		console.log(`CSV report successfully written to: ${this.outputFilePath}`);
	}

	quote(value) {
		if (typeof value !== 'string') return '';
		return `"${value.replace(/"/g, '""')}"`; // Escape double quotes
	}
}