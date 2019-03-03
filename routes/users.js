const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { check, validationResult } = require('express-validator/check');
const passport = require("passport");


// Bring in User Model
let Users = require("../models/user");

//Register Form
router.get("/register", function(req, res) {
  res.render("register");
});

router.post("/register",[
    check('name').isLength({min:1}).trim().withMessage('name required'),
    check('email').isLength({min:1}).trim().withMessage('email required'),
    check('email').isEmail().withMessage('Email Invalid value'),
    check('username').isLength({min:1}).trim().withMessage('username required'),
    check('password').isLength({min:1}).trim().withMessage('password required'),
    check('password2').isLength({min:1}).trim().withMessage('Confirm password required'),
    check('password2').custom((value,{req, loc, path}) => {
      if (req.body.password !== req.body.password2) {
          // trow error if passwords do not match
          throw new Error("Passwords don't match");
      } else {
          return value; // value = password2
      }
    })
], function(req, res,next) {

  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

 

/*
  req.checkBody("name", "name is required").notEmpty();
  req.checkBody("email", "email is required").notEmpty();
  req.checkBody("email", "email is not valid").notEmpty();
  req.checkBody("username", "username is required").notEmpty();
  req.checkBody("password", "password is required").notEmpty();
  req
    .checkBody("password2", "password2 do not match")
    .equals(req.body.password);
    */

  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.render("register", {
      errors: errors.mapped()
    });
  } else {
    let newUser = new Users({
      name: name,
      email: email,
      username: username,
      password: password
    });

    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(newUser.password, salt, function(err, hash) {
        if (err) {
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err) {
          if (err) {
            console.log(err);
            return;
          } else {
            req.flash("Succes", "You are now registered and can log in");
            res.redirect("/users/login");
          }
        });
      });
    });
  }
});


// Login Form
router.get("/login", function(req, res) {
  res.render("login");
});

// Login Process
router.post('/login',function(req,res,next){
passport.authenticate('local',{
  successRedirect:'/',
  failureRedirect:'/users/login',
  failureFlash:true
})(req,res,next);
});


router.get('/logout',function(req,res){
req.logout();
req.flash('success','You are logged out');
res.redirect('/users/login');
});

module.exports = router;
