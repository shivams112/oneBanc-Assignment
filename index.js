const { StandardizeStatement }  = require("./StandardizeStatement.js");


//path of csv file which you want to standardize, you can try with different
// for ex:  "./files/HDFC-Input-Case1.csv"
const filePath = "./files/Axis-Input-Case3.csv"

//a method which takes filepath (CSV file) as an input and creates a standardize csv output
StandardizeStatement(filePath);

// The output file will be generated inside `outputs` folder in project directory
