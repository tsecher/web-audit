#!/usr/bin/env node

const EcoindexAuditor = require("./src/ecoindex-auditor")

const parameters = process.argv;
const url = parameters[2];

const audit = new EcoindexAuditor(url, '../selection', 'ecoindex');
audit.run();


