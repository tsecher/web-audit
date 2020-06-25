const Logger = require("./logger")
const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')
const log = require('lighthouse-logger');
const fs = require('fs');

class LighthouseAuditor {

	constructor(baseUrl) {
		this.baseUrl = baseUrl;
		this.logger = new Logger(this);

		// Récuépration des éléments à auditer.
		
		this.urlsList = this.logger.read('../lighthouse-selection')
			.filter(item => {
				return item[1] == 1
			}).map(item => {
				return item[0]
			})
	}

	run() {
		log.setLevel('info');

		chromeLauncher.launch({chromeFlags: ['--headless']})
			.then(chrome => this.onChromLaunched(chrome));

	}

	onChromLaunched(chrome) {
		const options = {
			output: 'json',
			onlyCategories: ['performance', 'seo', 'best-practices', 'accessibility'],
			port: chrome.port
		};

		this.done = 0;
		this.urlsList.map(url => {
			lighthouse(url, options)
				.then(result => this.onLighthouseAudit(result, options, url, chrome))
				.catch((e) => this.onDone(chrome, e) )
		})
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

		this.logger.log('lighthouse', '', logData, url);
		this.onDone(chrome);
	}

	onDone( chrome, e) {
		console.log(e);
		this.done++;
		if ( this.done === this.urlsList.length+1) {
			console.log('done');
			chrome.kill()
			process.exit()
		}
	}
}

module.exports = LighthouseAuditor;
