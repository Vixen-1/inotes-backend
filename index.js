const express = require('express');


const connectToMongo = require('./db');

connectToMongo();

const app = express();
const port = 5000;

//this is a middleware which is used if we want use req.body so that we can send data in json 
app.use(express.json())

//available routes
app.get('/', (req, res)=> {
  res.send("Hello World! This is my first API")
})
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})