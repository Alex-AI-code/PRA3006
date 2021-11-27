var breast_cancer_str = ["breast cancer"];
var prostate_cancer_str = ["prostate cancer"];
var kidney_cancer_str = ["kidney cancer"];
var melanoma_str = ["melanoma"];
var all = ["melanoma", "kidney cancer", "prostate cancer", "breast cancer"];

function extractData(data, cancer_labels) {
  var cancer_dose = {
    gram: 0,
    milligram: 0,
    macrogram: 0,
  };
  for (cancer = 0; cancer < cancer_labels.length; cancer++) {
    for (i = 0; i < data.length; i++) {
      if (data[i]["cancer"]["label"] == cancer_labels[cancer]) {
        switch (data[i]["unitsLabel"]) {
          case "gram":
            cancer_dose.gram = cancer_dose.gram + 1;
            break;
          case "milligram":
            cancer_dose.milligram = cancer_dose.milligram + 1;
            break;
          case "microgram":
            cancer_dose.macrogram = cancer_dose.macrogram + 1;
            break;
        }
      }
    }
  }
  return cancer_dose;
}

function get_max(cancer_dose) {
  var max = 0;
  var dominant_unit = { unit: "", value: 0 };

  for (let i = 0; i < Object.entries(cancer_dose).length; i++) {
    if (Object.values(cancer_dose)[i] > max) {
      max = Object.values(cancer_dose)[i];
      dominant_unit.unit = Object.keys(cancer_dose)[i];
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

function main() {
  get_data()
    .then((data) => {
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