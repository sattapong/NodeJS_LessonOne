const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');       //you don't need this in this example

//Article  Models
let ModelArticle = require("../models/article");

//User Models
let ModelUser = require("../models/user");

  
  // Begin Edit Single Article **************************************************************************************
  
  router.get("/edit/:idx" ,ensureAuthenticated,function(req, res) {
    ModelArticle.findById(req.params.idx, function(err, articlex) {

 
 if(articlex.author != req.user._id) {
            req.flash('danger', 'Not Authorized');
           return res.redirect('/');
        }
      

      res.render("edit_article", {
        title: "Edit " + articlex.title,
        article: articlex
      });
    });
  });



  
  // Begin Add Route **************************************************************************************
  router.get("/add",ensureAuthenticated, function(req, res) {
    res.render("add_article", {
      title: "Add Article"
    });
  });
  
  // Begin Add Submit POST Route **************************************************************************************
  
  router.post('/add',
   [
    check('title').isLength({min:1}).trim().withMessage('Title required'),
    //check('author').isLength({min:1}).trim().withMessage('Author required'),
    check('body').isLength({min:1}).trim().withMessage('Body required')
   ],
    (req,res,next)=>{
  
    let article = new ModelArticle({
    title:req.body.title,
    author:req.body.author,
    body:req.body.body
   });
  
   const errors = validationResult(req);
  
   if (!errors.isEmpty()) { // if error
    console.log(errors);
       res.render('add_article',
        { 
          title:"Add Article",
         article:article,
         errors: errors.mapped() //
        });
     }
     else{
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;
  
    article.save(err=>{
     if(err)throw err;
     req.flash('success','Article Added');
     res.redirect('/');
    });
   }
  }
  );
  
  // Begin Update Submit POST Route **************************************************************************************
  
  router.post("/edit/:id", function(req, res) {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;
  
    let query = { _id: req.params.id };
  
    ModelArticle.update(query, article, function(err) {
      if (err) {
        console.log(err);
        return;
      } else {
        req.flash("success", "Article Updated");
        res.redirect("/");
      }
    });
  });


 

// Begin Access Control **************************************************************************************

function ensureAuthenticated(req,res,next)
{

  if(req.isAuthenticated())
  {
    return next();
  } else {
 
    req.flash('danger','Please Login');
    res.redirect('/users/login');
  }
 
}

// End Access Control **************************************************************************************

  


// Begin Single Article **************************************************************************************

router.get("/:idx", function(req, res) {
    ModelArticle.findById(req.params.idx, function(err, articlex) {
      ModelUser.findById(articlex.author,function(err,userx){
        res.render("article", {
          article: articlex,
          author:userx.name
        });
      });
    
    });
  });
  




  
  // Begin Delete Submit POST Route **************************************************************************************
  
  router.delete("/:id", function(req, res) {
if(!req.user._id)
{
  res.status(500).send();
}

    let query = { _id: req.params.id };

    ModelArticle.findById(req.params.id,function(err,article){

if(article.author != req.user._id)
{
res.status(500).send();
}else{
  ModelArticle.remove(query, function(err) {
    if (err) {
      console.log(err);
    } else {
      res.send("Success");
    }
  });
}

    });
  

  });
  
  module.exports = router;