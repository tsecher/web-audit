const ChromeParser = require('./parser/chrome-parser')
const ecoindex = require('ecoindex');
const zlib = require('zlib');
const Average = require('./report/average')
const CDP = require('chrome-remote-interface');
const {time} = require("lighthouse-logger");

class EcoindexAuditor extends ChromeParser {


    constructor(baseUrl, selectionFile, logFile) {
        super(baseUrl, selectionFile, logFile);
        this.average = new Average(this);
        this.average.proxyGetResults = this.average.getResults
        this.average.getResults = () => this.overrideAverageResult()
    }

    process(browser, url) {

        this.currentData = {
            browser: browser,
            url: url,
            count: 4,
        };

        CDP({port: browser.port}).then(
            protocol => {
                const {Page, Runtime, Network} = protocol;

                // Time out.
                this.setTimeout(1000);

                this.getSizeData(Network);
                this.getRequestCount(Network);
                this.getDOMData(Page, Runtime, url);
            }
        ).catch(e => {
        })

    }

    /**
     * End page audit when timeout is reach.
     *
     * @param time
     */
    setTimeout(time) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => this.allDataDone(), time);
    }

    /**======================================================
     ||                  Request count                      ||
     =======================================================*/
    /**
     * Populate request count.
     *
     * @param Network
     * @returns {Promise<void>}
     */
    async getRequestCount(Network) {
        this.currentData.count++;
        this.currentData.request = 0;
        this.nbRequest = 0;
        Network.requestWillBeSent(e => {
            this.currentData.request++;
            this.setTimeout(1000);
        })
    }

    /**======================================================
     ||                  DOM DATA                      ||
     =======================================================*/
    /**
     * Populate dom data.
     *
     * @param Page
     * @param Runtime
     * @param url
     */
    getDOMData(Page, Runtime, url) {
        Page.enable(() => {
            Page.navigate({url: url});

            // Dom Data.
            Page.domContentEventFired(async (e) => {
                // Get Dom data.
                const js = "document.querySelectorAll('*').length";
                const domData = (await Runtime.evaluate({expression: js})).result.value;
                this.addDOMData(domData);
            });
        })
    }

    /**
     * Add dom length to current data.
     *
     * @param DOMLength
     */
    addDOMData(DOMLength) {
        this.currentData.DOM = DOMLength;
        this.finish()
    }


    /**======================================================
     ||                  Network                      ||
     =======================================================*/
    /**
     * Populate page bite size.
     *
     * @param Network
     */
    getSizeData(Network) {
        this.currentData.count++;
        // Size
        Network.enable(async e => {
            Network.loadingFinished(e => {
                this.addSizeData(e.encodedDataLength);
            })
        })
    }

    /**
     * Add page size to current data.
     *
     * @param size
     */
    addSizeData(size) {
        if (!this.currentData.size) {
            size = Math.round((size / 100)) / 10;
            this.currentData.size = size;
            this.finish()
        }

    }

    /**======================================================
     ||                  END                      ||
     =======================================================*/

    /**
     * When a data is populated.
     */
    finish() {
        if (Object.keys(this.currentData).length === this.currentData.count) {
            this.allDataDone()
        }
    }

    /**
     * When all data are populated.
     */
    allDataDone() {
        const index = ecoindex.getEcoindex(this.currentData.DOM, this.currentData.request, this.currentData.size);

        const data = {
            'note': index.grade,
            'index': index.score,
            'ghg': index.ghg,
            'water': index.water,
            'NB DOM elements': this.currentData.DOM || -1,
            'NB requests': this.currentData.request || -1,
            'Size (B)': this.currentData.size || -1,
        }

        this.average.add(data)
        console.log(JSON.stringify({...data, ...{url:this.currentData.url}}))
        this.logger.log('ecoindex', '', data, this.currentData.url);
        this.onDone(this.currentData.browser);
    }


    /**
     * End of process.
     */
    endProcess() {
        console.log("end process");
        this.average.showAverage()
    }

    /**
     * Override average for letter based data.
     */
    overrideAverageResult() {
        const result = this.average.proxyGetResults()
        result.note =
            String.fromCharCode(this.average.getLetterRef() + Math.round(result.note - 1))
            + "  (" + (result.note - 1) + ")"
        return result;
    }
}

module.exports = EcoindexAuditor;
