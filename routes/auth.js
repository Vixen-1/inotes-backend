const express = require("express");
const User = require("../models/User");
require('dotenv').config();
//to create routes on the link we use router 
const router = express.Router();
const passport = require('passport');
//we use express validation so that we can ensure if email is correct as per our criteria
const { body, validationResult } = require("express-validator");

//we use bcrypt so that we can generate hash codes for password which can get saved in database.
const bcrypt = require("bcryptjs");

//user id password create karne ke baad we will give a token to the user so that he can login successfully. using jsonwebtoken i.e. jwt.io
// jwt client and server ke bichme secure communication ensure krega.
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET_KEY //AYUISAGOODG@IRL

//to add a middleware in case we want to add new functionalities in future.
// here in this case jab jab mujhe login required hogaa means to see if user is allowed to login and use my functionalities then i will call fetchser middleware.
const fetchuser = require('../middleware/fetchuser')

//Route 1: create a user using: POST "api/auth/createuser". 
//         Does'nt require authentication
router.post(
  "/createuser",
  [// validation is being passed as an array in api call
    body("name", "Name must have minimum 3 characters").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "password must contain minimum 5 characters").isLength({min: 5}),
  ],
  async (req, res) => {
    // if there are errors return bad request and the errors
    const errors = validationResult(req);

    //will check if error are not empty then we will display the errors array
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //check weather the user with this email already exists.
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "sorry a user with this email already exist." });
      }
      //create a new user
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });
      const data = {
        user:{
          id: user.id,
          name: user.name
        }
      }
// to provide authorization token
      const authToken = jwt.sign(data, JWT_SECRET);
      // console.log(jwtData);
      res.json({authToken});
    } 
    //catch errors
    catch (error) {
      console.error(error.message);
      res.status(500).send("some error occurred");
    }
  }
);

//Route 2: authenticate a user using: "api/auth/login". no login required
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "password cannot be blank").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {email, password} = req.body;
    try{
      //to see if the input email exist in our database
      let user = await User.findOne({email});
      //if it does'nt exist then this error will show
      if(!user){
        return res.status(400).json({error: "email not found"})
      }
      //compare the input password with the encrypted password. it takes password and hash string
      const passwordCompare = await bcrypt.compare(password, user.password);
      if(!passwordCompare){
        return res.status(400).json({error: "incorrect password"})
      }
      //payload is the data of user that we will send
      const data = {
        user:{
          id: user.id,
          name: user.name
        }
      }

      const authToken = jwt.sign(data, JWT_SECRET);
      res.json({authToken});
    }catch(error){
      console.error(error.message);
      res.status(500).send("internal server error occurred");
    }
  });

  router.post("/getuser", fetchuser, async (req, res) => {

      try{
        userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user)
      }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error")
      }
  });

  // google loginn

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET);
    res.redirect(`/dashboard?token=${token}`);
});


// facebook login  

router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback', passport.authenticate('facebook', { session: false }), (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET);
    res.redirect(`/dashboard?token=${token}`);
});


module.exports = router;
