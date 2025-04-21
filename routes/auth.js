const express = require("express");
const User = require("../models/User");
require("dotenv").config();
//to create routes on the link we use router
const router = express.Router();
const passport = require("passport");
//we use express validation so that we can ensure if email is correct as per our criteria
const { body, validationResult } = require("express-validator");

//we use bcrypt so that we can generate hash codes for password which can get saved in database.
const bcrypt = require("bcryptjs");

//user id password create karne ke baad we will give a token to the user so that he can login successfully. using jsonwebtoken i.e. jwt.io
// jwt client and server ke bichme secure communication ensure krega.
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET_KEY; //AYUISAGOODG@IRL

//to add a middleware in case we want to add new functionalities in future.
// here in this case jab jab mujhe login required hogaa means to see if user is allowed to login and use my functionalities then i will call fetchser middleware.
const fetchuser = require("../middleware/fetchuser");

// In-memory OTP store (use Redis or database in production)
const otpStore = new Map();

// Configure Nodemailer
const transporter = require('../config/nodemailerConfig');

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

//Route 1: create a user using: POST "api/auth/createuser".
//         Does'nt require authentication
router.post(
  "/createuser",
  [
    // validation is being passed as an array in api call
    body("name", "Name must have minimum 3 characters").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "password must contain minimum 5 characters").isLength({
      min: 5,
    }),
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
      // Generate and send OTP instead of creating user directly
      const otp = generateOTP();
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      otpStore.set(req.body.email, {
        otp,
        userData: {
          name: req.body.name,
          email: req.body.email,
          password: secPass,
        },
      });

      // Send OTP to user's email
      await transporter.sendMail({
        from: `"INotes - iWillNotify" <${process.env.EMAIL_USER}>`,
        to: req.body.email,
        subject: "Your OTP for INotes- iWillNotify Registration",
        text: `Your OTP is ${otp}. It is valid for 10 minutes. Please do not share this code.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Welcome to INotes - iWillNotify!</h2>
            <p>Thank you for registering. To complete your registration, please use the following One-Time Password (OTP):</p>
            <h3 style="background: #f0f0f0; padding: 10px; text-align: center;">${otp}</h3>
            <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Best regards,<br>The INotes Team</p>
          </div>
        `,
      });

      res.json({
        message:
          "OTP sent to your email. Please verify to complete registration.",
      });
    } catch (error) {
      //catch errors
      console.error(error.message);
      res.status(500).send("some error occurred");
    }
  }
);

// Route: Verify OTP for user creation
router.post(
  "/verify-otp-createuser",
  [
    body("email", "Enter a valid email").isEmail(),
    body("otp", "OTP must be 6 digits").isLength({ min: 6, max: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;
    try {
      const storedData = otpStore.get(email);
      if (!storedData || storedData.otp !== otp) {
        return res.status(400).json({ error: "Invalid OTP" });
      }

      // Create the user
      const { name, email: userEmail, password } = storedData.userData;
      const user = await User.create({
        name,
        email: userEmail,
        password,
      });

      // Generate JWT token
      const data = {
        user: {
          id: user.id,
          name: user.name,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);

      // Clear OTP from store
      otpStore.delete(email);

      res.json({ authToken });
    } catch (error) {
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
    body("password", "password cannot be blank").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      //to see if the input email exist in our database
      let user = await User.findOne({ email });
      //if it does'nt exist then this error will show
      if (!user) {
        return res.status(400).json({ error: "email not found" });
      }
      //compare the input password with the encrypted password. it takes password and hash string
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({ error: "incorrect password" });
      }
      // Generate JWT token
      const data = {
        user: {
          id: user.id,
          name: user.name,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);

      res.json({ authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("internal server error occurred");
    }
  }
);

router.post("/getuser", fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// google login
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { user: { id: req.user._id, name: req.user.name } },
      process.env.JWT_SECRET
    );
    res.redirect(`/dashboard?token=${token}`);
  }
);

// github login
router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);
router.get(
  "/auth/github/callback",
  passport.authenticate("github", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { user: { id: req.user._id, name: req.user.name } },
      process.env.JWT_SECRET
    );
    res.redirect(`/dashboard?token=${token}`);
  }
);

module.exports = router;
