const express = require('express')
const router = express.Router()
const CategoryService = require('../service/category.js')

// 新增\更新品类
router.post('/', async (req, res, next) => {
  await CategoryService.addCategory(req.body)
  res.success()
})
// 删除品类
router.post('/delete', async (req, res, next) => {
  await CategoryService.delCategory(req.body)
  res.success()
})
// 分页查询品类
router.get('/list', async (req, res, next) => {
  let result = await CategoryService.getCategoryByPage(req.query)
  res.success(result)
})

module.exports = router
