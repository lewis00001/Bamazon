require("dotenv").config();
const dbPass = require("./passDB.js");
const mysql = require("mysql");
const inquirer = require("inquirer");
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
            confirmOrder(answer.id, answer.quant);
        })
}

function confirmOrder(id, quant) {
    let _item = "";
    let _price = 0.00;
    let c_price = 0.00;
    let c_total = 0.00;

    for (let i = 0; i < db.length; i++) {
        if (db[i].item_id === parseInt(id)) {
            _item = db[i].product_name;
            _price = parseFloat(db[i].price);
        }
        c_price = _$.format(_price, {
            code: 'USD'
        });
        c_total = _$.format(_price * quant, {
            code: 'USD'
        });
    }

    console.log("\nOrder Details: \n" +
        "- - - - - - - - - - - - - - - - - - - - - - - - -\n" +
        "Item: " +        _item +   "\n" +
        "Quantity: " +    quant +   "\n" +
        "Unit Price: " +  c_price + "\n" +
        "Total Price: " + c_total + "\n" +
        "- - - - - - - - - - - - - - - - - - - - - - - - -\n"
    );

    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "Is this information correct?",
            choices: [
                "Yes",
                "No",
                "Exit"
            ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "Yes":
                    console.log("\n*** Thank you. Your order is complete. ***\n");
                    orderPrompt();
                    break;
                case "No":
                    displayProducts();
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