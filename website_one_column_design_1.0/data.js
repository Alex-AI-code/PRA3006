var breast_cancer_str = "breast cancer";
var prostate_cancer_str = "prostate cancer";
var kidney_cancer_str = "kidney cancer";
var melanoma_str = "malenoma";

function extractData(data, cancer_label) {
  var cancer_dose = {
    gram: 0,
    milligram: 0,
    macrogram: 0,
  };
  for (i = 0; i < data.length; i++) {
    if (data[i]["cancer"]["label"] == cancer_label) {
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
function extract_drug_info(data, cancer_label, dominant_unit) {
  var drugs = [];

  for (i = 0; i < data.length; i++) {
    if (data[i]["cancer"]["label"] == cancer_label) {
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

      drugs.push({
        group: data[i]["mL"],
        value: dose,
      });
    }
  }

  return drugs;
}
function main() {
  get_data()
    .then((data) => {
      console.log(data);
      breast_cancer = extractData(data, "breast cancer");
      prostate_cancer = extractData(data, "prostate cancer");
      melanoma = extractData(data, "melanoma");
      kidney_cancer = extractData(data, "kidney cancer");

      dominant_BC = get_max(breast_cancer);
      dominant_PC = get_max(prostate_cancer);
      dominant_M = get_max(melanoma);
      dominant_KC = get_max(kidney_cancer);

      bar_chart_data_BC = extract_drug_info(data, "breast cancer", dominant_BC);
      bar_chart_data_PC = extract_drug_info(
        data,
        "prostate cancer",
        dominant_PC
      );
      bar_chart_melanoma = extract_drug_info(data, "melanoma", dominant_M);
      bar_chart_KC = extract_drug_info(data, "kidney cancer", dominant_KC);

      console.log(bar_chart_data_BC);
    })
    .catch((error) => {
      console.log("Something went wrong...", error);
    });
}
