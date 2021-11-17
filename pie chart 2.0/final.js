///                                                      CODE FOR PIE CHART

//-----------------------------------------------------------------------------------------------------------------------------------------------------
/// #### QUERY ####
query =
    `
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


//-----------------------------------------------------------------------------------------------------------------------------------------------------
/// #### VISUALIZATION ####


// set the dimensions and margins of the graph
var width = 450
height = 450
margin = 40

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
var radius = Math.min(width, height) / 2 - margin

// append the svg object to the div called 'my_dataviz'
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


// // set the color scale
var color = d3.scaleOrdinal()
    .domain(["a", "b", "c"])
    .range(d3.schemePastel2);



function update(data) {

    // Compute the position of each group on the pie:
    var pie = d3.pie()
        .value(function(d) {
            return d.value;
        })
        .sort(function(a, b) {
            console.log(a);
            return d3.ascending(a.key, b.key);
        }) // This make sure that group order remains the same in the pie chart

    var data_ready = pie(d3.entries(data))
        // Now I know that group A goes from 0 degrees to x degrees and so on.

    // shape helper to build arcs:
    var arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)


    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
        .selectAll('mySlices')
        .data(data_ready)
        .enter()
        .append('path')
        .merge(svg)
        .transition()
        .duration(1000)
        .attr('d', arcGenerator)
        .attr('fill', function(d) {
            return (color(d.data.key))
        })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 1)

    //Now add the annotation. Use the centroid method to get the best coordinates
    svg
        .selectAll('mySlices')
        .data(data_ready)
        .enter()
        .append('text')
        .text(function(d) {
            return "unit  " + d.data.key
        })
        .attr("transform", function(d) {
            return "translate(" + arcGenerator.centroid(d) + ")";
        })
        .style("text-anchor", "middle")
        .style("font-size", 17)


    svg
        .exit()
        .remove()

}

//-----------------------------------------------------------------------------------------------------------------------------------------------------
/// #### MAIN FUNCTION ####

async function main() {
    const response = await fetch(url);
    const results = await response.json();
    const simpleResults = wdk.simplify.sparqlResults(results);
    data = JSON.stringify(simpleResults, undefined, 0);
    json_object = JSON.parse(data)



    var bc_gram = []
    var bc_miligram = []
    var bc_microgram = []
    var pc_gram = []
    var pc_miligram = []
    var pc_microgram = []


    // this code iterates through the data and adds the instances with the same units in the respective arrays

    for (let i = 0; i < json_object.length; i++) {
        // if json_object is equal to breast cancer append
        if (json_object[i]['cL'] == 'breast cancer') {
            if (json_object[i]['unitsLabel'] == 'gram') { bc_gram.push(i) } else if (json_object[i]['unitsLabel'] == 'milligram') { bc_miligram.push(i) } else { bc_microgram.push(i) }
        } else {
            if (json_object[i]['unitsLabel'] == 'gram') { pc_gram.push(i) } else if (json_object[i]['unitsLabel'] == 'milligram') { pc_miligram.push(i) } else { pc_microgram.push(i) }
        }
    }


    return await [bc_gram, bc_miligram, bc_microgram, pc_gram, pc_miligram, pc_microgram, json_object]
}



// this is the only way to get info from an async function, by awaiting it
(async() => {
    console.log(await main())
    var data = await main()


    bc_gram = data[0]
    bc_miligram = data[1]
    bc_microgram = data[2]
    pc_gram = data[3]
    pc_miligram = data[4]
    pc_microgram = data[5]
    data = data[6]

    var a = bc_gram.length
    var b = bc_miligram.length
    var c = bc_microgram.length
    var d = pc_gram.length
    var e = pc_miligram.length
    var f = pc_microgram.length

    // create a variable that has the number of values in each unit
    var test = [a, b, c, d, e, f]


    // create 2 data_set
    var Breast_cancer = {
        gram: test[0],
        miligram: test[1],
        microgram: test[2]

    }
    var Prostate_cancer = {
        gram: test[3],
        miligram: test[4],
        microgram: test[5]

    }


    // if Prostate_cancer is replaced by breast_cancer we get the second graph
    // buttons don't work yet

    update(Prostate_cancer)
        // update(Breast_cancer)


    // max function that gets the max class of units
    function max(object) {
        var max = 0
        for (let i = 0; i < 3; i++) {
            if (Object.values(object)[i] > max) {
                max = Object.values(object)[i]
            }
        }

        return max
    }

    function getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }


    // console.log(getKeyByValue(Prostate_cancer, max(Prostate_cancer)));
    // console.log(getKeyByValue(Breast_cancer, max(Breast_cancer)));
    //console.log(data)



    // convert all the data to the winning units
    // create new arrays
    // function that takes data + winning units and spits out data in winning units

    // make 3 function to gram to miligram to microgramme

    data_bc = []
    data_pc = []

    // make new dic between breast and prostate cancer
    for (let i = 0; i < data.length; i++) {
        // if json_object is equal to breast cancer append
        if (data[i]['cL'] == 'breast cancer') {
            data_bc.push(data[i])
        } else {
            data_pc.push(data[i])
        }
    }

    //console.log(data_bc)

    //-------------------------------------------------------------------------------------------------------------------------------------------------------------
    // ### UNIT CHANGE FUNCTIONS ### //


    function unit_change_MILLI_MICRO(milli, micro) {
        milli_to_gram = []
        micro_to_gram = []
        for (let i = 0; i < milli.length; i++) {
            milli_to_gram.push(milli[i]['dose'] * 10 ** (-3))
        }
        for (let i = 0; i < micro.length; i++) {
            micro_to_gram.push(micro[i]['dose'] * 10 ** (-6))
        }
        return [milli_to_gram, micro_to_gram]
    }

    function unit_change_GRAM_MICRO(gram, micro) {
        gram_to_milli = []
        micro_to_milli = []
        for (let i = 0; i < gram.length; i++) {
            gram_to_milli.push(gram[i]['dose'] * 10 ** (3))
        }
        for (let i = 0; i < micro.length; i++) {
            micro_to_milli.push(micro[i]['dose'] * 10 ** (-3))
        }
        return [gram_to_milli, micro_to_milli]
    }

    function unit_change_GRAM_MILLI(gram, milli) {
        gram_to_micro = []
        milli_to_micro = []
        for (let i = 0; i < gram.length; i++) {
            gram_to_micro.push(gram[i]['dose'] * 10 ** (6))
        }
        for (let i = 0; i < milli.length; i++) {
            milli_to_micro.push(milli[i]['dose'] * 10 ** (3))
        }
        return [gram_to_micro, milli_to_micro]
    }


    //-------------------------------------------------------------------------------------------------------------------------------------------------------------

    function same_units(data, winning_value_for_data) {
        // sort in 3 arrays and see which one is the winning unit,
        // convert the other 2 to that unit
        var Gram = []
        var Milligram = []
        var Microgramme = []
        var Results = []

        for (let i = 0; i < data.length; i++) {
            if (data[i]['unitsLabel'] == 'gram') {
                Gram.push(data[i])
            } else if (data[i]['unitsLabel'] == 'milligram') {
                Milligram.push(data[i])
            } else { Microgramme.push(data[i]) }
        }


        if (winning_value_for_data = 'miligram') { Results = unit_change_GRAM_MICRO(Gram, Microgramme) } else if (winning_value_for_data = 'gram') { Results = unit_change_MILLI_MICRO(Milligram, Microgramme) } else { Results = unit_change_GRAM_MILLI(Gram, Milligram) }

        return (Results)
    }


    var Array_of_transformed_units_bc = same_units(data_bc, getKeyByValue(Breast_cancer, max(Breast_cancer)))
    var Array_of_transformed_units_pc = same_units(data_pc, getKeyByValue(Prostate_cancer, max(Prostate_cancer)))

    console.log(Array_of_transformed_units_bc)


    // return the names in the arrays too and not only the values 

    // final product is a dic with as key the name of the drug and as value the adjusted values


    // take that data as input for the bar chart


})()