const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

mongoose.connect("mongodb://localhost/lessonone");
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

// Begin Home Route **************************************************************************************

app.get("/", function(req, res) {
  ModelArticle.find({}, function(err, articles) {
    if (err) {
      console.log(err);
    } else {
      res.render("index", {
        title: "Hello",
        articles: articles
      });
    }
  });
});
 
// Begin Single Article **************************************************************************************

app.get("/article/:idx/", function(req, res) {
  ModelArticle.findById(req.params.idx, function(err, articlex) {
    res.render("article", {
      article: articlex
    });
  });
});

// Begin Edit Single Article **************************************************************************************

app.get("/article/edit/:idx", function(req, res) {
  ModelArticle.findById(req.params.idx, function(err, articlex) {
    res.render("edit_article", {
      title:"Edit "+articlex.title,
      article:articlex
    });
  });
});

// Begin Add Route **************************************************************************************
app.get("/articles/add", function(req, res) {
  res.render("add_article", {
    title: "Add Article"
  });
});

// Begin Add Submit POST Route **************************************************************************************

app.post("/articles/add", function(req, res) {
  let article = new ModelArticle();
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  article.save(function(err) {
    if (err) {
      console.log(err);
      return;
    } else {
      res.redirect("/");
    }
  });
});

// Begin Update Submit POST Route **************************************************************************************

app.post("/articles/edit/:id", function(req, res) {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;
  
let query = {_id:req.params.id}

ModelArticle.update(query,article,function(err) {
      if (err) {
        console.log(err);
        return;
      } else {
        res.redirect("/");
      }
    });
  });
 

// Begin Delete Submit POST Route **************************************************************************************

app.delete('/article/:id',function(req,res){

let query = {_id:req.params.id}

ModelArticle.remove(query,function(err){
if(err){
console.log(err);
}else{
res.send("Success");
}
});

});

// start server
app.listen(3000, function() {
  console.log("Server started on port 3000..");
});
