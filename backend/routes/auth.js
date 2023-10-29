const express = require('express');
const User = require('../models/User')
const router = express.Router();

//create a user using: POST "api/auth/". Does'nt require Auth
router.post('/',(req, res)=>{
    console.log(req.body);
    const user = User(req.body);
    user.save();
    res.send('heyyyyy duffer')
})

module.exports = router;