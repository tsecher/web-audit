const {unwatchFile} = require("fs");

class Average {
    constructor(auditor) {
        this.values = {}
        this.auditor = auditor
    }

    add(data) {
        Object.keys(data).forEach(name => {
            if (!this.values[name]) {
                this.values[name] = {
                    data: []
                }
            }
            // Do not add to average.
            if (data[name] < 0) {
                return;
            }

            this.values[name].data.push(data[name])
        })
    }

    showAverage() {

        try {
            const result = this.getResults()

            console.log("============================= Average ")
            console.log(JSON.stringify(result));

            const loggerName = 'average-' + this.auditor.logger.defaultName
            const logger = new (require('../tools/logger'))(this.auditor, loggerName);
            logger.log(loggerName, '', result, `Average`)
        } catch (e) {
            // Pas de report possible.
            console.log(e)
        }
    }

    getResults() {
        const result = {}
        Object.keys(this.values).forEach(name => {
            const data = this.values[name].data
                .map(item => this.getNumber(item))
                .filter(item => parseFloat(item) || parseInt(item));
            if ( data.length){
                result[name] = data.reduce((a, b) => a + b) / data.length;
            }
            else{
                result[name] = -1;
            }
        })

        return result
    }

    getNumber(data) {
        // On transforme une lettre en int.
        if (typeof data === 'string' && data.length === 1) {
            return data.toLowerCase().charCodeAt(0) - this.getLetterRef() + 1
        }
        return data;
    }

    getLetterRef() {
        this.letterRef = this.letterRef || 'a'.charCodeAt(0)
        return this.letterRef
    }
}

module.exports = Average;
