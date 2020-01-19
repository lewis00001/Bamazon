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

// gathers order information 
function getOrder() {
    inquirer
        .prompt([{
            name: "id",
            type: "input",
            message: "Which item would you like? (enter product_id)",
            validate: function (value) {
                // verifies number entry
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
                // verifies number entry
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

// gathers/checks order information
function confirmOrder(id, quant) {
    let _item = "";
    let _quant = 0;
    let _price = 0.00;
    let c_price = 0.00;
    let c_total = 0.00;
    // required since formatting is applied to c_total above
    let preFormatTotal = 0.00;

    for (let i = 0; i < db.length; i++) {
        // gets order information based on id entered
        if (db[i].item_id === parseInt(id)) {
            _item = db[i].product_name;
            _quant = parseInt(db[i].stock_quantity);
            _price = parseFloat(db[i].price);
            // applies money formatting for output
            c_price = _$.format(_price, {
                code: 'USD'
            });
            // calc total
            preFormatTotal = _price * quant;
            // applies money formatting for output
            c_total = _$.format(preFormatTotal, {
                code: 'USD'
            });
        }
    }

    // catches incorrect data entry, gives feedback
    if (_item === "") {
        console.log(colors.brightRed("\n*** Item not found ***\n"));
        actionPrompt();
    } else if (_quant < quant) {
        console.log(colors.brightRed("\n*** Order Declined: insufficient quantity\n" +
            "*** You ordered: " + quant + "\n" +
            "*** Items in stock: " + _quant + "\n"));
        actionPrompt();
    } else {
        processOrder(_item, quant, c_price, c_total, id, preFormatTotal);
    }
}

// presents/confirms order information with customer 
function processOrder(p_item, p_quant, p_c_price, p_c_total, p_id, p_preFormatTotal) {

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
                    updateInventory(p_quant, p_id, p_preFormatTotal);
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

// gathers current products and inventory apart from the product_sales
function displayProducts() {
    let query = "SELECT item_id, product_name, department_name, price, stock_quantity FROM products";
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

// updates inventory once an order is placed 
function updateInventory(u_quant, u_id, u_total) {
    let getCurrentQuant = "SELECT stock_quantity, product_sales FROM products WHERE item_id = " + u_id;
    let currentQuant = 0;
    connection.query(getCurrentQuant, function (error, response) {
            if (error) {
                throw error;
            }
            // sets current quantity from db
            currentQuant = response[0].stock_quantity;
            currentSales = parseFloat(response[0].product_sales);
            // ensures information is set as a float
            let updatedQuant = parseInt(currentQuant - u_quant);
            let updatedSales = parseFloat(currentSales + u_total);
            // update query
            let update = "UPDATE products SET stock_quantity = " + 
                        updatedQuant + " , product_sales = " + 
                        updatedSales + " WHERE item_id = " + u_id;
            // runs update to database
            connection.query(update, function (error) {
                if (error) {
                    throw error;
                }
            });
        })
}