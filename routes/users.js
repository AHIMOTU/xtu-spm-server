const express = require('express')
const router = express.Router()
const userService = require('../service/user.js')

/* 新增用户 */
router.post('/regist', async (req, res, next) => {
  await userService.addUser(req.body)
  res.success()
})

/* 用户登录 */
router.post('/login', async (req, res, next) => {
  let result = await userService.login(req, res, next)
  console.log(result)
  if (result) {
    res.success(result)
  }
})

/* 验证码 */
router.get('/captcha', async (req, res, next) => {
  let result = await userService.createCaptcha(req, res)
  res.send(result) // 此处直接将图片返回给前端，不要封装
})

module.exports = router
