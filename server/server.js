const express = require('express')
const router = require('./routers/router')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(
  cors({
    origin: 'http://localhost:5173',
  })
)

app.listen(8000, () => {
  console.log('Server listening on PORT 8000')
})

app.use('/api/v1/', router)
