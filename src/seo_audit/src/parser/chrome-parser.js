const UrlTools = require('../tools/url-tools');
const Logger = require("../tools/logger")
const chromeLauncher = require('chrome-launcher')
const log = require('lighthouse-logger');

class ChromeParser extends UrlTools {

    constructor(baseUrl, selectionFile, defaultLogName) {
        super(baseUrl)

        this.logger = new Logger(this, defaultLogName);

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

       // this.auditNext();

        chromeLauncher.launch({
          chromeFlags: ['--headless'],
        })
        .then(chrome => this.onChromLaunched(chrome))
        .catch(console.log)

        return new Promise((resolve, reject)=>{
            this.resolve = resolve
        })
    }

    auditNext() {
        const url = this.urlsList[this.current];
        if (url) {
            console.log('try : ' + url);
            this.process(this.chrome, url);
        } else {
            this.onDone(this.chrome, null)
        }
    }

    onChromLaunched(chrome) {
        this.chrome = chrome;
        this.auditNext()

    }

    onDone(chrome, e) {
        if (e) {
            console.log(e);
        }
//        chrome.kill()
        this.current++;
        if (this.current <= this.urlsList.length) {
            this.auditNext();
        } else {
            this.endProcess();
            this.resolve();
            chrome.kill();
        }
    }

    endProcess(){}
}


module.exports = ChromeParser;
