require("dotenv").config();
const cors = require('cors');
const express = require("express");
const mongoose = require("mongoose");
const flash = require("express-flash");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const OrderRouter = require("./routers/OrderRouter");
const ProductRouter = require("./routers/ProductRouter");
const AccountRouter = require("./routers/AccountRouter");


const app = express();

app.use(cors());
app.use(flash());
app.use(cookieParser("mvm"));
app.use(
  session({
    cookie: { maxAge: 6000 },
  })
);
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/account", AccountRouter);
app.use("/product", ProductRouter);

app.get("/", (request, response) => {});

const port = process.env.PORT || 8080;

mongoose
  .connect("mongodb://localhost/point-of-sale", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log("Database connection failed: " + error.message);
  });
