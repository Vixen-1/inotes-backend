const mongoose = require('mongoose');

const mongoURI  = 'mongodb+srv://ayushisaxena:2800@cluster0.m3klwu0.mongodb.net/';

const connectToMongo = () => {
   mongoose.connect(mongoURI,{
      dbName: 'inotes'
   })
.then(()=> console.log("database connected"))
.catch((e)=> console.log(e));
}

module.exports = connectToMongo;