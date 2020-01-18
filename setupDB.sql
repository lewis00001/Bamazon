DROP DATABASE IF EXISTS bamazonDB;
CREATE DATABASE bamazonDB;
USE bamazonDB;

CREATE TABLE products (
    item_id INT NOT NULL,
	product_name VARCHAR(127) NOT NULL,
    department_name VARCHAR(127) NOT NULL,
    price DECIMAL(8,2),
    stock_quantity INT NOT NULL,
    product_sales DECIMAL(10,2) NOT NULL
); 

CREATE TABLE departments (
    department_id INT NOT NULL,
	department_name VARCHAR(127) NOT NULL,
    over_head_costs DECIMAL(10,2) NOT NULL
); 
