const curd = require('../common/mysql.js')

/**
 * 商品是否已经存在购物车
 */
async function isExistProduct (product_id, userId) {
  let sql = `SELECT * FROM tb_cart c 
            LEFT JOIN tb_cart_product cp ON c.id = cp.cart_id 
            LEFT JOIN tb_product p ON cp.product_id = p.id 
            WHERE product_id = ${product_id} AND user_id = ${userId}`
  const res = await curd(sql)
  return res
}

/**
 * 用户是否已经有购物车
 */
async function isExistCart (userId) {
  let sql = `SELECT * FROM tb_cart WHERE user_id = ?`
  const res = await curd(sql, [userId])
  return res
}

/**
 * 新增/更新购物车
 */
async function addCart ({ cartId, product_id, userId, count }) {
  const existCart = await isExistCart(userId)
  // console.log(existCart)
  if (existCart.length) { // 该用户有购物车 直接拿购物车existCart.id
    const existProduct = await isExistProduct(product_id, userId)
    // console.log(existProduct)
    if (existProduct.length) { // 购物车内已有该商品
      let sql3 = `UPDATE tb_cart_product SET count = ? WHERE cart_id = ? AND product_id = ?`
      const res3 = curd(sql3, [count, existCart[0].id, product_id])
      // console.log(res3)
      if (!res3) {
        throw new Error('加入购物车失败')
      }
    } else { // 购物车内还没有该商品
      let sql2 = `INSERT INTO tb_cart_product (cart_id, product_id, count) VALUES (?, ?, ?)`
      const res2 = curd(sql2, [existCart[0].id, product_id, count])
      // console.log(res2)
      if (!res2) {
        throw new Error('加入购物车失败')
      }
    }
  } else { // 如果该用户还没有购物车 先新增一条数据拿到购物车id
    let sql1 = `INSERT INTO tb_cart (user_id) VALUES (?)`
    const res1 = await curd(sql1, [userId])
    // console.log(res1)
    if (res1) {
      let sql2 = `INSERT INTO tb_cart_product (cart_id, product_id, count) VALUES (?, ?, ?)`
      const res2 = curd(sql2, [res1.insertId, product_id, count])
      // console.log(res2)
      if (!res2) {
        throw new Error('加入购物车失败')
      }
    }
  }
}

/**
 * 累加 往购物车内添加同类商品
 */
async function directAddCart ({ product_id, count, userId }) {
  const existCart = await isExistCart(userId)
  if (existCart.length) {
    const existProduct = await isExistProduct(product_id, userId)
    console.log(existProduct)
    if (existProduct.length) { // 购物车内已有该商品
      let sql3 = `UPDATE tb_cart_product SET count = ? WHERE cart_id = ? AND product_id = ?`
      const res3 = curd(sql3, [parseInt(existProduct[0].count + count), existCart[0].id, product_id])
      console.log(res3)
      if (!res3) {
        throw new Error('加入购物车失败')
      }
    } else { // 购物车内还没有该商品
      let sql2 = `INSERT INTO tb_cart_product (cart_id, product_id, count) VALUES (?, ?, ?)`
      const res2 = curd(sql2, [existCart[0].id, product_id, count])
      console.log(res2)
      if (!res2) {
        throw new Error('加入购物车失败')
      }
    }
  } else {
    let sql1 = `INSERT INTO tb_cart (user_id) VALUES (?)`
    const res1 = await curd(sql1, [userId])
    console.log(res1)
    if (res1) {
      let sql2 = `INSERT INTO tb_cart_product (cart_id, product_id, count) VALUES (?, ?, ?)`
      const res2 = curd(sql2, [res1.insertId, product_id, count])
      console.log(res2)
      if (!res2) {
        throw new Error('加入购物车失败')
      }
    }
  }
}

/**
 * 查询购物车
 */
async function findCart ({ userId }) {
  let sql = `SELECT p.*, cp.count, cp.selected, cp.ordered FROM tb_cart c LEFT JOIN tb_cart_product cp ON c.id = cp.cart_id LEFT JOIN tb_product p ON p.id = cp.product_id WHERE user_id = ?`
  const res = await curd(sql, [userId])
  // console.log(res)
  let filterRes = res.filter(r => r.ordered === 0) // 只返回ordered = 0 即未加入订单的商品
  return filterRes
}

/**
 * 删除购物车商品 批量
 */
async function deleteCart ({ productIds, userId }) {
  console.log(productIds)
  const existCart = await isExistCart(userId)
  if (existCart.length) {
    for (let product_id of productIds) {
      let sql = `DELETE FROM tb_cart_product WHERE cart_id = ? AND product_id`
      const res = await curd(sql, [existCart[0].id, product_id])
      console.log(res)
    }
  }  
}

/**
 * 改变购物车内 单个 商品的选中状态
 */

async function changeSelected ({ product_id, userId, selected }) {
  const existCart = await isExistCart(userId)
  if (existCart.length) {
    let sql = `UPDATE tb_cart_product SET selected = ? WHERE cart_id = ? AND product_id = ?`
    const res = await curd(sql, [selected, existCart[0].id, product_id])
    console.log(res)
  }
}

/**
 * 改变购物车内 全部 商品的选中状态
 */
async function changeAllSelected ({ userId, selected }) {
  const existCart = await isExistCart(userId)
  if (existCart.length) {
    let sql = `UPDATE tb_cart_product SET selected = ? WHERE cart_id = ?`
    const res = await curd(sql, [selected, existCart[0].id])
    console.log(res)
  }
}

module.exports = { addCart, deleteCart, directAddCart, findCart, changeSelected, changeAllSelected }