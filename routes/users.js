const express = require('express')
const router = express.Router()
const userService = require('../service/user.js')

/* 新增用户 */
router.post('/regist', async (req, res, next) => {
  await userService.addUser(req.body)
  res.success()
})

/* 查询phone */
router.get('/phone', async (req, res, next) => {
  await userService.findPhone(req.query, res)
})

/* 修改密码 */
router.post('/editPassword', async (req, res, next) => {
  const data = await userService.editPassword(req.body, res)
  // console.log(data)
  if (data) res.success('重置密码成功')
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

/* 获取短信验证码 */
router.get('/sms', (req, res, next) => {
  let data = userService.sms(req.query, res)
  console.log(data)
  // if (data) res.send(data)
})

/* 验证短信验证码 */
router.post('/checkSms', (req, res, next) => {
  userService.checkSms(req.body, res)
})

/* 获取所有用户 */
router.get('/allUsers', async (req, res, next) => {
  const data = await userService.getAllUsers(req.query)
  res.success(data)
})

module.exports = router
