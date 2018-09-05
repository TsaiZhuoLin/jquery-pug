const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const indexRouter = require("./routes/index");
const apiRouter = require("./routes/api");
const authRouter = require("./routes/auth");

const app = express();


// Database
const mysql = require("mysql");
const con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  port: 13306,
  password: "12345",
  database: "users"
});

con.connect(function (err) {
  if (err) {
    console.log("connecting error");
    return;
  }
  console.log("connecting success");
});

// view engine setup
app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "pug");

app.use(cors({
  origin: ['http://127.0.0.1:4000', 'http://localhost:3000'],
  credentials: true
}));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// express session
app.use(express.static(path.join(__dirname, "src")));

// Authentication and Authorization Middleware
var auth = function (req, res, next) {
  if (req.session && req.session.user === "amy" && req.session.admin)
    return next();
  else return res.sendStatus(401);
};

// db state
app.use(function (req, res, next) {
  req.con = con;
  next();
});

app.use("/api", apiRouter);
app.use("/auth", authRouter);
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// Node server
// Constants
const PORT = 4000;
const HOST = "127.0.0.1";
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

module.exports = app;
