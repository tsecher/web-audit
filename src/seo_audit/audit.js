#!/usr/bin/env node


const parameters = process.argv;
let url = parameters[2];


// Prompts
const prompts = require('prompts');
(async () => {
  const response = await prompts([{
    type: 'text',
    name: 'url',
    message: 'Domain to audit ?',
    initial: url,
  },
  {
      type: 'multiselect',
      name: 'types',
      message: "Quel type d'audit ?",
      choices: [
        { title: 'SEO', value: 'seo' },
        { title: 'Lighthouse', value: 'lighthouse' },
        { title: 'Ecoindex', value: 'ecoindex' }
      ],
  }]);

  // Prepare data.
  url - response.url

  // Lancement des audits.
  // SEO
  if( response.types.indexOf('seo') > -1 ){
    console.log('=========================');
    console.log('=========================');
    console.log(' SITE AUDIT');
    const SiteAuditor = require("./src/site-auditor.js")
    const seo = new SiteAuditor(url, response.types.length > 1 ? 1 : 0);
    seo.run().then(()=>{
        
    })
  }

})();

function deepAudit(){
    // Lighthouse
    if( response.types.indexOf('lighthouse') > -1 ){
        console.log('=========================');
        console.log('=========================');
        console.log(' LIGHTHOUSE');
        const LighthouseAuditor = require("./src/lighthouse-auditor")
        const lighthouse = new LighthouseAuditor(url, '../selection', 'lighthouse');
        lighthouse.run();
    }

    // Ecoindex.
    if( response.types.indexOf('ecoindex') > -1 ){
        console.log('=========================');
        console.log('=========================');
        console.log('ECOINDEX');
        const EcoindexAuditor = require("./src/ecoindex-auditor")
        const ecoindex = new EcoindexAuditor(url, '../selection', 'ecoindex');
        ecoindex.run();
    }
}