const mongoose = require('mongoose');
require('dotenv').config();
const mongoURI  = process.env.MONGO_URI;
// const mongoURI  = 'mongodb+srv://vixen:2800@cluster0.m3klwu0.mongodb.net/inotes';

const connectToMongo = () => {
   mongoose.connect(mongoURI,{
      dbName: 'inotes'
   })
.then(()=> console.log("database connected"))
.catch((e)=> console.log(e));
}

module.exports = connectToMongo;