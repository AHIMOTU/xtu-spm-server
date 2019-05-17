const curd = require('../common/mysql.js')
const fs = require('fs')
const path = require('path')

async function isExist (id) {
  const result = await Product.find({ _id: id })
  if (!result) {
    throw new Error('商品不存在')
  }
}

/**
 * 新增\更新商品
 */
async function addProduct ({ id, name, picture_url, stock, cate_id, price, description }) {
  if (id) {
    // await isExist(product._id)
    let sql = `UPDATE tb_product SET name = ?, price = ?, stock = ?, description = ?, picture_url = ? WHERE id = ?`
    let sql2 = `UPDATE tb_product_category SET cate_id = ? WHERE product_id = ?`
    await curd(sql, [name, price, stock, description, picture_url, id])
    await curd(sql2, [cate_id, id])
    // console.log(res)
  } else {
    let sql = 'INSERT INTO tb_product (name, stock, picture_url, price, description) VALUES (?, ?, ?, ?, ?)'
    const res = await curd(sql, [name, stock, picture_url, price, description])
    // console.log(res.insertId)
    if (res.insertId) {
      let sql3 = `INSERT INTO tb_product_category (product_id, cate_id) VALUES (?, ?)`
      const result3 = await curd(sql3, [res.insertId, cate_id])
    }
  }
}

/**
 * 按销量查询商品
 */
async function getSalesProduct ({ pageNum, pageSize }) {
  pageNum = parseInt(pageNum)
  pageSize = parseInt(pageSize)
  let sql = `SELECT * FROM tb_product ORDER BY sales_count DESC LIMIT ?, ?`
  let sql2 = `SELECT COUNT(*) as total FROM tb_product`
  const result = await curd(sql, [(pageNum - 1) * pageSize, pageSize])
  const result2 = await curd(sql2)
  return { records: result, total: result2[0].total }
}

/**
 * 根据品类id分页查询商品
 */
async function getProductByCateId ({ cate_id, pageNum, pageSize, priceSort, salesSort }) {
  pageNum = parseInt(pageNum)
  pageSize = parseInt(pageSize)
  cate_id = parseInt(cate_id)
  priceSort = parseInt(priceSort)
  salesSort = parseInt(salesSort)
  let sql = ``
  let sql2 = `SELECT COUNT(*) total FROM tb_product p LEFT JOIN tb_product_category pc ON p.id = pc.product_id LEFT JOIN tb_category c ON pc.cate_id = c.id WHERE c.id = ?`
  if (priceSort === 1) { // 按价格升序
    sql = `SELECT p.*, c.name as category_name FROM tb_product p LEFT JOIN tb_product_category pc ON p.id = pc.product_id LEFT JOIN tb_category c ON pc.cate_id = c.id WHERE c.id = ? ORDER BY price ASC LIMIT ?, ?`
  } else if (priceSort === 0) {
    sql = `SELECT p.*, c.name as category_name FROM tb_product p LEFT JOIN tb_product_category pc ON p.id = pc.product_id LEFT JOIN tb_category c ON pc.cate_id = c.id WHERE c.id = ? ORDER BY price DESC LIMIT ?, ?`
  } else if (salesSort === 0) {
    sql = `SELECT p.*, c.name as category_name FROM tb_product p LEFT JOIN tb_product_category pc ON p.id = pc.product_id LEFT JOIN tb_category c ON pc.cate_id = c.id WHERE c.id = ? ORDER BY sales_count DESC LIMIT ?, ?`
  } else {
    sql = `SELECT p.*, c.name as category_name FROM tb_product p LEFT JOIN tb_product_category pc ON p.id = pc.product_id LEFT JOIN tb_category c ON pc.cate_id = c.id WHERE c.id = ? LIMIT ?, ?`
  }

  const res = await curd(sql, [cate_id, (pageNum - 1) * pageSize, pageSize])
  const res2 = await curd(sql2, [cate_id])
  console.log(res2[0].total)
  return { records: res, total: res2[0].total }
}

/**
 * 根据商品名查询商品
 */
async function getProductByPage ({ keyword, pageNum, pageSize, priceSort, salesSort }) {
  // console.log(priceSort)
  pageNum = parseInt(pageNum)
  pageSize = parseInt(pageSize)
  priceSort = parseInt(priceSort)
  salesSort = parseInt(salesSort)
  // console.log(keyword, priceSort, salesSort)
  let sql = ``
  if (keyword || keyword === '') {
    if (priceSort === 1) { // 按价格升序
      sql = `SELECT * FROM tb_product WHERE name LIKE '%${keyword}%' ORDER BY price ASC LIMIT ?, ?`
    } else if (priceSort === 0) {
      sql = `SELECT * FROM tb_product WHERE name LIKE '%${keyword}%' ORDER BY price DESC LIMIT ?, ?`
    } else if (salesSort === 0) {
      sql = `SELECT * FROM tb_product WHERE name LIKE '%${keyword}%' ORDER BY sales_count DESC LIMIT ?, ?`
    } else {
      sql = `SELECT * FROM tb_product WHERE name LIKE '%${keyword}%' LIMIT ?, ?`
    }
    // console.log(sql)
    let sql2 = `SELECT COUNT(*) as total FROM tb_product WHERE name LIKE '%${keyword}%'`
    const res = await curd(sql, [(pageNum - 1) * pageSize, pageSize])
    const res2 = await curd(sql2)
    // console.log(res)
    // console.log(res2[0].total)
    return { records: res, total: res2[0].total }
  } else {
    sql = `SELECT * FROM tb_product LIMIT ?, ?`
    let sql2 = `SELECT COUNT(*) as total FROM tb_product`
    const res = await curd(sql, [(pageNum - 1) * pageSize, pageSize])
    const res2 = await curd(sql2)
    return { records: res, total: res2[0].total }
  }
}

/**
 * 根据id查询商品详情
 */
async function getProductById ({ id }) {
  let sql = "SELECT p.*, pc.cate_id FROM tb_product p LEFT JOIN tb_product_category pc ON p.id = pc.product_id WHERE p.id = ?"
  let res = await curd(sql, [id])
  return res[0]
}

/**
 * 根据id删除商品
 */
async function delProduct ({ id }) {
  console.log(id === 3)
  let sql = `DELETE FROM tb_product WHERE id = ?`
  await curd(sql, [id])
}

/**
 * 新增商品评价
 */
async function addComment ({ product_id, rate, content }, userId) {
  let sql = `INSERT INTO tb_comment (product_id, user_id, content, rate, create_time) VALUES (?, ?, ?, ?, ?)`
  let create_time = getTime()
  const result = await curd(sql, [product_id, userId, content, rate, create_time])
}

// 获取商品评价
async function getComment ({ id }) {

}

/**
 * 上传图片
 */
function uploadImg (file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file.path, (err, data) => {
      if (err) throw new Error('图片上传失败')
      let randomName = Date.now() + parseInt(Math.random() * 999) + parseInt(Math.random() * 2222)
      let exName = file.mimetype.split('/')[1]
      let name = randomName + '.' + exName
      fs.writeFile(path.join(__dirname, '../public/images/' + name), data, (err) => {
        if (err) throw new Error('图片写入失败')
        resolve(`/images/${name}`)
      })
    })
  })
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

module.exports = { addProduct, getSalesProduct, getProductByPage, getProductByCateId, getProductById, delProduct, addComment, uploadImg }
