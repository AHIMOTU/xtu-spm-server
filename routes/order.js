const express = require('express')
const router = express.Router()
const Order = require('../service/order.js')

// 新增订单
router.post('/add', async (req, res, next) => {
  const data = await Order.addOrder(req.body, req.userId)
  res.success(data)
})

// 根据订单id查询订单详情
router.get('/findByOrderId', async (req, res, next) => {
  const data = await Order.findOrder(req.query, req.userId)
  res.success(data)
})

// 更改订单状态
router.post('/changeStatus', async (req, res, next) => {
  await Order.changeOrderStatus(req.body)
  res.success()
})

// 查询用户所有订单
router.get('/findAllOrder', async (req, res, next) => {
  const data = await Order.findAllOrder(req.query)
  res.success(data)
})

// 查询系统所有订单
router.get('/list', async (req, res, next) => {
  const data = await Order.findAll(req.query)
  res.success(data)
})

module.exports = router
