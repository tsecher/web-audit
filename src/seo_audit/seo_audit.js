#!/usr/bin/env node

const SiteAuditor = require("./src/site-auditor");

const parameters = process.argv;
const url = parameters[2];

const audit = new SiteAuditor(url)
audit.run()
