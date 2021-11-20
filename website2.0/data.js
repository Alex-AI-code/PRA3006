function extractData(data, cancer_label) {
  var cancer_dose = {
    gram: 0,
    milligram: 0,
    macrogram: 0,
  };
  for (i = 0; i < data.length; i++) {
    if (data[i]["cL"] == cancer_label) {
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
    if (data[i]["cL"] == cancer_label) {
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
