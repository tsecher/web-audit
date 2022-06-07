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

        this.auditNext();


        return new Promise((resolve, reject) => {
            this.resolve = resolve
        })
    }

    launchChrome(cb) {
        chromeLauncher.launch({
            chromeFlags: ['--headless'],
        })
            .then(chrome => cb(chrome))
            .catch(console.log)
    }

    auditNext() {
        this.launchChrome((chrome) => {
            const url = this.urlsList[this.current];
            if (url) {
                console.log(`[${this.current + 1}/${this.urlsList.length}] ${url}`);
                this.process(chrome, url);
            } else {
                this.onDone(chrome, null)
            }
        })

    }


    onChromLaunched(chrome) {
        this.chrome = chrome;
        // this.auditNext()

    }

    onDone(chrome, e) {
        if (e) {
            console.log(e);
        }
        chrome.kill()
            .then(() => this.onChromeKill())
            .catch(() => this.onChromeKill())
    }

    onChromeKill() {
        this.current++;
        if (this.current < this.urlsList.length + 1) {
            this.auditNext();
        } else {
            if (this.current === this.urlsList.length + 1) {
                this.endProcess();
            }
            this.resolve();
        }
    }

    endProcess() {

    }
}


module.exports = ChromeParser;