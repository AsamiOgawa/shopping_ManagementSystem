const express = require('express')
const compression = require('compression')

let app = express()

app.use(compression())
app.use(express.static('dist'))

app.listen(80, () => {
  console.log('Web server is running: http://127.0.0.1')
})
