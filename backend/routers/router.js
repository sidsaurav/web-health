const express = require('express')
const { getStatusOfPage } = require('../controllers/controller')
const router = express.Router()

router.route('/getstatus').post(getStatusOfPage)

module.exports = router
