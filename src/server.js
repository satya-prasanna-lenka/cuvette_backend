require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
var cors = require("cors");

const { DB_CONNECTION_URL } = require("./configs/config");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(cors());
const port = 5000;
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use("/api/users", require("./routes/userRoute"));

app.use(errorHandler);

mongoose.connect(DB_CONNECTION_URL);
// {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   autoIndex: true,
// }

mongoose.connection.on("error", (err) => {
  // logger.info("ERROR OCCURED WHILE CONNECTING TO DB");
  // logger.error(err);
  console.log("ERROR OCCURED WHILE CONNECTING TO DB");
  console.log(err);
});

mongoose.connection.once("open", () => {
  console.log("DB CONNECTION ESTABLISHED");
  app.listen(port, async () => {
    console.log(`APP STARTED AND LISTENING TO PORT NO : ${port}`);
  });
  // Initialize listener
});

module.exports = app;
