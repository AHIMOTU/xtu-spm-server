const express = require('express')
const router = express.Router()
const Order = require('../service/order.js')

// 新增地址
router.post('/add', async (req, res, next) => {
  const data = await Order.addOrder(req.body)
  res.success(data)
})

// 根据订单id查询订单详情
router.get('/findByOrderId', async (req, res, next) => {
  const data = await Order.findOrder(req.query)
  res.success(data)
})

// 查询所有订单
router.get('/findAllOrder', async (req, res, next) => {
  const data = await Order.findAllOrder(req.query)
  res.success(data)
})

module.exports = router