class PageAuditor{

	constructor(logger) {
		this.logger = logger;
	}

	auditPage(res, $){
		this.meta(res, $);
		this.prepareLighthouse(res.request.uri.href);
	}


	meta(res, $) {
		this.logger.log('meta', '', {
			'canonical': $('link[rel="canonical"]').attr('href'),
			'title': $('title').text(),
			'description': $('meta[name="description"]').attr("content"),
		});
	}

	prepareLighthouse(url) {
		this.logger.log('../lighthouse-selection',0 );
	}
}

module.exports = PageAuditor;
