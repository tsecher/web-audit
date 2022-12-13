const PuppeteerHar = require('puppeteer-har');
const path = require('path');
const translator = require('greenit-cli/cli-core/translator.js').translator;

//Analyse a webpage
export async function analyseURL(page, url, options, scriptPath) {
  let result = {};

  try {

    //get har file
    const pptrHar = new PuppeteerHar(page);
    await pptrHar.start();

    // disabling cache
    await page.setCacheEnabled(false);

    //go to url
    await page.goto(url, {timeout: options.timeout});

    try{
      await page.waitForNavigation({waitUntil: 'domcontentloaded', timeout: 3000});
    }
    catch(e){
      console.error(`Wait to long...`);
    }





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


    result = await page.evaluate(() => (launchAnalyse()));
    await page.close();
    result.success = true;
    result.nbBestPracticesToCorrect = 0;

    // Compute number of times where best practices are not respected
    for (let key in result.bestPractices) {
      if ((result.bestPractices[key].complianceLevel || "A") !== "A") {
        result.nbBestPracticesToCorrect++;
      }
    }
  } catch (error) {
    result.success = false;
    console.error(`Error while analyzing URL url : `, error);
  }
  const date = new Date();
  result.date = `${date.toLocaleDateString('fr')} ${date.toLocaleTimeString('fr')}`;
  result.index = options.index;
  return result;
}