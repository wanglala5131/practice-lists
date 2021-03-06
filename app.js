const express = require('express')
const db = require('./models')
const app = express()
const port = process.env.PORT || 3000
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const cors = require('cors')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const passport = require('./config/passport.js')

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(methodOverride('_method'))

require('./routes/index.js')(app)

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})
