const Manager = require('node-seo-checker');
const when = require('when');


class PageAuditor {

	constructor(logger) {
		this.logger = logger;
	}

	/**
	 * Audit de la page.
	 *
	 * @param res
	 * @param $
	 */
	auditPage(res, $) {
		this.meta(res, $);
		this.seoChecker(res, $);
		this.prepareLighthouse(res.request.uri.href);
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
		this.logger.log('../lighthouse-selection', 0);
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
