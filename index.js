const express = require('express')
const main = require('./src/index.js')
const app = express()
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  const username = process.env.MAFIASCUM_USERNAME;
  res.send('Hello ' + username)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
  main();
})