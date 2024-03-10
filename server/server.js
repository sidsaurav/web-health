const express = require('express')
const router = require('./routers/router')
const app = express()
app.use(express.json())

app.listen(8000, () => {
  console.log('Server listening on PORT 8000')
})

app.use('/api/v1/', router)
