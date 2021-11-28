const PupeteerParser = require('./parser/pupeteer-parser')
const ecoindex = require('ecoindex');
const zlib = require('zlib');
const Average = require('./report/average')

class EcoindexAuditor extends PupeteerParser {


    constructor(baseUrl, selectionFile, logFile) {
        super(baseUrl, selectionFile, logFile);
        this.average = new Average(this);
        this.average.proxyGetResults = this.average.getResults
        this.average.getResults = () => this.overrideAverageResult()
    }

    process(browser, url) {
        this.currentData = {
            brower: browser,
            url: url,
            count: 4,
        };

        // Création de la page.
        browser.newPage()
            .then(page => this.preparePage(page, url))
            .catch(data => this.onDone(browser))
    }

    preparePage(page, url) {
        this.getRequestCount(page)
        this.getSizeData(page)

        page.goto(url)
            .then(() => {
                this.getDOMData(page)
                this.addRequestData(this.nbRequest)
                this.addSizeData(this.size)
            })
            .catch(data => this.onDone(this.currentData.brower))
    }


    /**======================================================
     ||                  Request count                      ||
     =======================================================*/
    async getRequestCount(page) {
        this.currentData.count++;
        this.nbRequest = 0;
        page.on('request', request => {
            if (!request.url().startsWith('data:')) {
                this.nbRequest++;
            }
        })
    }

    addRequestData(nbRequest) {
        this.currentData.request = nbRequest
        this.finish()
    }

    /**======================================================
     ||                  DOM DATA                      ||
     =======================================================*/
    getDOMData(page) {
        // this.currentData.count++;
        page.evaluate(() => document.querySelectorAll('*').length)
            .then(value => this.addDOMData(value))
    }

    addDOMData(DOMLength) {
        this.currentData.DOM = DOMLength;
        this.finish()
    }


    /**======================================================
     ||                  Network                      ||
     =======================================================*/
    getSizeData(page) {
        this.currentData.count++;
        this.size = 0;
        page.on('response', response => {
            if (response.ok()) {
                switch (response.headers()['content-encoding']) {
                    case 'br':
                        response.buffer().then(buffer => {
                            zlib.brotliCompress(buffer, (_, result) => {
                                this.size += result.length;
                            });
                        });
                        break;
                    case 'gzip':
                        response.buffer().then(buffer => {
                            zlib.gzip(buffer, (_, result) => {
                                this.size += result.length;
                            });
                        });
                        break;
                    case 'deflate':
                        response.buffer().then(buffer => {
                            zlib.deflate(buffer, (_, result) => {
                                this.size += result.length;
                            });
                        });
                        break;
                    default:
                        response.buffer().then(buffer => {
                            this.size += buffer.length;
                        });
                        break;
                }
            }
        });
    }

    addSizeData(size) {
        size = Math.round(size / 1024)
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
        const index = ecoindex.calculate(this.currentData.DOM, this.currentData.request, this.currentData.size);
        const note = ecoindex.getNote(index);

        const data = {
            'note': note,
            'index': index,
            'NB DOM elements': this.currentData.DOM,
            'NB requests': this.currentData.request,
            'Size (B)': this.currentData.size,
        }

        this.average.add(data)
        console.log(JSON.stringify(data))
        this.logger.log('ecoindex', '', data, this.currentData.url);
        this.onDone(this.currentData.brower);
    }


    endProcess() {
        this.average.showAverage()
    }

    overrideAverageResult() {
        const result = this.average.proxyGetResults()
        result.note =
            String.fromCharCode(this.average.getLetterRef() + Math.round(result.note - 1))
            + "  (" + (result.note - 1) + ")"

        return result
    }
}

module.exports = EcoindexAuditor;
