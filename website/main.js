query = `
SELECT ?cancer 
?unitsLabel
?dose 
#(sample(?medication) as ?med) 
(sample(?cancerLabel) as ?cL) 
(sample(?medicationLabel) as ?mL) 
WHERE
{
  #store all types of health specialities within oncology(cancer)
  ?cancer wdt:P1995 wd:Q162555.  
  
  ?cancer rdfs:label ?cancerLabel.
  filter(lang(?cancerLabel)='en')
  
 # to get rid of general cancer items we look specific into the genetic associations.
  ?gene wdt:P2293 ?cancer.
  #################
  
  VALUES ?cancer { wd:Q128581 wd:Q181257} # look at breast/prostate cancer
  
  #?cancer  wd:Q128581.
  
  #now look into the medication used for these cancer types
  ?cancer wdt:P2176 ?medication.
  
  ?medication rdfs:label ?medicationLabel.
  filter(lang(?medicationLabel)='en')
  
  
  #gets the doses of each medication
  ?medication wdt:P4250 ?dose.
  
  #look at the doses, check the property constraints and then look for gram MAJOR HELP BY THE MYTH THE LEGEND AMAR
   ?medication ?propp ?statement .   #within the medication, get the value and its units used
    ?statement a wikibase:BestRank ;
      ?proppsv [
        wikibase:quantityAmount ?value ;
        wikibase:quantityUnit ?units
      ] .
  
  FILTER(?dose = ?value) # for every unit examined, we are looking for the matching unit with the correct value
 
  
  
   SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}
GROUP BY ?cancer ?medication ?dose ?unitsLabel
ORDER BY ASC(?cL)
`;

const url = wdk.sparqlQuery(query);

async function get_data() {
  const response = await fetch(url);
  const results = await response.json();
  const simpleResults = wdk.simplify.sparqlResults(results);

  return simpleResults;
}
