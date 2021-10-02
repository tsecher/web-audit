#!/usr/bin/env node
const LighthouseAuditor = require("./src/lighthouse-auditor")

const parameters = process.argv;
const url = parameters[2];

const audit = new LighthouseAuditor(url, '../selection', 'lighthouse');
audit.run();


