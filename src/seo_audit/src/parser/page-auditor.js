const Manager = require('node-seo-checker');
const when = require('when');


class PageAuditor {

	constructor(logger) {
		this.logger = logger;
		this.logger.log('../selection', (new Date()), 0, '==========' );
	}

	/**
	 * Audit de la page.
	 *
	 * @param res
	 * @param $
	 */
	auditPage(res, $) {
		try{
			this.meta(res, $);
			this.seoChecker(res, $);
			this.prepareLighthouse(res.request.uri.href);
		}
		catch(e){
		}

	}

	/**
	 * Log des meta.
	 *
	 * @param res
	 * @param $
	 */
	meta(res, $) {
		this.logger.log('meta', '', {
			'canonical': $('link[rel="canonical"]').attr('href'),
			'title': $('title').text(),
			'description': $('meta[name="description"]').attr("content"),
		});
	}

	prepareLighthouse(url) {
		const file = '../selection';
		const content = this.logger.read(file)
			.filter(item => {
				return item[0] === url
			}).length

		if( content === 0 ){
			this.logger.log(file, 0);
		}
	}

	seoChecker(res, $) {
		const manager = new Manager();
		manager.setReader((new Manager.Reader()).createInputHtml(res.body))
		manager.setWriter((new Manager.Writer()).createOutputLog(this.logger))
		manager.checkSEO('../rule.json')
	}
}




/**
 * On redéfinit les input et ouput.
 */
Manager.Reader.prototype.createInputHtml = function (html) {

	// read function
	return function () {
		var deferred = when.defer();

		setTimeout(function () {
			deferred.resolve(html)
		}, 1)

		return deferred.promise;
	};
}
Manager.Writer.prototype.createOutputLog = function (logger) {
	this.pipes.push((message, that) => {
		message.split('\r\n').forEach(item => {
			logger.log('seo_checker', item)
		})
	});
	return this;
}

module.exports = PageAuditor;
