//Main logic or I would say a small parser which can normalize your CSV files

const fs = require("fs");
const papa = require("papaparse");

const outDateCol = 0,
  outDescCol = 1,
  outDebit = 2,
  outCredit = 3,
  outCurrency = 4,
  outCardName = 5,
  outTransaction = 6, //domestic or International
  outLocation = 7;
  

const StandardizeStatement = (filePath) => {  
const file = fs.createReadStream(filePath);
papa.parse(file, {
  complete: (result) => {
    let ss = mainLogic(result.data);
    // console.log(ss);
  },
});
}
// var csvv = papa.unparse(ss);

const create2dArray = (row, col) => {
  let outputArray = Array(row)
    .fill()
    .map(() => Array(col).fill("-1"));
  // for (var i = 0; i < row; i++) {
  //   for (var j = 0; j < col; j++) outputArray[i][j] = "0";
  // }
  outputArray[0][0] = "Date";
  outputArray[0][1] = "Transaction Description";
  outputArray[0][2] = "Debit";
  outputArray[0][3] = "Credit";
  outputArray[0][4] = "Currency";
  outputArray[0][5] = "CardName";
  outputArray[0][6] = "Transaction";
  outputArray[0][7] = "Location";

  return outputArray;
};

const mainLogic = (inputCsv) => {
  let outputArray = create2dArray(inputCsv.length, 8);
  let transactionType = "Domestic";
  let row = 1;
  let dateCol,
    debit,
    credit,
    amount,
    transactionDetails,
    transactionTypeCol,
    name = "";
  var i = 0;
  try {
    while (i < inputCsv.length) {
      for (var j = 0; j < inputCsv[i].length; j++) {
        let cell = inputCsv[i][j];
        cell = cell.trim();
        if (cell === "Domestic Transactions") {
          transactionType = "Domestic";
          for (var k = 0; k < inputCsv[i + 2].length; k++) {
            if (inputCsv[i + 2][k] !== "") name = inputCsv[i + 2][k];
          }
          // i+=4;
          // continue;
          transactionTypeCol = j;
        } else if (cell === "International Transactions" || cell === "International Transaction" ) {
          transactionType = "International";
          for (var k = 0; k < inputCsv[i + 2].length; k++) {
            if (inputCsv[i + 2][k] !== "") name = inputCsv[i + 2][k];
          }
          transactionTypeCol = j;
          // i+=4;
          // continue;
        } else if (cell === "Date") {
          for (var k = 0; k < inputCsv[i + 2].length; k++) {
            if (inputCsv[i + 1][k] !== "") name = inputCsv[i + 1][k];
          }
          dateCol = j;
        } else if (cell === "Debit") debit = j;
        else if (cell === "Credit") credit = j;
        else if (
          cell === "Transaction Details" ||
          cell === "Transaction Description"
        )
          transactionDetails = j;
        else if (cell === "Amount") amount = j;
        else {
          if (j === dateCol && cell !== "") outputArray[row][outDateCol] = cell;
          else if (j === debit && cell !== "")
            outputArray[row][outDebit] = cell;
          else if (j === credit && cell !== "")
            outputArray[row][outCredit] = cell;
          else if (j === amount && cell !== "") {
            let temp = cell.split(" ");
            if (temp.length > 1) outputArray[row][outCredit] = temp[0];
            else outputArray[row][outDebit] = temp[0];
          } else if (j === transactionDetails && cell !== "") {
            let temp = cell.split(" ");
            let x = [...temp];
            x.pop();
            let y = x.join(" ");
            y = y.trim();
            //let temp2 =
            if (transactionType === "Domestic") {
              outputArray[row][outLocation] = temp[temp.length - 1];
              outputArray[row][outDescCol] = cell;
            } else {
              outputArray[row][outCurrency] = temp[temp.length - 1];
              outputArray[row][outDescCol] = y;
              y = y.split(" ");
              outputArray[row][outLocation] = y[y.length - 1];
            }
          } if (
            j === transactionTypeCol &&
            cell !== "" &&
            inputCsv[i][j - 1] === "" &&
            inputCsv[i][j + 1] === "" &&
            cell !== transactionType
          ) {
            name = cell;
          }
        }
      }
      outputArray[row][outTransaction] = transactionType;
      if (transactionType == "Domestic") outputArray[row][outCurrency] = "INR";
      if (name !== "") outputArray[row][outCardName] = name;
      
      row++;
      i++;
    }
    //
  } catch (e) {
    console.log(e);
  }
  // console.log(outputArray);
  for (var i = 0; i < outputArray.length; i++) {
    if (outputArray[i][0] === "-1" || outputArray[i][1] === "-1") {
      outputArray.splice(i, 1);
      i--;
      continue;
    }
    var flag = 0;
    for (var j = 0; j < outputArray[i].length; j++) {
      if (outputArray[i][j] !== "-1") {
        flag = 1;
        break;
      }
    }
    if (flag === 0) {
      outputArray.splice(i, 1);
      i--;
    }
  }

  //clean array
  for (var i = 0; i < outputArray.length; i++) {
    for (var j = 0; j < outputArray.length; j++) {
      if (outputArray[i][j] === "-1") outputArray[i][j] = "0";
    }
  }

  fs.writeFile("./files/output.txt", JSON.stringify(outputArray), (err)=>console.log(err));
  var x = papa.unparse(outputArray);
  fs.writeFile("./outputs/csvOut.csv", x, (err)=>console.log(err));
  // console.log(x);
  return outputArray;
};

module.exports = {StandardizeStatement}
