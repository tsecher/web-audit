class UrlTools{
    constructor(url) {
        this.baseUrl = url + (url.slice(-1) != '/' ? '/' : '');
        this.domain = this.getDomain(url)
        this.protocol = this.getProtocol(url)
        this.auth = this.getAuth(url)
    }

    initLink(href) {
        if(this.getDomain(href) === this.domain){
            if (this.getAuth(href) != this.auth){
                href = this.protocol + this.auth + this.domain + this.getQuery(href)
            }
        }
        return href;
    }

    getDomain(href){
        return href
            .replace(this.getProtocol(href), '')
            .replace(this.getAuth(href), '')
            .split('/')[0]
    }

    getProtocol(href){
        return this.baseUrl.split('://')[0]+'://'
    }

    getAuth(href){
        return this.baseUrl.indexOf('@') > 0 ? this.baseUrl.split('@')[0].split('://')[1]+"@" : ''
    }

    getQuery(href){
        return href.split(this.getDomain(href))[1]
    }
}

module.exports = UrlTools;
