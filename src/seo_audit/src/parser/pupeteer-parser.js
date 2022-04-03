const UrlTools = require('../tools/url-tools');
const Logger = require("../tools/logger")
const puppeteer = require('puppeteer');

class PupeteerParser extends UrlTools{

    constructor(baseUrl, selectionFile, logFile) {
        super(baseUrl)

        this.logger = new Logger(this, logFile);

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
        this.auditNext()

        return new Promise((resolve, reject)=>{
            this.resolve = resolve
        })
    }

    auditNext(){
        try {
            puppeteer.launch()
            .then(chrome => this.onBrowserLaunch(chrome))
            .catch(console.log)    
        } catch (error) {
            
        }
        
    }

    onBrowserLaunch(browser) {
        const url = this.urlsList[this.current];
        if (url ){
            console.log('try : ' + url);
            this.process(browser, url);
        }
        else{
            this.onDone(browser, null)
        }

    }

    onDone(browser, e) {
        if(e){
            console.log(e);
        }
        browser.close()
        this.current++;
        if( this.current <= this.urlsList.length ){
            this.auditNext();
        }
        else{
            this.endProcess()
            this.resolve();
        }
    }

    endProcess(){}
}


module.exports = PupeteerParser;
