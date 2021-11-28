const ChromeParser = require('./parser/chrome-parser');
const lighthouse = require('lighthouse')
const Average = require("./report/average");

class LighthouseAuditor extends ChromeParser {

	constructor(baseUrl, selectionFile, defaultLogName) {
		super(baseUrl, selectionFile, defaultLogName);
		this.average = new Average(this);
	}

	process(chrome, url) {

		const options = {
			output: 'json',
			onlyCategories: ['performance', 'seo', 'best-practices', 'accessibility'],
			port: chrome.port
		};

		lighthouse(url, options)
			.then(result => this.onLighthouseAudit(result, options, url, chrome))
			.catch((e) => this.onDone(chrome, e))
	}


	onLighthouseAudit(runnerResult, options, url, chrome) {
		const result = JSON.parse(runnerResult.report)
		const logData = {}
		options.onlyCategories.map(cat => {
			try {
				logData[cat] = result.categories[cat].score
			} catch (e) {
			}
		})

		this.average.add(logData);
		console.log(JSON.stringify(logData))
		this.logger.log(this.logger.defaultName, '', logData, url);
		this.onDone(chrome);
	}

	endProcess() {
		this.average.showAverage()
	}

}

module.exports = LighthouseAuditor;
