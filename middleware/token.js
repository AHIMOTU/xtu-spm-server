const { resisGet } = require('../common/redis.js')
const crypto = require('lxj-crypto')

/* 通过url判断接口是否需要token */
function isCheck (req) {
  console.log(req.url)
  let urls = [
    /.*\/users\/login/,
    /.*\/users\/captcha/,
    /.*favicon\.ico/
  ]
  let result = true
  urls.forEach(item => {
    if (item.test(req.url)) {
      result = false
    }
  })
  return result
}

module.exports = function (req, res, next) {
  if (isCheck(req)) {
    const token = req.get('token')
    console.log(token)
    if (!token) {
      res.send({
        code: 401,
        msg: 'token不存在'
      })
      return
    }
    let tokenData = null
    try {
      tokenData = JSON.parse(crypto.aesDecrypt(token, 'token'))
      // console.log(tokenData)
    } catch {
      res.send({
        code: 401,
        msg: 'token不合法'
      })
      return
    }
    resisGet(`spm-${tokenData.role}-token-${tokenData.userId}`, function (err, result) {
      if (err) {
        console.log(err)
        return
      }
      // console.log(result)
      if (res === null) {
        res.send({
          code: 401,
          msg: 'token过期'
        })
        return
      }
      console.log(result === token)
      if (result !== token) {
        res.send({
          code: 401,
          msg: 'token错误'
        })
        return
      }
    })
  }
  next()
}