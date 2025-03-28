require("dotenv").config();

const express = require("express");
const expressLayout = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const methodOverride = require("method-override")
const path = require('path');


const connectDB = require("./server/config/db");
const isActiveRoute = require("./server/helpers/routeHelpers");

const app = express();
const PORT = process.env.PORT || 3000;
 

connectDB();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,  
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: new Date(Date.now() + 60 * 60 * 1000) }
}))

app.use(express.static('public'));


app.use(expressLayout);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");


app.locals.isActiveRoute = isActiveRoute;

app.use("/", require("./server/routes/main"))
app.use("/", require("./server/routes/admin"))


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})