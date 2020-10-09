const express = require('express')
const db = require('./models')
const app = express()
const port = 3000
const bodyParser = require('body-parser')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const passport = require('./config/passport.js')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


require('./routes/index.js')(app)


app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})
