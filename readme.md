# SEO Audit

# Installation 

# Principe
L'audit se déroule en deux phases : 
1. Le crawl :   
Un premier crawl checke les conventions SEO de bases de chaque page et qui répertorie toutes les urls parsés dans divers fichiers csv.
Ce crawl génère alors un fichier lighthouse-selection.csv. Ce fichier vous permet ensuite de définir quelles urls
vous voulez tester avec lighthouse.  
Lancez la commande suivante pour lancer le crawl :  
`npm run seo_audit http://www.conserto.pro`

2. Lighthouse :  
Lighthouse est (très) couteux donc il ne s'agit pas de tester toutes les pages
mais plutot tous les types de pages. Donc vous pouvez définir l'ensemble des urls que vous
voulez tester, en les tagant à 1 dans le fichier lighthouse.csv.  
Ensuite, lancez la commande suivante pour générer un fichier csv de stats.  
`npm run lighthouse_audit http://www.conserto.pro`
 

# Extension 


