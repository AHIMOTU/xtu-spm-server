/**
 * 中间件
 * 给每个res对象安装两个方法
 */
module.exports = (req, res, next) => {
  res.success = (data) => {
    res.send({
      code: 200,
      msg: 'success',
      data
    })
  }
  res.fail = (msg, code = 500) => {
    res.send({
      code,
      msg
    })
  }
  next()
}
