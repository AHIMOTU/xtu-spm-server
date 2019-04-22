const curd = require('../common/mysql.js')

/**
 * 新增地址
 */
async function addAddress ({ address, consignee, phone, user_id }) {
  let sql =  `INSERT INTO tb_address (address, consignee, phone, is_default, user_id) VALUES (?, ?, ?, ?, ?)`
  const res = await curd(sql, [address, consignee, phone, 0, user_id])
  console.log(res)
}

/**
 * 查询地址
 */
async function findAddress ({ user_id }) {
  let sql = `SELECT * FROM tb_address WHERE user_id = ?`
  const res = await curd(sql, [user_id])
  if (!res) {
    throw new Error('查询失败')
  }
  return res
}

module.exports = { addAddress, findAddress }