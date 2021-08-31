const UrlTools = require('../tools/url-tools');
const Logger = require("../tools/logger")
const chromeLauncher = require('chrome-launcher')
const log = require('lighthouse-logger');

class ChromeParser extends UrlTools {

    constructor(baseUrl, selectionFile) {
        super(baseUrl)

        this.logger = new Logger(this);

        // Récuépration des éléments à auditer.
        this.current = 0;

        this.urlsList = this.logger.read(selectionFile)
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

    auditNext() {
        chromeLauncher.launch({chromeFlags: ['--headless']})
            .then(chrome => this.onChromLaunched(chrome))
            .catch(console.log)
    }

    onChromLaunched(chrome) {
        const url = this.urlsList[this.current];
        if (url) {
            console.log('try : ' + url);
            this.process(chrome, url);
        } else {
            this.onDone(chrome, null)
        }

    }

    onDone(chrome, e) {
        if (e) {
            console.log(e);
        }
        chrome.kill()
        this.current++;
        if (this.current <= this.urlsList.length) {
            this.auditNext();
        } else {
            process.exit();
        }
    }
}


module.exports = ChromeParser;
