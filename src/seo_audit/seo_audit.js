const SiteAuditor = require("./src/site-auditor");
const util = require('util');

const parameters = process.argv;
const url = parameters[2];

const audit = new SiteAuditor(url)
audit.run()
