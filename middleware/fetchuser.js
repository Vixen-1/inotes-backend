var jwt = require("jsonwebtoken");
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET_KEY

const fetchuser = (req, res, next) => {
    //get the user from the jwt token and add id to req.
    // const token = req.header('auth-token');
    // if(!token){
    //     res.status(401).send({error: "Please authenticate using valid token "})
    // }
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send({ error: "Please authenticate using a valid token" });
    }

    const token = authHeader.split(" ")[1];
    try{
        const data = jwt.verify(token, JWT_SECRET)
        req.user = data.user;
        next()
    }catch(error){
        res.status(401).send({error: "Please authenticate using valid token "})
    }
}
module.exports = fetchuser