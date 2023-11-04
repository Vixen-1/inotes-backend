const express = require("express");
const User = require("../models/User");

//to create routes on the link we use router 
const router = express.Router();

//we use express validation so that we can ensure if email is correct as per our criteria
const { body, validationResult } = require("express-validator");

//we use bcrypt so that we can generate hashcodes for password which can get saved in database.
const bcrypt = require("bcryptjs");

//userid password create krne ke baad we will give a token to the user so that he can login successfully. using jsonwebtoken i.e. jwt.io
// jwt client and server ke bichme secure communication ensure krega.
const jwt = require('jsonwebtoken')
const JWT_SECRET = "Ayuisagoodg$irl"

//create a user using: POST "api/auth/createuser". Does'nt require login
router.post(
  "/createuser",
  [
    body("name", "Name must have minimum 3 characters").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "password must contain minimum 5 characters").isLength({min: 5}),
  ],
  async (req, res) => {
    // if there are errors return bad request and the errors
    const errors = validationResult(req);
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
          id: user.id
        }
      }

      const authToken = jwt.sign(data, JWT_SECRET);
      // console.log(jwtData);
      res.json({authToken});
    } 
    //catch errors
    catch (error) {
      console.error(error.message);
      res.status(500).send("some error occured");
    }
  }
);

module.exports = router;
