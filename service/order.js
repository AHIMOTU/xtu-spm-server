const curd = require('../common/mysql.js')

/**
 * 新增订单
 */
async function addOrder ({ address_id, user_id, products }) {
  let sql1 = `INSERT INTO tb_order (create_time, address_id, user_id) VALUES (?, ?, ?)`
  let create_time = getTime()
  const res1 = await curd(sql1, [create_time, address_id, user_id])
  // console.log(res1)
  if (res1) {
    let sql2 = `INSERT INTO tb_order_product (order_id, product_id, number) VALUES (?, ?, ?)`
    for (let product of products) {
      let res2 = await curd(sql2, [res1.insertId, product.id, product.count])
      // console.log(res2)
      if (!res2) {
        throw new Error('新增订单失败')
      }
    }
    /* 新增订单成功后逻辑删除购物车内的相关商品 */
    let sql3 = `SELECT * FROM tb_cart WHERE user_id = ?`
    const res3 = await curd(sql3, [user_id])
    console.log(res3)
    if (res3) {
      let sql4 = `UPDATE tb_cart_product SET ordered = ? WHERE cart_id = ? AND product_id = ?`
      for (let product of products) {
        console.log(product.id)
        const res4 = await curd(sql4, [1, res3[0].id, product.id])
        if (!res4) {
          throw new Error('更新购物车失败')
        }
      }
    }
    return { orderId: res1.insertId }
  }
}

/**
 * 根据订单id查询订单详情
 */
async function findOrder ({ id }) {
  let sql = `SELECT p.*, op.number FROM tb_order o
            LEFT JOIN tb_order_product op ON o.id = op.order_id
            LEFT JOIN tb_product p ON op.product_id = p.id
            WHERE o.id = ?`
  const res = await curd(sql, [id])
  return res
}

/**
 * 查询所有订单
 */
async function findAllOrder ({ userId }) {
  let sql = `SELECT o.create_time, o.total_price, op.order_id, op.number, p.*, a.address, a.consignee, a.phone FROM tb_order o
            LEFT JOIN tb_order_product op ON o.id = op.order_id
            LEFT JOIN tb_product p ON op.product_id = p.id
            LEFT JOIN tb_address a ON o.user_id = a.user_id
            WHERE o.user_id = ?`
  const res = await curd(sql, [userId])
  // console.log(res)
  let obj = {}
  let orders = []
  res.forEach(r => {
    if (!obj[r.order_id]) {
      obj[r.order_id] = [r]
    } else {
      obj[r.order_id].push(r)
    }
  })
  for (let key in obj) {
    orders.push(obj[key])
  }
  return orders
}

// 生成日期
function getTime() {
  let date = new Date()
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  let hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
  let minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  let second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
  let create_time = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
  return create_time
}

module.exports = { addOrder, findOrder, findAllOrder }