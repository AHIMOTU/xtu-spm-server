const curd = require('../common/mysql.js')

/**
 * 新增订单
 */
async function addOrder ({ address_id, products, total_price }, user_id) {
  console.log(user_id)
  let sql1 = `INSERT INTO tb_order (create_time, address_id, user_id, total_price, order_num) VALUES (?, ?, ?, ?, ?)`
  let create_time = getTime()
  let order_num = getOrderNum(products.length)
  const res1 = await curd(sql1, [create_time, address_id, user_id, total_price, order_num])
  // console.log(res1)
  if (res1) {
    let sql2 = `INSERT INTO tb_order_product (order_id, product_id, number) VALUES (?, ?, ?)`
    for (let product of products) {
      let res2 = await curd(sql2, [res1.insertId, product.id, product.count])
      // console.log(res2)
    }
    /* 新增订单成功后 逻辑删除购物车内的相关商品 修改商品库存和销量 */
    let sql3 = `SELECT * FROM tb_cart WHERE user_id = ?`
    const res3 = await curd(sql3, [user_id])
    console.log(res3)
    if (res3) {
      let sql4 = `UPDATE tb_cart_product SET ordered = ? WHERE cart_id = ? AND product_id = ?`
      let sql5 = `UPDATE tb_product SET stock = ?, sales_count = ? WHERE id = ?`
      for (let product of products) {
        console.log(product.id)
        await curd(sql4, [1, res3[0].id, product.id])
        await curd(sql5, [product.stock - product.count, product.sales_count + product.count, product.id])
      }
    }
    return { orderId: res1.insertId }
  }
}

/**
 * 修改订单状态
 */
async function changeOrderStatus ({ status, orderId }) {
  let sql = `UPDATE tb_order SET status = ? WHERE id = ?`
  await curd(sql, [status, orderId])
}

/**
 * 根据订单id查询订单详情
 */
async function findOrder ({ id }, userId) {
  let sql = `SELECT o.create_time, o.total_price, o.status, o.order_num, op.order_id, op.number, p.*, a.address, a.consignee, a.phone FROM tb_order o
            LEFT JOIN tb_order_product op ON o.id = op.order_id
            LEFT JOIN tb_product p ON op.product_id = p.id
            LEFT JOIN tb_address a ON o.user_id = a.user_id
            WHERE o.user_id = ? AND o.id = ?`
  const res = await curd(sql, [userId, id])
  return res
}

/**
 * 查询单个用户所有订单
 */
async function findAllOrder ({ userId }) {
  let sql = `SELECT o.create_time, o.total_price, o.status, o.order_num, op.order_id, op.number, p.*, a.address, a.consignee, a.phone FROM tb_order o
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

/**
 * 查询所有订单 管理系统用
 * @returns {string}
 */
async function findAll({ pageNum, pageSize}) {
  pageNum = parseInt(pageNum)
  pageSize = parseInt(pageSize)
  let sql = `SELECT o.id AS order_id, o.create_time, o.order_num, o.status, o.total_price, a.* 
             FROM tb_order o
             LEFT JOIN tb_address a ON o.address_id = a.id
             ORDER BY create_time DESC
             LIMIT ?, ?`
  let sql2 = `SELECT COUNT(*) total FROM tb_order o LEFT JOIN tb_address a ON o.address_id = a.id`
  const result = await curd(sql, [(pageNum - 1) * pageSize, pageSize])
  const result2 = await curd(sql2)
  return { records: result, total: result2[0].total }
}

// 生成日期
function getTime() {
  let date = new Date()
  let year = date.getFullYear()
  let month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  let hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
  let minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  let second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
  let create_time = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
  return create_time
}

// 生成订单号
function getOrderNum (products_length) {
  return new Date().getTime() + products_length
}

module.exports = { addOrder, changeOrderStatus, findOrder, findAllOrder, findAll }
