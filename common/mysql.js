/**
 * 将数据库连接封装，然后在service调用
 */
const mysql = require('mysql')

const curd = (sql, val) => {
  const connection = mysql.createConnection({
    host: '39.108.6.26',
    user: 'root',
    password: 'bjl123456',
    database: 'bishe'
  })
  // 开始连接
  connection.connect()
  /**
   * 数据库操作
   */
  return new Promise((resolve, reject) => {
    connection.query(sql, val, (err, data) => {
      if (err) {
        reject(err)
        return
      } else {
        resolve(data)
      }
    })
    // 断开连接
    connection.end()
  })
}

module.exports = curd
