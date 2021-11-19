// create 2 data_set
var data1 = { a: 9, b: 20, c: 30, d: 8, e: 12 };
var data2 = { a: 6, b: 16, c: 20, d: 14, e: 19, f: 12 };

function extractData(data) {
  var bc_gram = [];
  var bc_miligram = [];
  var bc_microgram = [];
  var pc_gram = [];
  var pc_miligram = [];
  var pc_microgram = [];

  for (let i = 0; i < data.length; i++) {
    // if data is equal to breast cancer append
    if (data[i]["cL"] == "breast cancer") {
      if (data[i]["unitsLabel"] == "gram") {
        bc_gram.push(i);
      } else if (data[i]["unitsLabel"] == "milligram") {
        bc_miligram.push(i);
      } else {
        bc_microgram.push(i);
      }
    } else {
      if (data[i]["unitsLabel"] == "gram") {
        pc_gram.push(i);
      } else if (data[i]["unitsLabel"] == "milligram") {
        pc_miligram.push(i);
      } else {
        pc_microgram.push(i);
      }
    }
  }

  return [
    bc_gram,
    bc_miligram,
    bc_microgram,
    pc_gram,
    pc_miligram,
    pc_microgram,
    data,
  ];
}

function prepareData(data) {
  bc_gram = data[0];
  bc_miligram = data[1];
  bc_microgram = data[2];
  pc_gram = data[3];
  pc_miligram = data[4];
  pc_microgram = data[5];
  data = data[6];

  var a = bc_gram.length;
  var b = bc_miligram.length;
  var c = bc_microgram.length;
  var d = pc_gram.length;
  var e = pc_miligram.length;
  var f = pc_microgram.length;

  // create a variable that has the number of values in each unit
  var test = [a, b, c, d, e, f];

  // create 2 data_set
  var Breast_cancer = {
    gram: test[0],
    miligram: test[1],
    microgram: test[2],
  };
  var Prostate_cancer = {
    gram: test[3],
    miligram: test[4],
    microgram: test[5],
  };

  return [Breast_cancer, Prostate_cancer];
}
