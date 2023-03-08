const PuppeteerHar = require('puppeteer-har');
const translator = require('greenit-cli/cli-core/translator.js').translator;
const {scrollPageToBottom} = require('puppeteer-autoscroll-down')
const ecoindex = require('ecoindex');

//Analyse a webpage
export async function analyseURL(page, url, options, scriptPath, logger) {
	let result = {};

	try {

		//get har file
		const pptrHar = new PuppeteerHar(page);
		await pptrHar.start();

		// disabling cache
		await page.setCacheEnabled(false);

		// Init network events.
		await initNetworksEvents(page, result, logger);

		// Go to url.
		await page.goto(url, {timeout: options.timeout});

		try {
			await page.waitForNavigation({waitUntil: 'domcontentloaded', timeout: 3000});
		} catch (e) {
			logger.warning(`Wait too long...`);
		}

		await scrollToBottom(page)

		// Get nb elements in dom once loaded.
		await initNbElementsInPage(page, result, logger);

		result.ecoIndex = ecoindex.computeEcoIndex(result.domSize, result.nbRequest, result.responsesSize/1000);
		result.grade = ecoindex.getEcoIndexGrade(result.ecoIndex);
		result.waterConsumption = ecoindex.computeWaterConsumptionfromEcoIndex(result.ecoIndex);
		result.greenhouseGasesEmission = ecoindex.computeGreenhouseGasesEmissionfromEcoIndex(result.ecoIndex);

		if (options.bestPracticesAnalyse) {
			result.bestPractices = await getBestPracticeAnalysis(page, pptrHar, scriptPath);
		}

		result.success = true;
	} catch (error) {
		result.success = false;
		logger.error(`Error while analyzing URL url : `, error);
	}
	const date = new Date();
	result.date = `${date.toLocaleDateString('fr')} ${date.toLocaleTimeString('fr')}`;
	result.index = options.index;

	return result;
}

/**
 * Get Nb elements in DOM.
 *
 * @param page
 * @returns {Promise<*>}
 */
async function initNbElementsInPage(page, rawResult = {}, logger) {
	rawResult.domSize = await page.evaluate(() => (document.querySelectorAll('*').length - document.querySelectorAll('svg *').length));
}

/**
 * Init networks data.
 *
 * @param page
 * @param rawResult
 * @returns {Promise<void>}
 */
async function initNetworksEvents(page, rawResult, logger) {
	rawResult.nbRequest = rawResult.nbRequest || 0;
	rawResult.responsesSize = rawResult.responsesSize || 0;

	const devToolsResponses = new Map();
	const devTools = await page.target().createCDPSession();
	await devTools.send("Network.enable");

	devTools.on("Network.responseReceived", (event) => {
		devToolsResponses.set(event.requestId, event.response);
	});

	devTools.on("Network.loadingFinished", (event, response) => {
		rawResult.nbRequest++;
		rawResult.responsesSize += event.encodedDataLength;
	});
}

/**
 * Scroll to bottom.
 *
 * @param page
 * @returns {Promise<void>}
 */
async function scrollToBottom(page) {
	const bodyHeight = await page.evaluate(() => document.body.clientHeight);
	const windowHeight = await page.evaluate(() => window.innerHeight);
	for (let i = 0; i < Math.floor(bodyHeight / windowHeight) + 2; i++) {
		await scrollPageToBottom(page, {
			size: windowHeight,
			delay: 200
		});
	}
}

/**
 * Analyse best practices.
 *
 * @param page
 * @returns {Promise<*>}
 */
async function getBestPracticeAnalysis(page, pptrHar, scriptPath) {
	let harObj = await pptrHar.stop();
	//get ressources
	const client = await page.target().createCDPSession();
	let ressourceTree = await client.send('Page.getResourceTree');
	await client.detach()

	// replace chrome.i18n.getMessage call by i18n custom implementation working in page
	// fr is default catalog
	await page.evaluate(language_array => (chrome = {
		"i18n": {
			"getMessage": function (message, parameters = []) {
				return language_array[message].replace(/%s/g, function () {
					// parameters is string or array
					return Array.isArray(parameters) ? parameters.shift() : parameters;
				});
			}
		}
	}), translator.getCatalog());


	//add script, get run, then remove it to not interfere with the analysis
	let script = await page.addScriptTag({path: scriptPath});
	await script.evaluate(x => (x.remove()));

	//pass node object to browser
	await page.evaluate(x => (har = x), harObj.log);
	await page.evaluate(x => (resources = x), ressourceTree.frameTree.resources);


	const result = await page.evaluate(() => (launchAnalyse()));
	await page.close();
	result.success = true;
	result.nbBestPracticesToCorrect = 0;

	// Compute number of times where best practices are not respected
	for (let key in result.bestPractices) {
		if ((result.bestPractices[key].complianceLevel || "A") !== "A") {
			result.nbBestPracticesToCorrect++;
		}
	}

	return result.bestPractices;
}