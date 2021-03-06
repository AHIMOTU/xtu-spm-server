const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const ProductService = require('../service/product.js')

// 新增商品
router.post('/', async (req, res, next) => {
  await ProductService.addProduct(req.body)
  res.success()
})

// 按销量查询
router.get('/listBySales', async (req, res, next) => {
  const data = await ProductService.getSalesProduct(req.query)
  res.success(data)
})

// id查询商品
router.get('/detail', async (req, res, next) => {
  const result = await ProductService.getProductById(req.query)
  res.success(result)
})

// 分页查询商品
router.get('/list', async (req, res, next) => {
  let result = await ProductService.getProductByPage(req.query)
  res.success(result)
})

// 按品类id查询商品
router.get('/listByCateId', async (req, res, next) => {
  let data = await ProductService.getProductByCateId(req.query)
  res.success(data)
})

// 删除商品
router.post('/delete', async (req, res, next) => {
  await ProductService.delProduct(req.body)
  res.success()
})

// 新增评论
router.post('/addComment', async (req, res, next) => {
  await ProductService.addComment(req.body, req.userId)
  res.success()
})

// 获取评论
router.get('/getComment', async (req, res, next) => {

})

// 上传图片
router.post('/picture', upload.single('file'), async (req, res, next) => {
  console.log(req.file)
  const result = await ProductService.uploadImg(req.file)
  console.log(result)
  res.success(result)
})

module.exports = router
