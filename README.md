# Web audit tools

Aggregation of serveral indicators for auditing a web pages.


# How to ? 

## Setup
Install this package as you normally do :  
`yarn install web-audit`

Setup configuration file :  
`yarn setup`

### Configuration
After setup, web-audit.config.js file is generated. You can specify several configuration information
according to modules, crawlers, loggers, storage or whatever needed in here.

By default, web_audit does not provide any module fore audit. You need to install the modules you need
and list them in this configuration file.

You can specify a specific configuration file that will override the default one (deep merge) for each 
specific action (analyse or crawl). This is helpfull to provide a specific config for a website.

## Crawl a site
A command line allows you to crawl a specific web site.
All urls found will be placed in a pages_found.csv file in the version folder.

Several parameters will be asked: 
- URLs ? (leave empty to stop) : Urls to crawl
- Version ? : The version of audit (easy to compare).

Use: 
`yarn crawl`


## Analyse a page
You can analyse a specific web page using the following command line.
All report will be placed in a corresponding csv file in the version folder.

Several parameters will be asked:
- URLs ? (leave empty to stop) : Urls to analyse
- or File path (relative to ...) : A csv file listing all urls to analyse (see [Crawl a site](#crawl-a-site))
- Version ? : The version of audit (easy to compare).
- Modules ? : The list of modules that will analyse pages.

Use : 
`yarn analyse`
