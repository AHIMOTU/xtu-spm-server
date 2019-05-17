const { resisGet } = require('../common/redis.js')
const crypto = require('lxj-crypto')

/* 通过url判断接口是否需要token */
function isCheck (req) {
  console.log(req.url)
  /* 不需要token的接口路由 */
  let urls = [
    /.*\/users/,
    /.*\/product/,
    /.*\/category/,
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
  // console.log('111')
  if (isCheck(req)) {
    const token = req.get('token')
    // console.log(token)
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
    // console.log('222')
    resisGet(`spm-${tokenData.role}-token-${tokenData.userId}`, function (err, result) {
      console.log('333')
      if (err) {
        console.log(err)
        return
      }
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
      // 说明username合法，将user信息赋予req上下文对象，这样后续的每个中间件和处理函数都能直接从req中取出user使用
      // console.log(req.body)
      req.userId = tokenData.userId
      // console.log(req.userId)
      next()
    })
  } else {
    next()
  }
}
