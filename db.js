const mongoose = require('mongoose');
require('dotenv').config();
const mongoURI  = process.env.MONGO_URI;

const connectToMongo = () => {
   mongoose.connect(mongoURI,{
      dbName: 'inotes'
   })
.then(()=> console.log("database connected"))
.catch((e)=> console.log(e));
}

module.exports = connectToMongo;