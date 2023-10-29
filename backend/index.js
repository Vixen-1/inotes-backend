const express = require('express');

const connectToMongo = require('./db');

connectToMongo();

const app = express();
const port = 3000;

app.use(express.json())

// app.get('/', (req, res) => {
//   res.send('Hello Ayushi!!!')
// })

//available routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})