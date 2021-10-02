const CDP = require('chrome-remote-interface');
const ChromeParser = require('./parser/chrome-parser');
const ecoindex = require('ecoindex');
const cheerio = require('cheerio');

class EcoindexAuditor extends ChromeParser {


    constructor(baseUrl, selectionFile) {
        super(baseUrl, selectionFile);
        this.logger.defaultName = 'lighthouse';
    }

    process(chrome, url) {
        CDP({port: chrome.port})
            .then((protocol) => {
                const {Page, DOM, Network, Audits} = protocol;

                this.currentData = {
                    chrome: chrome,
                    protocol: protocol,
                    url: url,
                    count: 4,
                };

                Promise.all([Page.enable(), Audits.enable(), DOM.enable(), Network.enable()]).then(() => this.onChromeReady(Page, DOM, Network, Audits))
            })
    }

    onChromeReady(Page, DOM, Network, Audits) {
        Page.navigate({url: this.currentData.url});

        // this.getSizeData(Audits);
        // this.getDOMData(Page, DOM);
        this.getRequestCount(Network, Audits);
    }

    /**======================================================
     ||                  Request count                      ||
     =======================================================*/
    getRequestCount(Network, Audits) {
        this.currentData.count++;
        let nbRequest = 0;
        Network.requestWillBeSent(async (data) => {
            nbRequest++;

            const value = Audits.getEncodedResponse(data.requestId, null, 1, true)
                .then( (result) => {
                    console.log("result", result);
                    process.exit();
                })
                .catch(e => {
                    console.log(e);
                    process.exit();
                })

        })
        // this.addRequestData(nbRequest);
    }

    addRequestData(nbRequest) {
        this.currentData.request = nbRequest
        this.finish()
    }

    /**======================================================
     ||                  DOM DATA                      ||
     =======================================================*/
    getDOMData(Page, DOM) {
        this.currentData.count++;
        Page.loadEventFired(async () => {
            try {
                // get the page source
                const rootNode = await DOM.getDocument({depth: -1});
                const pageSource = await DOM.getOuterHTML({
                    nodeId: rootNode.root.nodeId
                });

                // load the page source into cheerio
                const $ = cheerio.load(pageSource.outerHTML);
                this.addDOMData($('*').length)

            } catch (err) {
                console.log(err);
            }
        });
    }

    addDOMData(DOMLength) {
        this.currentData.DOM = DOMLength;
        this.finish()
    }


    /**======================================================
     ||                  Network                      ||
     =======================================================*/
    getSizeData(Audits) {

    }

    addSizeData(size) {
        this.currentData.size = size;
        this.finish()
    }

    /**======================================================
     ||                  END                      ||
     =======================================================*/

    finish() {
        if (Object.keys(this.currentData).length === this.currentData.count) {
            this.allDataDone()
        }
    }

    allDataDone() {
        const index = ecoindex.calculate(this.currentData.DOM, this.currentData.request);
        const note = ecoindex.getNote(index);
        const value = `${note} (${index})`;
        console.log('value : ', value);
        this.logger.log('ecoindex', '', {value: value}, this.currentData.url);
        this.currentData.protocol.close();
        this.onDone(this.currentData.chrome);
    }
}

module.exports = EcoindexAuditor;
