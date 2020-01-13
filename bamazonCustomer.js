require("dotenv").config();
const dbPass = require("./passDB.js");
const mysql = require("mysql");
const inquirer = require("inquirer");
const table = require("console.table");

let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: dbPass.pass.p,
    database: "bamazonDB"
});

connection.connect(function (error) {
    if (error) throw error;
    welcomePrompt();
});

function welcomePrompt() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "Welcome to the Bamazon CLI.",
            choices: [
                "View Inventory",
                "Exit"
            ]

        })
        .then(function (answer) {
            switch (answer.action) {
                case "View Inventory":
                    displayProducts();
                    break;
                case "Exit":
                    connection.end();
                    break;
            }
        });
}

function orderPrompt() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "Place an order",
                "Exit"
            ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "Place an order":
                    getOrder();
                    break;
                case "Exit":
                    connection.end();
                    break;
            }
        });
}

function getOrder() {
    inquirer
        .prompt([{
            name: "id",
            type: "input",
            message: "Which item would you like? (enter product_id)",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }, {
            name: "quant",
            type: "input",
            message: "How many would you like?",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }])
        .then(function (answer) {
            console.log("You ordered:\n" + answer.quant + " of " + answer.id);
        })
}

function displayProducts() {
    let query = "SELECT * FROM products";
    connection.query(query, function (error, response) {
        if (error) {
            throw error;
        } else {
            console.table(response, "\n");
            orderPrompt();
        }
    });
}