//########## VARIABLES ##################

// only reason why they are in arrays is because of the plot all option
var breast_cancer_str = ["breast cancer"];
var prostate_cancer_str = ["prostate cancer"];
var kidney_cancer_str = ["kidney cancer"];
var melanoma_str = ["melanoma"];
var all = ["melanoma", "kidney cancer", "prostate cancer", "breast cancer"];

var subtitle_pie = "Hover over a pie slice to get additional information!";
var subtitle_bar =
  "Hover over a bar to get additional information! <br> Click on a bar to learn more about a drug!";

var ExtraInfo = "A note on the drug data...";

// Locations for the titles
var div_names = [
  "Title_pie",
  "Title_bar_chart",
  "Subtitle_pie_chart",
  "Subtitle_bar_chart",
  "ExtraInfo",
];

// hopefully a user will make a query :')
var searchTerm_label = "";

// used in animated_barchart.js - if the user requests a query via the + button that this is changed to true and he gets a different
// result from clicking on the bars in the bar chart
var user_input = false;

//########## PIE CHART FUNCTIONS ##################

// Used in pie chart visualization
// Input: data = Simplified results from the database, cancer_labels = list of strings that represent cancers that we use in our search
// Output: cancer_dose = list containing dictionaries for each unit, a dict has a label (unit) and a value which represents how many times
// a specific units shows up in drug dosages
function extractData(data, cancer_labels) {
  console.log(data);
  // initialize dict
  var cancer_dose_raw = [
    { label: "gram", value: 0 },
    { label: "milligram", value: 0 },
    { label: "microgram", value: 0 },
  ];

  // for each string in cancer_labels
  for (cancer = 0; cancer < cancer_labels.length; cancer++) {
    // for each drug for this specific cancer
    for (i = 0; i < data.length; i++) {
      if (data[i]["cancer"]["label"] == cancer_labels[cancer]) {
        // increment unit value if that unit is present in dosage for a drug
        switch (data[i]["unitsLabel"]) {
          case "gram":
            cancer_dose_raw[0].value += 1;
            break;
          case "milligram":
            cancer_dose_raw[1].value += 1;
            break;
          case "microgram":
            cancer_dose_raw[2].value += 1;
            break;
        }
      }
    }
  }

  // filter out units that have a value of 0 = fix for a visual "bug" in piechart
  cancer_dose = [];
  for (i = 0; i < cancer_dose_raw.length; i++) {
    if (cancer_dose_raw[i].value != 0) {
      cancer_dose.push(cancer_dose_raw[i]);
    }
  }
  return cancer_dose;
}

// ########## BAR CHART FUNCTIONS ##################

// Used in bar chart visualization - data preperation - finds the most dominant unit in the dict
// Input: cancer_dose = taken from extractData function
// Output: dominant_unit = dict with a unit (string of the dominant unit) and value (that contains a value of how many times this unit has occured)
// SIDENOTE: while I was commenting I noticed that the dominant_unit here can actually just be a string - I dont use the value from the dict
// However I'm too lazy to change this so pls god forgive me
function get_max(cancer_dose) {
  var max = 0;
  var dominant_unit = { unit: "", value: 0 };

  // iterate through the cancer_dose
  for (let i = 0; i < Object.entries(cancer_dose).length; i++) {
    // find the biggest value and safe the unit
    if (cancer_dose[i].value > max) {
      max = cancer_dose[i].value;
      dominant_unit.unit = cancer_dose[i].label;
      dominant_unit.value = max;
    }
  }
  return dominant_unit;
}

// Used in bar chart visualization - data preperation - converts units of all the cancer drugs to the most dominant unit
// Input: data = Simplified results from the database, cancer_labels = list of strings that represent cancers that we use in our search
// dominant_unit = dict with the most dominant unit...
// Output: drugs = list contatining all the drugs for a specified cancer (or cancners) that have their unit converted to the most dominant unit
// for example if a drug dosage is expressed in grams, and the most dominant unit is milligrams then the dosage is change to milligrams
function extract_drug_info(data, cancer_labels, dominant_unit) {
  // Initilize the list
  var drugs = [];

  // for each cancer
  for (j = 0; j < cancer_labels.length; j++) {
    // for each drug
    for (i = 0; i < data.length; i++) {
      // look only at drugs of the specified cancer
      if (data[i]["cancer"]["label"] == cancer_labels[j]) {
        var dose = 0;

        // nothing to comment here just an extensive case of switch - converts the units
        switch (dominant_unit.unit) {
          case "gram":
            switch (data[i]["unitsLabel"]) {
              case "milligram":
                dose = data[i]["dose"] / 10 ** 3;
                break;
              case "microgram":
                dose = data[i]["dose"] / 10 ** 6;
                break;
              case "gram":
                dose = data[i]["dose"];
                break;
            }
            break;
          case "microgram":
            switch (data[i]["unitsLabel"]) {
              case "milligram":
                dose = data[i]["dose"];
                break;
              case "microgram":
                dose = data[i]["dose"] * 10 ** 3;
                break;
              case "gram":
                dose = data[i]["dose"] * 10 ** 6;
                break;
            }
            break;
          case "milligram":
            switch (data[i]["unitsLabel"]) {
              case "milligram":
                dose = data[i]["dose"];
                break;
              case "microgram":
                dose = data[i]["dose"] / 10 ** 3;
                break;
              case "gram":
                dose = data[i]["dose"] * 10 ** 3;
                break;
            }
            break;
        }

        // if multiple cancer strings are passed down this code below ensures there are no duplicates in the final list
        // A duplicate in this case is NOT a drug that has two different dosages (that is why I have a seconf if statement)
        var freeToGo = true;

        for (k = 0; k < drugs.length; k++) {
          if (drugs[k].group == data[i]["mL"]) {
            if (drugs[k].value == dose) {
              freeToGo = false;
            }
          }
        }

        // If this is false then there is a duplicate and we ignore it
        if (freeToGo) {
          drugs.push({
            group: data[i]["mL"],
            value: dose,
          });
        }
        freeToGo = false;
      }
    }
  }

  return drugs;
}

