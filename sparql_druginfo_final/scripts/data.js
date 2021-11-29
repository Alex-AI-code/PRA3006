var breast_cancer_str = ["breast cancer"];
var prostate_cancer_str = ["prostate cancer"];
var kidney_cancer_str = ["kidney cancer"];
var melanoma_str = ["melanoma"];
var all = ["melanoma", "kidney cancer", "prostate cancer", "breast cancer"];
var div_names = ["Title_pie", "Title_bar_chart"];
var searchTerm_label = "";
var user_input = false;

function extractData(data, cancer_labels) {
  var cancer_dose_raw = [
    { label: "gram", value: 0 },
    { label: "milligram", value: 0 },
    { label: "microgram", value: 0 },
  ];

  for (cancer = 0; cancer < cancer_labels.length; cancer++) {
    for (i = 0; i < data.length; i++) {
      if (data[i]["cancer"]["label"] == cancer_labels[cancer]) {
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
  cancer_dose = [];
  for (i = 0; i < cancer_dose_raw.length; i++) {
    if (cancer_dose_raw[i].value != 0) {
      cancer_dose.push(cancer_dose_raw[i]);
    }
  }
  return cancer_dose;
}

function get_max(cancer_dose) {
  var max = 0;
  var dominant_unit = { unit: "", value: 0 };

  for (let i = 0; i < Object.entries(cancer_dose).length; i++) {
    if (cancer_dose[i].value > max) {
      max = cancer_dose[i].value;
      dominant_unit.unit = cancer_dose[i].label;
      dominant_unit.value = max;
    }
  }
  return dominant_unit;
}

function extract_drug_info(data, cancer_labels, dominant_unit) {
  var drugs = [];

  for (j = 0; j < cancer_labels.length; j++) {
    for (i = 0; i < data.length; i++) {
      if (data[i]["cancer"]["label"] == cancer_labels[j]) {
        var dose = 0;

        switch (dominant_unit.unit) {
          case "gram":
            switch (data[i]["unitsLabel"]) {
              case "milligram":
                dose = data[i]["dose"] / 1000 ** 3;
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

        var freeToGo = true;

        for (k = 0; k < drugs.length; k++) {
          if (drugs[k].group == data[i]["mL"]) {
            if (drugs[k].value == dose) {
              freeToGo = false;
            }
          }
        }

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

function showTitle(Title_text, div_id) {
  for (i = 0; i < Title_text.length; i++) {
    document.getElementById(div_id[i]).innerHTML = Title_text[i];
  }
}
function extractLabel(data) {
  return [data[0].cancer.label];
}

function main() {
  get_data(get_query(main_terms))
    .then((data_total) => {
      data = data_total[0];
      console.log(data);

      breast_cancer_forPie = extractData(data, breast_cancer_str);
      prostate_cancer_forPie = extractData(data, prostate_cancer_str);
      melanoma_forPie = extractData(data, melanoma_str);
      kidney_cancer_forPie = extractData(data, kidney_cancer_str);
      all_forPie = extractData(data, all);

      dominant_BC = get_max(breast_cancer_forPie);
      dominant_PC = get_max(prostate_cancer_forPie);
      dominant_M = get_max(melanoma_forPie);
      dominant_KC = get_max(kidney_cancer_forPie);
      dominant_all = get_max(all_forPie);

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
      console.log(bar_chart_all);
    })
    .catch((error) => {
      console.log("Something went wrong...", error);
    });
}

function get_list() {
  get_data(get_query(main_terms))
    .then((data_total) => {})
    .catch((error) => {
      console.log("Something went wrong...", error);
    });
}

function compare(data_total) {
  drugs = [[], []];

  for (i = 0; i < data_total.length; i++) {
    for (j = 0; j < data_total[i].length; j++) {
      drugs.push();
    }
  }

  return drugs;
}

function getInputValue() {
  terms = document.getElementById("userInput").value;
  user_input = true;

  get_data(get_query("wd:" + terms))
    .then((data_total) => {
      data = data_total[0];
      data_AllDrugs = data_total[1];

      searchTerm_label = extractLabel(data);

      searchTerm_forPie = extractData(data, searchTerm_label);
      dominant_ST = get_max(searchTerm_forPie);
      bar_chart_data_ST = extract_drug_info(
        data,
        searchTerm_label,
        dominant_ST
      );

      alert("Your search term is: " + searchTerm_label);
      alert(
        "Total number of drugs loaded: " +
          data_AllDrugs.length +
          "\nNumber of drugs with defined dosage: " +
          bar_chart_data_ST.length +
          " -> Only those will be plotted"
      );

      document.getElementById("plotButton").style.display = "block";
    })
    .catch((error) => {
      alert("Somethin went wrong, maybe your search term is wrong.");
      console.log("Something went wrong...", error);
    });
}
function myFunction() {
  var x = document.getElementById("plotButton");
  x.style.display = "none";
}

function updateGraphs(pieChartData, barChartData) {
  user_input = false;
  update_pie(pieChartData);
  update_animated_bar_chart(barChartData);
}
