const userModel = require('../models/user.js')
const curd = require('../common/mysql.js')
const { redisSet } = require('../common/redis.js')
const svgCaptcha = require('svg-captcha')
const crypto = require('lxj-crypto')

/**
 * 用户注册
 */
async function addUser (user) {
  user.role = 0
  user.createTime = Date.now()
  await userModel.create(user)
}

/**
 * 用户登录
 * 两个系统共用 通过role区分 0/user 1/admin
 * req.session.captcha 从session中拿到验证码
 */
async function login (req, res) {
  if (req.session.captcha.toLowerCase() !== req.body.captcha.toLowerCase()) {
    // res.fail('验证码不正确')
    // throw Error('验证码不正确')
    res.send({
      code: 500,
      msg: '验证码不正确'
    })
    return
  }
  let sql =  `SELECT *  FROM tb_user WHERE username = ? AND role = ?`
  const data = await curd(sql, [req.body.username, req.body.role])
  console.log(data)
  if (data.length > 0) {
    const { password, id, username, role } = data[0]
    if (password === req.body.password) {
      // 登陆成功 生成token并返回
      let tokenData = {
        username: req.body.username,
        userId: data[0].id,
        role: req.body.role,
        expire: Date.now() + 1000 * 3600
      }
      let token = crypto.aesEncrypt(JSON.stringify(tokenData), 'token')
      redisSet(`spm-${role}-token-${id}`, token, 1000*3600, function (err, res) {
        if (err) {
          console.log(err)
          return
        }
        console.log(res)
      })
      return {
        token,
        info: { id, username }
      }
    } else {
      // res.fail('账号密码不一致')
      // throw Error('账号密码不一致')
      res.send({
        code: 500,
        msg: '账号密码不一致'
      })
      return
    }
  } else {
    // throw Error('账号密码不一致')
    res.send({
      code: 500,
      msg: '账号密码不一致'
    })
    return
  }
}

/**
 * 生成验证码 svg-captcha
 * create()函数返回的对象有两个属性 data: string // svg路径; text: string // 验证码文字
 * @params ignoreChars: '0o1i' // 验证码字符中排除 0o1i
 * @params color: true // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
 */
async function createCaptcha (req, res) {
  const captcha = await svgCaptcha.create({
    ignoreChars: '0o1i',
    color: true
  })
  req.session.captcha = captcha.text // 将验证码存在session中
  res.type('svg')
  // res.send(captcha.data)
  return captcha.data
}

module.exports = { addUser, login, createCaptcha }