// ########## CIRCLE CHART FUNCTIONS ##################

// Used for Circle chart - data preperation - we convert the data into a proper format
// Input: data_total = contains the results of both queries (one that gives drugs with specified dosage and one that gives all the drugs)
// cancer_labels = as aboce, a list containing cancer strings
// Output: drugs_sorted = a list containing dict for each cancer that has drugs categorized into drugs with defined and undefined dosages
function sortDrugs(data_total, cancer_labels) {
  allDrugs = data_total[1];
  definedDrugs = data_total[0];

  drugs_sorted = [];
  // {"name": cancer_label, "defined_drugs": [], "undefined_drugs":[]}

  // for each cancer
  for (i = 0; i < cancer_labels.length; i++) {
    definedDrugsList = [];
    allDrugsList = [];

    // for each drug for that cancer - add this drug to a list - allDrugsList
    for (j = 0; j < allDrugs.length; j++) {
      if (allDrugs[j].cancer.label == cancer_labels[i]) {
        allDrugsList.push(allDrugs[j].mL);
      }
    }

    // for each drug with dosage for that cancer - add this drug to a list - definedDrugsList
    for (j = 0; j < definedDrugs.length; j++) {
      if (definedDrugs[j].cancer.label == cancer_labels[i]) {
        definedDrugsList.push(definedDrugs[j].mL);
      }
    }
    // Taken form: https://stackoverflow.com/questions/14930516/compare-two-javascript-arrays-and-remove-duplicates
    // to get the undefined drugs just remove drugs that have a specified dosage from the list that contain all drugs
    undefinedDrugsList = allDrugsList.filter(function (val) {
      return definedDrugsList.indexOf(val) == -1;
    });

    // add dict of this cancer to the list
    drugs_sorted.push({
      name: cancer_labels[i],
      undefined: undefinedDrugsList,
      defined: definedDrugsList,
    });
  }
  return drugs_sorted;
}

// Used for Circle chart - data preperation - we convert the data into a proper format
// Input: drugs_sorted = taken from the sortDrugs function, a list containing a dict for each cancer with drugs with defined and undefined dosage
// Output: drugs = data in proper format for the Circle chart
function JSON_for_circle(drugs_sorted) {
  drugs = {
    name: "cancer",
    children: [],
  };

  // for each cancer in our dict - construct a proper dict
  for (i = 0; i < drugs_sorted.length; i++) {
    defined_dosage = drugs_sorted[i].defined;
    undefined_dosage = drugs_sorted[i].undefined;

    defined_dosage_json = { name: "Drugs with defined dosage", children: [] };
    undefined_dosage_json = {
      name: "Drugs without defined dosage",
      children: [],
    };

    // for each defined drug - add this drug to defined_dosage_json
    for (j = 0; j < defined_dosage.length; j++) {
      defined_dosage_json.children.push({ name: defined_dosage[j], size: 1 });
    }

    // for each undefined drug - add this drug to undefined_dosage_json
    for (j = 0; j < undefined_dosage.length; j++) {
      undefined_dosage_json.children.push({
        name: undefined_dosage[j],
        size: 1,
      });
    }

    // finish the dict for a specific cancer
    drugs.children.push({
      name: drugs_sorted[i].name,
      children: [defined_dosage_json, undefined_dosage_json],
    });
  }
  console.log(drugs);
  return drugs;
}

// ########## GENERAL FUNCTIONS ##################

