require("dotenv").config();
const dbPass = require("./passDB.js");
const mysql = require("mysql");
const inquirer = require("inquirer");
const colors = require("colors");
const table = require("console.table");
const _$ = require("currency-formatter");

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
            message: "Bamazon CLI - Manager Tools",
            choices: [
                "View Products for Sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add New Product",
                "Exit"
            ]
        })
        // present options to user
        .then(function (answer) {
            switch (answer.action) {
                case "View Products for Sale":
                    displayProducts();
                    break;
                case "View Low Inventory":
                    lowInventory();
                    break;
                case "Add to Inventory":
                    promptAddToCurrent();
                    break;
                case "Add New Product":
                    promptAddNewProduct();
                    break;
                case "Exit":
                    connection.end();
                    break;
            }
        });
}

// displays all products and columns to user
function displayProducts() {
    let query = "SELECT * FROM products";
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

// displays all items with an inventory of 5 or less
function lowInventory() {
    let lowThresh = 5;
    let getLow = "SELECT * FROM products WHERE stock_quantity <=" + lowThresh;
    connection.query(getLow, function (error, response) {
        if (error) {
            throw error;
        } else {
            console.log(""); // adds space above the table
            console.table(response, "\n");
            welcomePrompt();
        }
    })
}

// takes information to update inventory for current products
function promptAddToCurrent() {
    // gathers info from user
    inquirer
        .prompt([{
            name: "id",
            type: "input",
            message: "Select product to add inventory to. (enter product_id)",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }, {
            name: "quant",
            type: "input",
            message: "How many would you like to add?",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }])
        .then(function (answer) {
            addToCurrent(parseInt(answer.id), parseInt(answer.quant));
        })
}

// runs query to update the current quantity
function addToCurrent(u_id, u_quant) {
    // gets current so the updated total can be calculated
    let getCurrentQuant = "SELECT stock_quantity FROM products WHERE item_id = " + u_id;
    let getUpdated = "SELECT * FROM products WHERE item_id = " + u_id;
    let currentQuant = 0;
    let updatedQuant = 0;
    connection.query(getCurrentQuant, function (error, response) {
        if (error) {
            throw error;
        }
        // sets current quantity from db
        currentQuant = response[0].stock_quantity;
        updatedQuant = currentQuant + u_quant;
        // update query
        let update = "UPDATE products SET stock_quantity = " + updatedQuant + " WHERE item_id = " + u_id;
        connection.query(update, function (error) {
            if (error) {
                throw error;
            } else {
                connection.query(getUpdated, function (error, response) {
                    if (error) {
                        throw error;
                    }
                    // provides confirmation to user
                    console.log(""); // adds space above the table
                    console.log(colors.brightGreen("Inventory updated for:\n"));
                    console.table(response, "\n");
                    welcomePrompt();
                })
            }
        });
    })
}

// collects infomation for adding a new product
function promptAddNewProduct() {
    console.log(colors.brightGreen("Please enter the new product information below:"));
    inquirer
        .prompt([{
            name: "id",
            type: "input",
            message: "Item ID:"
        }, {
            name: "product",
            type: "input",
            message: "Product Name:"
        }, {
            name: "department",
            type: "input",
            message: "Department:"
        }, {
            name: "price",
            type: "input",
            message: "Price Each:"
        }, {
            name: "stock",
            type: "input",
            message: "Amount in Stock:"
        }])
        .then(function (answer) {
            let a = answer;
            addNewProduct(a.id, a.product, a.department, a.price, a.stock);
        })
}

// adds the new product to the database
function addNewProduct(id, product, department, price, stock) {
    // add new product query
    let p_add = "INSERT INTO products (item_id, product_name, department_name, price, stock_quantity, product_sales)" +
        "VALUES (" + id + ",\"" + product + "\",\"" + department + "\"," + price + "," + stock + "," + 0 + ")";
    connection.query(p_add, function (error) {
        if (error) {
            throw error;
        } else {
            // gathers updated product information and displays it
            let a_getUpdated = "SELECT * FROM products WHERE item_id = " + id;
            connection.query(a_getUpdated, function (error, response) {
                if (error) {
                    throw error;
                }
                console.log(""); // adds space above the table
                console.log(colors.brightGreen("The following product was added:\n"));
                console.table(response, "\n");
                welcomePrompt();
            });
        }
    });
}


// validation code I love but could not get to work correctly :(

// validate: function (value) {
//     let queryIds = "SELECT item_id FROM products";
//     let idIsValid = true;
//     connection.query(queryIds, function (error, response) {
//         if (error) {
//             throw error;
//         } else {
//             for (let i = 0; i < response.length; i++) {
//                 if (response[i].item_id === parseInt(value)) {
//                     idIsValid = false;
//                 }
//             }
//             if (idIsValid === false) {
//                 console.log(colors.brightRed("\n" + value + " is already in use.\nPress up arrow to re-enter:"));
//             } else {
//                 console.log(colors.brightGreen(" - ID Validated\n"));
//                 idIsValid = true;
//             }
//         }
//     })
//     if (idIsValid === true) {
//         return true;
//     } else {
//         return false;
//     }
// }