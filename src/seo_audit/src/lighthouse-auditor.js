const ChromeParser = require('./parser/chrome-parser');
const lighthouse = require('lighthouse')

class LighthouseAuditor extends ChromeParser {

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

		console.log(JSON.stringify(logData))
		this.logger.log('lighthouse', '', logData, url);
		this.onDone(chrome);
	}

}

module.exports = LighthouseAuditor;
