require("dotenv").config();
const dbPass = require("./passDB.js");
const mysql = require("mysql");
const inquirer = require("inquirer");
const colors = require("colors");
const table = require("console.table");
const _$ = require("currency-formatter");

let db = {};

let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: dbPass.pass.p,
    database: "bamazonDB"
});

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
            message: "Bamazon CLI - Manager Tools",
            choices: [
                "View Products for Sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add New Product",
                "Exit"
            ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "View Products for Sale":
                    displayProducts();
                    break;
                case "View Low Inventory":
                    lowInventory();
                    console.log("view low");
                    break;
                case "Add to Inventory":
                    //displayProducts();
                    console.log("add");
                    break;
                case "Add New Product":
                    //displayProducts();
                    console.log("add new");
                    break;
                case "Exit":
                    connection.end();
                    break;
            }
        });
}

function displayProducts() {
    let query = "SELECT * FROM products";
    connection.query(query, function (error, response) {
        if (error) {
            throw error;
        } else {
            console.log(""); // adds space above the table
            console.table(response, "\n");
            db = response;
            orderPrompt();
        }
    });
}

function lowInventory() {
    console.log("view low");
}

function updateInventory(u_quant, u_id) {
    let getCurrentQuant = "SELECT stock_quantity FROM products WHERE item_id = " + u_id;
    let currentQuant = 0;
    connection.query(getCurrentQuant, function (error, response) {
        
            if (error) {
                throw error;
            }
            currentQuant = response[0].stock_quantity;
            console.log("\nThe current quant is: " + currentQuant);

            let updatedQuant = currentQuant - u_quant;
            console.log("The updated quant is: " + updatedQuant);
            let update = "UPDATE products SET stock_quantity = " + updatedQuant + " WHERE item_id = " + u_id;
            connection.query(update, function (error, response) {
                if (error) {
                    throw error;
                }
            });
        })
}