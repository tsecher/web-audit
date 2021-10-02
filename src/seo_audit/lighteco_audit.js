#!/usr/bin/env node

const EcoindexAuditor = require("./src/ecoindex-auditor")
const LighthouseAuditor = require("./src/lighthouse-auditor")

const parameters = process.argv;
const url = parameters[2];

(new EcoindexAuditor(url, '../selection', 'ecoindex')).run();
(new LighthouseAuditor(url, '../selection', 'lighthouse')).run()


