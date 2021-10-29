# PRA3006
Programming in life science Lab


#potential code looking through human genes that account for tumour suppressor genes
%%
SELECT ?gene #?geneLabel
WHERE
{
                                    //a molecule  part of hydrogen
  ?gene wdt:P31 wd:Q7187;           //get genes
        wdt:P703 wd:Q15978631;      //that's part of homo sapiens
        wdt:P31 wd:Q181257          //within tumour suppressor genes?
   #SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}
%%
