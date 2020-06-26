const Logger = require("./logger")
const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')
const log = require('lighthouse-logger');

class LighthouseAuditor {

	constructor(baseUrl) {
		this.baseUrl = baseUrl;
		this.logger = new Logger(this);

		// Récuépration des éléments à auditer.
		this.current = 0;

		this.urlsList = this.logger.read('../lighthouse-selection')
			.filter(item => {
				return item[1] == 1
			}).map(item => {
				return item[0]
			})
	}

	run() {
		log.setLevel('info');

		this.auditNext();

	}

	auditNext(){
		chromeLauncher.launch({chromeFlags: ['--headless']})
			.then(chrome => this.onChromLaunched(chrome))
			.catch(console.log)
	}

	onChromLaunched(chrome) {
		const url = this.urlsList[this.current];
		console.log('next ' + url)
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

		this.logger.log('lighthouse', '', logData, url);
		this.onDone(chrome);
	}

	onDone(chrome, e) {
		if(e){
			console.log(e);
		}
		chrome.kill()
		this.current++;
		if( this.current <= this.urlsList.length ){
			this.auditNext();
		}
		else{
			process.exit();
		}
	}
}

module.exports = LighthouseAuditor;