// Used to show titles on click - paired with other visualizations
// Input: Title_text = selfexplanatory - but its worthmentioning its a list of string not a string, div_id = bascially a location of our titles
function VisInfo(Title_text, div_id) {
  for (i = 0; i < Title_text.length; i++) {
    document.getElementById(div_id[i]).innerHTML = Title_text[i];
  }
}

// Used to get the name of Q term that the user provided
function extractLabel(data) {
  return [data[0].cancer.label];
}

// As the name suggests - hides the plot button from the dialog window - we want to show the plot only after the user makes a successfull query
// and this funciton allows us to do exactly that
function hidePlotButton() {
  var x = document.getElementById("plotButton");
  x.style.display = "none";
}

// after cliking a button plots and updates the graphs - actually this calls two other functions - I made this function to have a little less code in the home.html :)))
// Input: pieChartData, barChartData = data for either pie Chart or bar Chart - this data is used in update_pie function and update_animated_bar_chart function
// for more information regarding those two functions check the better_pie_chart.js and animated_barchart.js
function updateGraphs(pieChartData, barChartData) {
  //used for different hrefs in animated_barchart.js - very crucial for user experience
  user_input = false;

  update_pie(pieChartData);
  update_animated_bar_chart(barChartData);
}

// brings everything together - used for pie and bar charts visualizations in home page - for the main data (that is that we have choosen)
function main() {
  get_data(get_query(main_terms))
    .then((data_total) => {
      data = data_total[0];

      // Prepare data for pie charts
      breast_cancer_forPie = extractData(data, breast_cancer_str);
      prostate_cancer_forPie = extractData(data, prostate_cancer_str);
      melanoma_forPie = extractData(data, melanoma_str);
      kidney_cancer_forPie = extractData(data, kidney_cancer_str);
      all_forPie = extractData(data, all);

      // Get the most dominant unit for each cancer
      dominant_BC = get_max(breast_cancer_forPie);
      dominant_PC = get_max(prostate_cancer_forPie);
      dominant_M = get_max(melanoma_forPie);
      dominant_KC = get_max(kidney_cancer_forPie);
      dominant_all = get_max(all_forPie);

      // Prepare data for bar charts
      bar_chart_data_BC = extract_drug_info(
        data,
        breast_cancer_str,
        dominant_BC
      );
      bar_chart_data_PC = extract_drug_info(
        data,
        prostate_cancer_str,
        dominant_PC
      );
      bar_chart_melanoma = extract_drug_info(data, melanoma_str, dominant_M);
      bar_chart_KC = extract_drug_info(data, kidney_cancer_str, dominant_KC);
      bar_chart_all = extract_drug_info(data, all, dominant_all);

      // Prepare data for circle chart
      data_for_circle = JSON_for_circle(sortDrugs(data_total, all));
      console.log(data_for_circle);

      // Prepare titles for bar charts
      bar_chart_BC_title =
        "Drugs for Breast Cancer expressed in " + dominant_BC.unit;
      bar_chart_PC_title =
        "Drugs for Prostate Cancer expressed in " + dominant_PC.unit;
      bar_chart_KC_title =
        "Drugs for Kidney Cancer expressed in " + dominant_KC.unit;
      bar_chart_M_title =
        "Drugs for Melanoma Cancer expressed in " + dominant_M.unit;
      bar_chart_all_title =
        "Drugs for all diseases expressed in " + dominant_all.unit;
    })

    // catch and view error if something went wrong
    .catch((error) => {
      alert("Something went wrong...", error);
    });
}

// Same purpose as main but does the visualization for data that the user has queried
function getInputValue() {
  terms = document.getElementById("userInput").value;
  user_input = true;

  get_data(get_query("wd:" + terms))
    .then((data_total) => {
      data = data_total[0];
      data_AllDrugs = data_total[1];

      // Get the term that the user has querried
      searchTerm_label = extractLabel(data);

      // Prepare data for pie chart
      searchTerm_forPie = extractData(data, searchTerm_label);

      // Get most dominant unit
      dominant_ST = get_max(searchTerm_forPie);

      // Prepare data for bar chart
      bar_chart_data_ST = extract_drug_info(
        data,
        searchTerm_label,
        dominant_ST
      );

      // inform the user about the outcome of his search
      alert("Your search term is: " + searchTerm_label);
      alert(
        "Total number of drugs loaded: " +
          data_AllDrugs.length +
          "\nNumber of drugs with defined dosage: " +
          bar_chart_data_ST.length +
          " -> Only those will be plotted"
      );

      // Prepare the titles
      pie_chart_user_title = "Units of " + searchTerm_label + " drugs";
      bar_chart_user_title =
        "Drugs for " + searchTerm_label + " expressed in " + dominant_ST.unit;

      document.getElementById("plotButton").style.display = "block";
    })

    // Catch and view error if something went wrong
    .catch((error) => {
      alert("Somethin went wrong, maybe your search term is wrong.");
      console.log("Something went wrong...", error);
    });
}
