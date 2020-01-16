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

function actionPrompt() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "Please make a selection.",
            choices: [
                "View Inventory",
                "Place an order",
                "Exit"
            ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "View Inventory":
                    displayProducts();
                    break;
                case "Place an order":
                    getOrder();
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
    let _quant = 0;
    let _price = 0.00;
    let c_price = 0.00;
    let c_total = 0.00;

    for (let i = 0; i < db.length; i++) {
        if (db[i].item_id === parseInt(id)) {
            _item = db[i].product_name;
            _quant = parseInt(db[i].stock_quantity);
            _price = parseFloat(db[i].price);

            c_price = _$.format(_price, {
                code: 'USD'
            });
            c_total = _$.format(_price * quant, {
                code: 'USD'
            });
        }
    }

    if (_item === "") {
        console.log(colors.brightRed("\n*** Item not found ***\n"));
        actionPrompt();
    } else if (_quant < quant) {
        console.log(colors.brightRed("\n*** Order Declined: insufficient quantity\n" +
            "*** You ordered: " + quant + "\n" +
            "*** Items in stock: " + _quant + "\n"));
        actionPrompt();
    } else {
        processOrder(_item, quant, c_price, c_total, id);
    }
}

function processOrder(p_item, p_quant, p_c_price, p_c_total, p_id) {

    console.log(colors.brightGreen("\nOrder Details: \n" +
        "- - - - - - - - - - - - - - - - - - - - - - - - -\n" +
        "Item: " + p_item + "\n" +
        "Quantity: " + p_quant + "\n" +
        "Unit Price: " + p_c_price + "\n" +
        "Total Price: " + p_c_total + "\n" +
        "- - - - - - - - - - - - - - - - - - - - - - - - -\n"
    ));

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
                    console.log(colors.brightGreen("\n*** Thank you. Your order is complete. ***\n"));
                    updateInventory(p_quant, p_id);
                    actionPrompt();
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