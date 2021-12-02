// Main variables used in the visualization - aka not inputted by the user
main_terms = "wd:Q128581 wd:Q181257 wd:Q180614 wd:Q3242950";

// prepare the query search by constructing a string that contains the query. Input is a string containing the Q terms
// for the SPARQL - can be one Q term, can be multiple (as in the case of main_terms variable); Output is a list containing
// two urls to two queries: first one gets the drugs with specified dosage (+units - so only drugs with a specific property are taken into account)
// for a specified term, second gets all the drugs that a specified term has
function get_query(searchTerm) {
  // Main query which gets the drug dosages for the specified cancers - used in the home page for pie and bar charts
  query_main =
    `
SELECT ?cancer 
?cancerLabel
?unitsLabel
?dose 
#(sample(?medication) as ?med) 
# (sample(?cancerLabel) as ?cL) 
(sample(?medicationLabel) as ?mL) 
WHERE
{
  
  VALUES ?cancer {` +
    searchTerm +
    `} # look at breast/prostate/kidney cancer and melanoma
  
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
GROUP BY ?cancer ?medication ?dose ?unitsLabel ?cancerLabel
`;

  // Second query that we mainly use for the visualization in the drugInfo pages - it gets all the drugs of the specified cancer(s)
  query_drugsList =
    `SELECT ?cancer 
?cancerLabel
#(sample(?medication) as ?med) 
# (sample(?cancerLabel) as ?cL) 
(sample(?medicationLabel) as ?mL) 
WHERE
{
  
  VALUES ?cancer { ` +
    searchTerm +
    ` } # look at breast/prostate cancer
  
  #?cancer  wd:Q128581.
  
  #now look into the medication used for these cancer types
  ?cancer wdt:P2176 ?medication.
  
  ?medication rdfs:label ?medicationLabel.
  filter(lang(?medicationLabel)='en')
  
   SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}
GROUP BY ?cancer ?medication ?cancerLabel`;

  // return a list with two urls for the get_data function
  return [wdk.sparqlQuery(query_main), wdk.sparqlQuery(query_drugsList)];
}

// Make the query and get the results; input is the url with the specified query; output is a simplified result list of the query
async function get_data(url) {
  simpleResults = [];
  for (i = 0; i < url.length; i++) {
    const response = await fetch(url[i]);
    const results = await response.json();
    simpleResults.push(wdk.simplify.sparqlResults(results));
  }
  return simpleResults;
}
