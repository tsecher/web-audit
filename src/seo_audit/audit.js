#!/usr/bin/env node

const parameters = require('args-parser')(process.argv);

// Initialisation des settings.
const settings = [
    {
        type: 'text',
        name: 'url',
        message: 'Domain to audit ?',
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
    {
        type: 'text',
        name: 'email',
        message: 'Report email ?'
    }
]

// Initialisation des settings.
settings.forEach(setting => {
    const id = setting.name;
    if (parameters[id]) {
        let value = setting.initial;
        switch (setting.type) {
            case 'toggle':
                value = [1, '1', 'true', true].indexOf(parameters[id]) > -1;
                break;
            case 'multiselect':
                value = parameters[id].split(',');
                setting.choices.forEach(choice => {
                    choice.selected = value.indexOf(choice.value) > -1;
                })
                break;
            default:
                value = parameters[id];
        }
        parameters[id] = value;
        setting.initial = value;
    } else {
        if (parameters['y']) {
            switch (setting.type) {
                case 'multiselect':
                    parameters[id] = setting.choices
                        .filter(choice => choice.selected)
                        .map(choice => choice.value)
                    break;
                default:
                    parameters[id] = setting.initial
            }
        }
    }
})

// Prompts
const prompts = require('prompts');
(async () => {
    let response = parameters;
    if (!parameters.y) {
        response = await prompts(settings)
    }

    // Initialisation du mailer via parameters.
    let mailer;
    if(response.email.length){
        let authData = null
        if( parameters.senderMail && parameters.senderPass){
            authData = {
                user: parameters.senderMail,
                pass: parameters.senderPass,
            }
        }
        mailer = new (require('./src/report/mailer'))(response.url, response.email, authData)
        await mailer.initAuth();
    }

    // Initlisations dse auditors.
    const listAudits = {
        'seo': () => {
            console.log('=========================');
            console.log('=========================');
            console.log(' SITE AUDIT');
            const SiteAuditor = require("./src/site-auditor.js")
            const seo = new SiteAuditor(response.url, response.selection ? 1 : 0);
            seo.run().then(() => {
                nextAudit()
            })
        },
        'lighthouse': () => {
            console.log('=========================');
            console.log('=========================');
            console.log(' LIGHTHOUSE');
            const LighthouseAuditor = require("./src/lighthouse-auditor")
            const lighthouse = new LighthouseAuditor(response.url, '../selection', 'lighthouse');
            lighthouse.run().then(() => {
                nextAudit()
            })
        },
        'ecoindex': () => {
            console.log('=========================');
            console.log('=========================');
            console.log('ECOINDEX');
            const EcoindexAuditor = require("./src/ecoindex-auditor")
            const ecoindex = new EcoindexAuditor(response.url, '../selection', 'ecoindex');
            ecoindex.run().then(() => {
                nextAudit()
            })

        }
    }


    // Next audit.
    function nextAudit() {
        // Récupération du next audit id.
        const audits = response.types;
        const nextAuditIndex = audits.reverse().pop();
        response.types.reverse();

        if (typeof listAudits[nextAuditIndex] === 'function') {
            listAudits[nextAuditIndex]();
        } else {
            if (response.email.length) {
                mailer.send()
            }
        }
    }

    nextAudit();
})();
