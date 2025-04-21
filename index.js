const express = require('express');
const cors = require('cors');
const passport = require('./config/passport-config');
const connectToMongo = require('./db');

connectToMongo();

const app = express();
const port = process.env.PORT || 3000;

// Allow CORS for all origins
// app.use(cors());

// OR, specify allowed origins and methods for tighter security
app.use(
  cors({
    origin: `${process.env.CORS_ORIGIN}` || '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

//this is a middleware which is used if we want use req.body so that we can send data in json 
app.use(express.json())
app.use(passport.initialize());

//available routes
app.get('/', (req, res)=> {
  res.send("Hello World! This is my first API")
})
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})