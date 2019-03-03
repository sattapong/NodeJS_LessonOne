const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");
const config = require('./config/database');
const passport = require('passport');

mongoose.connect(config.database);
let db = mongoose.connection;

//Bring in Models
let ModelArticle = require("./models/article");

//Check Connection
db.once("open", function() {
  console.log("Connected to MongoDB");
});

db.on("error", function(err) {
  console.log(err);
});

const app = express();

// Load View Engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, "public")));

//Express Session Middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
  })
);

//Express Messages Middleware
app.use(require("connect-flash")());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Begin Express Validator Middleware
app.use(
  expressValidator({
    errorFormatter: function(params, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);

// End Express Validator Middleware


// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());


app.get('*',function(req,res,next){
res.locals.user = req.user || null;
next();
});

 

// Begin Home Route **************************************************************************************

app.get("/", function(req, res) {
  ModelArticle.find({}, function(err, articles) {
    if (err) {
      console.log(err);
    } else {
      res.render("index", {
        title: "Article",
        articles: articles
      });
    }
  });
});

// Begin Test **************************************************************************************

app.get("/test_if_else", function(req, res) {
res.render("test_if_else",{
 
});
});


let articles = require('./routes/articles');
app.use('/articles',articles);

let users = require('./routes/users');
app.use('/users',users);


// start server
app.listen(3000, function() {
  console.log("Server started on port 3000..");
});
