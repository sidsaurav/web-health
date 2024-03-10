const axios = require('axios')

const getStatusOfPage = async (req, res) => {
  try {
    const start = Date.now()
    const resData = await axios.head(req.body.url)
    const end = Date.now()
    console.log(resData)
    return res.json({
      status: resData.status,
      statusText: resData.statusText,
      responseTime: end - start,
    })
  } catch (err) {
    return res.json({
      status: 'error',
      message: err.message,
    })
  }
}

module.exports = { getStatusOfPage }
