require("dotenv").config();
const dbPass = require("./passDB.js");
const mysql = require("mysql");
const inquirer = require("inquirer");
const colors = require("colors");
const table = require("console.table");
const _$ = require("currency-formatter");

// stores returned database
let db = {};

// setup connection
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: dbPass.pass.p,
    database: "bamazonDB"
});

// if connection is set, prompt user
connection.connect(function (error) {
    if (error) {
        throw error;
    } else {
        welcomePrompt();
    }
});

function welcomePrompt() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "Bamazon CLI - Supervisor Tools",
            choices: [
                "View Product Sales by Department",
                "Create New Department",
                "Exit"
            ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "View Product Sales by Department":
                    displayDepartments();
                    break;
                case "Create New Department":
                    promptAddNewDepartment();
                    break;
                case "Exit":
                    connection.end();
                    break;
            }
        });
}

// displays all department information 
function displayDepartments() {
    let query = "SELECT d.department_id, p.department_name, d.over_head_costs, " +
        "SUM(p.product_sales) AS product_sales_total, " +
        "SUM(p.product_sales) - d.over_head_costs AS total_profit " +
        "FROM products p " +
        "JOIN departments d " +
        "ON p.department_name = d.department_name " +
        "group by p.department_name;";
    connection.query(query, function (error, response) {
        if (error) {
            throw error;
        } else {
            console.log(""); // adds space above the table
            console.table(response, "\n");
            welcomePrompt();
        }
    });
}

// gathers data to add a new department 
function promptAddNewDepartment() {
    console.log(colors.brightGreen("Please enter the new department information below:"));
    inquirer
        .prompt([{
            name: "id",
            type: "input",
            message: "Department ID:"
        }, {
            name: "department",
            type: "input",
            message: "Department Name:"
        }, {
            name: "overhead",
            type: "input",
            message: "Overhead Cost:"
        }])
        .then(function (answer) {
            let a = answer;
            addNewDepartment(a.id, a.department, a.overhead);
        })
}

// runs query to add new department information to the database
function addNewDepartment(id, department, overhead) {
    let p_add = "INSERT INTO departments (department_id, department_name, over_head_costs) " +
        "VALUES (" + id + ",\"" + department + "\",\"" + overhead + "\")";
    connection.query(p_add, function (error) {
        if (error) {
            throw error;
        } else {
            console.log(""); // adds space above the table
            console.log(colors.brightGreen("New department created.\n"));
            console.log(colors.brightGreen("Department will appear on sales chart after products have been added.\n"));
            welcomePrompt();
        }
    });
}