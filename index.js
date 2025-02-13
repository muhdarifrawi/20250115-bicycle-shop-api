const express = require("express");
const bodyParser  = require("body-parser");

require("dotenv").config();

var cors = require('cors')
let app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const { createConnection } = require('mysql2/promise');
const { authCheck, generateAccessToken } = require("./auth");
const { verifyUser } = require("./user");

let connection;

async function main() {
    connection = await createConnection({
        "host": process.env.DB_HOST,
        "user": process.env.DB_USER,
        "database": process.env.DB_NAME,
        "password": process.env.DB_PASSWORD,
        "namedPlaceholders": true,
        waitForConnections: true,
        connectionLimit: 10000,
        queueLimit: 0,
    })

    app.post("/login", verifyUser, (req, res) => {
        // const user = verifyUser(req,res);
        // res.json({user});
        // const token = generateAccessToken("tester1");
        // res.json({token});
    })

    app.get("/", authCheck , (req, res) => {
        try {
            res.status(200).json({
                message: "API is running"
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    })

    app.get("/products", async (req, res) => {
        try {
            let [products] = await connection.execute({
                sql: `SELECT * FROM product
                    LEFT JOIN item ON item.item_id = product.item_id_fk
                    LEFT JOIN service ON service.service_id = product.service_id_fk;`,
                nestTables: true
            });
            res.status(200).json({ products });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    });

    app.get("/products/add", async (req, res) => {
        try {
            let [item] = await connection.execute(`SELECT * FROM item;`);
            let [service] = await connection.execute(`SELECT * FROM service;`);
            res.status(200).json({
                item,
                service
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    });

    app.post("/products/add", async (req, res) => {
        try {
            let {
                productNameInput,
                productImageInput,
                itemId,
                serviceId
            } = req.body;

            let query = `INSERT INTO product (
                        name, image_url, item_id_fk, service_id_fk)
                        VALUES (?,?,?,?);`;
            let bindings = [
                productNameInput,
                productImageInput,
                itemId,
                serviceId
            ];

            await connection.execute(query, bindings);
            res.status(200).json({
                message: "service added"
            });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error", 
            });
        }
    });

    app.get("/products/edit/:id", async (req, res) => {
        try {
            let id = req.params.id
            let [product] = await connection.execute(`SELECT * FROM product WHERE product_id = ?`, id)
            product = product[0];
            let [item] = await connection.execute(`SELECT * FROM item;`);
            let [service] = await connection.execute(`SELECT * FROM service;`);
            res.status(200).json({
                product,
                item,
                service
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    });

    app.post("/products/edit/:id", async (req, res) => {
        try {
            let id = req.params.id;
            let {
                productNameInput,
                productImageInput,
                itemId,
                serviceId
            } = req.body;

            let query = `UPDATE product SET 
                    name=?, image_url=?, item_id_fk=?, service_id_fk=?
                    WHERE product_id= ?;`;
            let bindings = [
                productNameInput,
                productImageInput,
                itemId,
                serviceId,
                id
            ];

            await connection.execute(query, bindings);

            res.status(200).json({
                message: "service edited"
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    });

    app.post("/products/delete/:id", async function (req, res) {
        try {
            let id = req.params.id;
            await connection.execute(`DELETE FROM product WHERE product_id = ?`, id);
            res.sendStatus(200)
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    })

    app.get("/services", async (req, res) => {
        try {
            let [services] = await connection.execute({
                sql: `SELECT * FROM service
                    INNER JOIN serviceType ON serviceType.service_type_id = service.service_type_id_fk
                    INNER JOIN staff ON staff.staff_id = service.staff_id_fk;`,
                nestTables: true
            });
            res.status(200).json({ services });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    });

    app.get("/services/add", async (req, res) => {
        try {
            let [serviceType] = await connection.execute(`SELECT * FROM serviceType;`);
            let [staff] = await connection.execute(`SELECT * FROM staff;`);
            res.status(200).json({
                serviceType,
                staff
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    });

    app.post("/services/add", async (req, res) => {
        console.log(req.body);
        try {
            let {
                serviceNameInput,
                serviceCostInput,
                serviceTypeId,
                staffId
            } = req.body;

            let query = `INSERT INTO service (
                        name, cost, service_type_id_fk, staff_id_fk)
                        VALUES (?,?,?,?);`;
            let bindings = [
                serviceNameInput,
                serviceCostInput,
                serviceTypeId,
                staffId
            ];

            await connection.execute(query, bindings);
            res.status(200).json({
                message: "service added"
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    });

    app.get("/services/edit/:id", async (req, res) => {
        try {
            let id = req.params.id
            let [service] = await connection.execute(`SELECT * FROM service WHERE service_id = ?`, id)
            service = service[0];
            let [serviceType] = await connection.execute(`SELECT * FROM serviceType;`);
            let [staff] = await connection.execute(`SELECT * FROM staff;`);
            res.status(200).json({
                serviceType,
                staff,
                service
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    });

    app.post("/services/edit/:id", async (req, res) => {
        try {
            let id = req.params.id;
            let {
                serviceNameInput,
                serviceCostInput,
                serviceTypeId,
                staffId
            } = req.body;

            let query = `UPDATE service SET 
                    name=?, cost=?, service_type_id_fk=?, staff_id_fk=?
                    WHERE service_id= ?;`;
            let bindings = [
                serviceNameInput,
                serviceCostInput,
                serviceTypeId,
                staffId,
                id
            ];

            await connection.execute(query, bindings);

            res.status(200).json({
                message: "service edited"
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    });

    app.get("/services/delete/:id", async function (req, res) {
        try {
            let id = req.params.id
            let [service] = await connection.execute(`SELECT * FROM service WHERE service_id = ?`, id)
            service = service[0];
            let [serviceType] = await connection.execute(`SELECT * FROM serviceType;`);
            let [staff] = await connection.execute(`SELECT * FROM staff;`);
            res.render("services/delete", {
                "serviceType": serviceType,
                "staff": staff,
                "service": service
            })
            res.status(200).json({
                serviceType,
                staff,
                service
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    })

    app.post("/services/delete/:id", async function (req, res) {
        try {
            console.log(req.params.id);
            let id = req.params.id;
            await connection.execute(`DELETE FROM service WHERE service_id = ?`, id);

            res.sendStatus(200);
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    })

    app.post("/services", async function (req, res) {
        try {
            let searchInput = [req.body.searchInput];
            console.log(searchInput);
            let serviceTypeId = searchInput[0];
            console.log("SERVICE TYPE ID >>>", serviceTypeId);
            let [services] = [];
            if (searchInput[0] == 0) {
                [services] = await connection.execute({
                    sql: `SELECT * FROM service
                    INNER JOIN serviceType ON serviceType.service_type_id = service.service_type_id_fk
                    INNER JOIN staff ON staff.staff_id = service.staff_id_fk;`,
                    nestTables: true
                });
            }
            else {
                [services] = await connection.execute({
                    sql: `SELECT * FROM service
                    INNER JOIN serviceType ON serviceType.service_type_id = service.service_type_id_fk
                    INNER JOIN staff ON staff.staff_id = service.staff_id_fk
                    WHERE service_type_id_fk = ?;`,
                    nestTables: true
                }, [serviceTypeId]);
            }
            res.status(200).json({
                message: "service search",
                services
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    })

    app.get("/items", async (req, res) => {
        try {
            let [items] = await connection.execute({
                sql: `SELECT * FROM item
                    INNER JOIN itemType ON itemType.item_type_id = item.item_type_id_fk
                    INNER JOIN brand ON brand.brand_id = item.brand_id_fk;`,
                nestTables: true
            });
            res.status(200).json({
                items
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    });

    app.get("/items/add", async (req, res) => {
        try {
            let [itemType] = await connection.execute(`SELECT * FROM itemType;`);
            let [brand] = await connection.execute(`SELECT * FROM brand;`);
            res.status(200).json({
                itemType,
                brand
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    });

    app.post("/items/add", async (req, res) => {
        try {
            let {
                itemNameInput,
                itemCostInput,
                itemTypeId,
                brandId
            } = req.body;

            let query = `INSERT INTO item (
                    name, cost, item_type_id_fk, brand_id_fk)
                    VALUES (?,?,?,?);`;
            let bindings = [
                itemNameInput,
                itemCostInput,
                itemTypeId,
                brandId
            ];

            await connection.execute(query, bindings);

            res.status(200).json({
                message: "item added"
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    });

    app.get("/items/edit/:id", async (req, res) => {
        try {
            let id = req.params.id;
            let [item] = await connection.execute('SELECT * from item WHERE item_id = ?', id);
            item = item[0];
            let [itemType] = await connection.execute(`SELECT * FROM itemType;`);
            let [brand] = await connection.execute(`SELECT * FROM brand;`);
            res.status(200).json({
                itemType,
                brand,
                item
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    });

    app.post("/items/edit/:id", async (req, res) => {
        try {
            let id = req.params.id;
            let {
                itemNameInput,
                itemCostInput,
                itemTypeId,
                brandId
            } = req.body;

            let query = `UPDATE item SET 
                    name=?, cost=?, item_type_id_fk=?, brand_id_fk=?
                    WHERE item_id= ?;`;
            let bindings = [
                itemNameInput,
                itemCostInput,
                itemTypeId,
                brandId,
                id
            ];

            await connection.execute(query, bindings);
            res.status(200).json({
                message: "item edited"
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    });

    app.get("/items/delete/:id", async function (req, res) {
        try {
            let id = req.params.id;
            let [item] = await connection.execute('SELECT * from item WHERE item_id = ?', id);
            item = item[0];
            let [itemType] = await connection.execute(`SELECT * FROM itemType;`);
            let [brand] = await connection.execute(`SELECT * FROM brand;`);
            res.render('items/delete', {
                "itemType": itemType,
                "brand": brand,
                "item": item
            })
            res.status(200), json({
                itemType,
                brand,
                item
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    })

    app.post("/items/delete/:id", async function (req, res) {
        try {
            let id = req.params.id;
            await connection.execute(`DELETE FROM item WHERE item_id = ?`, id);
            res.status(200).json({
                message: "item deleted"
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    })

    app.get("/cart", async function (req, res) {
        try {
            let [cart] = await connection.execute({
                sql: `SELECT * FROM cartItems
                    INNER JOIN product ON product.product_id = cartItems.product_id_fk
                    INNER JOIN user ON user.user_id = cartItems.user_id_fk;`,
                nestTables: true
            });
            res.status(200).json({
                cart
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    })

    app.get("/cart/add/:id", async function (req, res) {
        try {
            let id = req.params.id
            let [product] = await connection.execute(`SELECT * FROM product WHERE product_id = ?`, id);
            product = product[0];
            let [user] = await connection.execute(`SELECT * FROM user;`);
            res.status(200).json({
                product,
                user
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    })

    app.post("/cart/add/:id", async function (req, res) {
        try {
            let {
                name,
                quantity,
                productId,
                userId
            } = req.body;
    
            if (productId == "" || !productId) {
                productId = null;
            }
    
            if (userId == "" || !userId) {
                userId = null;
            }
    
            console.log(name,
                quantity,
                productId,
                userId);
            let query = `INSERT INTO cartItems (
                        name, quantity, product_id_fk, user_id_fk)
                        VALUES (?,?,?,?);`;
            let bindings = [
                name,
                quantity,
                productId,
                userId
            ];
    
            await connection.execute(query, bindings);
            res.redirect('/products');
            res.status(200).json({
                message: "added to cart"
            });
        } 
        catch (error) {
            res.status(500).json({
                message: "Internal Server Error"
            });
        }
    })

    app.listen(3000, () => {
        console.log('Server is running')
    });
}

main();