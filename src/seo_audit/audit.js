#!/usr/bin/env node


const parameters = process.argv;
let url = parameters[2];


// Prompts
const prompts = require('prompts');
const {replaceIcuMessageInstanceIds} = require("lighthouse/lighthouse-core/lib/i18n/i18n");
(async () => {
    const response = await prompts([
        {
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
                {title: 'SEO', value: 'seo', selected: true},
                {title: 'Lighthouse', value: 'lighthouse', selected: true},
                {title: 'Ecoindex', value: 'ecoindex', selected: true}
            ],
        },
        {
            type: 'toggle',
            name: 'selection',
            message: 'Ajouter automatiquement les nouvelles urls à la sélection ?',
            initial: true,
            active: 'oui',
            inactive: 'non'
        },
    ]);

    // Prepare data.
    url = response.url

    // Lancement des audits.
    // SEO
    if (response.types.indexOf('seo') > -1) {
        console.log('=========================');
        console.log('=========================');
        console.log(' SITE AUDIT');
        const SiteAuditor = require("./src/site-auditor.js")
        const seo = new SiteAuditor(url, response.selection? 1 : 0);
        seo.run().then(() => {
            deepAudit(response)
        })
    } else {
        deepAudit(response)
    }

})();

function deepAudit(response) {
    // Lighthouse
    if (response.types.indexOf('lighthouse') > -1) {
        console.log('=========================');
        console.log('=========================');
        console.log(' LIGHTHOUSE');
        const LighthouseAuditor = require("./src/lighthouse-auditor")
        const lighthouse = new LighthouseAuditor(url, '../selection', 'lighthouse');
        lighthouse.run();
    }

    // Ecoindex.
    if (response.types.indexOf('ecoindex') > -1) {
        console.log('=========================');
        console.log('=========================');
        console.log('ECOINDEX');
        const EcoindexAuditor = require("./src/ecoindex-auditor")
        const ecoindex = new EcoindexAuditor(url, '../selection', 'ecoindex');
        ecoindex.run();
    }
}
