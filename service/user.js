const curd = require('../common/mysql.js')
const { redisSet, resisGet } = require('../common/redis.js')
const svgCaptcha = require('svg-captcha')
const crypto = require('lxj-crypto')
const Core = require('@alicloud/pop-core')
const SMSconfig = require('../config/index.js')
const randomCode = require('../common/randomCode.js')

let client = new Core({
  accessKeyId: SMSconfig.accessKeyId,
  accessKeySecret: SMSconfig.accessKeySecret,
  endpoint: 'https://dysmsapi.aliyuncs.com',
  apiVersion: '2017-05-25'
})

/**
 * 修改密码
 */
async function editPassword ({ username, password, oldpassword }, res) {
  if (oldpassword) {
    let sql1 =  `SELECT * FROM tb_user WHERE username = ? AND password = ?`
    const result1 = await curd(sql1, [username, oldpassword])
    if (!result1.length) {
      res.fail('旧密码错误')
      return
    }
  }
  let sql2 =  `UPDATE tb_user SET password = ? WHERE username = ?`
  const result2 = await curd(sql2, [password, username])
  return result2
}

/**
 * 通过用户名获取phone
 */
async function findPhone ({ username }, res) {
  let sql =  `SELECT u.phone FROM tb_user u WHERE username = ?`
  const result = await curd(sql, [username])
  // console.log(result)
  if (result && result.length) {
    res.success(result[0].phone)
  } else {
    res.fail('该用户不存在')
  }
}

/**
 * 获取手机短信验证码
 */
function sms ({ phone }, res) {
  let params = {
    "PhoneNumbers": phone,
    "SignName": SMSconfig.SignName,
    "TemplateCode": SMSconfig.TemplateCode,
    "TemplateParam": JSON.stringify({ "code": randomCode() })
  }
  let requestOption = {
    method: 'POST'
  }
  console.log(params)
  client.request('SendSms', params, requestOption).then((result) => {
    let smsCode = JSON.parse(params.TemplateParam).code
    console.log(smsCode)
    redisSet(phone, smsCode, 1000*60, function (err, data) {
      console.log('redisSet' + err)
      if (err) {
        return
      }
      res.success('短信发送成功')
    })
  }, (ex) => {
    console.log(ex)
  })
}

/**
 * 验证手机短信验证码
 */
function checkSms ({ phone, sms }, res) {
  console.log(phone, sms)
  resisGet(phone, function (err, data) {
    console.log(data)
    if (err) {
      res.fail('验证码错误')
      return
    }
    if (data === null) {
      res.fail('验证码过期')
      return
    }
    if (data !== sms) {
      res.fail('验证码不一致')
      return
    }
    res.success('验证码一致')
  })
}

/**
 * 用户注册
 */
async function addUser ({ phone, username, password, sex }) {
  console.log(sex === 1)
  let sql = `INSERT INTO tb_user (username, password, phone, sex, role) VALUES (?, ?, ?, ?, ?)`
  const result = await curd(sql, [username, password, phone, sex, 0])
  return result
}

/**
 * 用户登录
 * 两个系统共用 通过role区分 0/user 1/admin
 * req.session.captcha 从session中拿到验证码
 */
async function login (req, res) {
  if (!req.session.captcha) {
    res.send({
      code: 500,
      msg: '验证码不正确'
    })
    return
  }
  if (req.session.captcha.toLowerCase() !== req.body.captcha.toLowerCase()) {
    // res.fail('验证码不正确')
    // throw Error('验证码不正确')
    res.send({
      code: 500,
      msg: '验证码不正确'
    })
    return
  }
  console.log(req.body.username, req.body.role)
  let sql =  `SELECT *  FROM tb_user WHERE username = ? AND role = ?`
  const data = await curd(sql, [req.body.username, req.body.role])
  console.log(data)
  if (data.length > 0) {
    const { password, id, username, role, phone } = data[0]
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
        info: { id, username, phone }
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

/**
 * 获取所有用户
 */
async function getAllUsers ({ pageNum, pageSize }) {
  pageNum = parseInt(pageNum)
  pageSize = parseInt(pageSize)
  let sql = `SELECT * FROM tb_user WHERE role = 0 LIMIT ?, ?`
  let sql2 = `SELECT COUNT(*) as total FROM tb_user WHERE role = 0`
  const result = await curd(sql, [(pageNum - 1) * pageSize, pageSize])
  const result2 = await curd(sql2)
  console.log(result, result2)
  return { records: result, total: result2[0].total }
}

module.exports = { findPhone, editPassword, checkSms, sms, addUser, login, createCaptcha, getAllUsers }
