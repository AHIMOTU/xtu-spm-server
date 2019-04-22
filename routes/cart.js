const express = require('express')
const router = express.Router()
const Cart = require('../service/cart.js')

// 加入购物车 赋值
router.post('/add', async (req, res, next) => {
  await Cart.addCart(req.body)
  res.success()
})

// 加入购物车 累加
router.post('/directAdd', async (req, res, next) => {
  console.log(req.body)
  await Cart.directAddCart(req.body)
  res.success()
})

// 删除购物车
router.post('/delete', async (req, res, next) => {
  await Cart.deleteCart(req.body)
  res.success()
})

// 查询购物车
router.get('/find', async (req, res, next) => {
  const data = await Cart.findCart(req.query)
  res.success(data)
})

// 改变购物车内 单个 商品选中状态
router.post('/selected', async (req, res, next) => {
  await Cart.changeSelected(req.body)
  res.success()
})

// 改变购物车内 全部 商品选中状态
router.post('/selectedAll', async (req, res, next) => {
  await Cart.changeAllSelected(req.body)
  res.success()
})

module.exports = router