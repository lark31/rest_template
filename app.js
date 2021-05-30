const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");
const userRoutes = require('./api/routes/user');

require('dotenv').config();

const connect = async(url) => {
    try {
        await mongoose.connect(mongoUrl, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useFindAndModify: false,
            useCreateIndex: true,
        });
        console.log('Database connected to', process.env.MONGO_DB_DATABASE);
    } catch (err) {
        console.error('Database connection failed:', err.message)
    };
}

const mongoUrl = "mongodb+srv://" +
    process.env.MONGO_DB_USER +
    ":" +
    process.env.MONGO_DB_PW +
    process.env.MONGO_DB_URL +
    process.env.MONGO_DB_DATABASE +
    '?retryWrites=true&w=majority';

connect(mongoUrl);

app.use(morgan("dev"));
app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});

// Routes which should handle requests
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/user", userRoutes);

app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;