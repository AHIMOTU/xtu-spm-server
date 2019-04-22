const express = require('express')
const router = express.Router()
const Address = require('../service/address.js')

// 新增地址
router.post('/add', async (req, res, next) => {
  await Address.addAddress(req.body)
  res.success()
})

// 查询地址
router.get('/find', async (req, res, next) => {
  const data = await Address.findAddress(req.query)
  res.success(data)
})

module.exports = router