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
async function addProduct (product) {
  if (product._id) {
    await isExist(product._id)
    const res = await Product.update({ _id: product._id }, product)
    console.log(res)
    if (!res || res.n === 0) {
      throw new Error('更新商品失败')
    }
  } else {
    const { name, picture, price, description } = product
    let sql = 'INSERT INTO tb_product (name, picture_url, price, description) VALUES (?, ?, ?, ?)'
    const res = await curd(sql, [name, picture, price, description])
    // 通过insertId判断是否插入成功
    if (!res.insertId) {
      throw new Error('新增商品失败')
    }
  }
}

/**
 * 根据品类id分页查询商品
 */
async function getProductByCateId ({ cate_id, pageNum, pageSize, priceSort }) {
  console.log(priceSort === '1')
  cate_id = parseInt(cate_id)
  priceSort = parseInt(priceSort)
  let sql = ``
  let sql2 = `SELECT COUNT(*) total FROM tb_product p LEFT JOIN tb_product_category pc ON p.id = pc.product_id LEFT JOIN tb_category c ON pc.cate_id = c.id WHERE c.id = ?`
  if (priceSort === 1) { // 按价格升序
    sql = `SELECT p.*, c.name as category_name FROM tb_product p LEFT JOIN tb_product_category pc ON p.id = pc.product_id LEFT JOIN tb_category c ON pc.cate_id = c.id WHERE c.id = ? ORDER BY price ASC LIMIT ?, ?`
  } else if (priceSort === 0) {
    sql = `SELECT p.*, c.name as category_name FROM tb_product p LEFT JOIN tb_product_category pc ON p.id = pc.product_id LEFT JOIN tb_category c ON pc.cate_id = c.id WHERE c.id = ? ORDER BY price DESC LIMIT ?, ?`
  } else {
    sql = `SELECT p.*, c.name as category_name FROM tb_product p LEFT JOIN tb_product_category pc ON p.id = pc.product_id LEFT JOIN tb_category c ON pc.cate_id = c.id WHERE c.id = ? LIMIT ?, ?`
  }

  const res = await curd(sql, [cate_id, parseInt(pageNum) - 1, parseInt(pageSize)])
  const res2 = await curd(sql2, [cate_id])
  console.log(res2[0].total)
  return { records: res, total: res2[0].total }
}

/**
 * 根据商品名查询商品
 */
async function getProductByPage ({ keyword, pageNum, pageSize, priceSort }) {
  // console.log(priceSort)
  priceSort = parseInt(priceSort)
  let sql = ``
  if (keyword) {
    if (priceSort === 1) { // 按价格升序
      sql = `SELECT * FROM tb_product WHERE name LIKE '%${keyword}%' ORDER BY price ASC LIMIT ${pageNum - 1}, ${pageSize}`
    } else if (priceSort === 0) {
      sql = `SELECT * FROM tb_product WHERE name LIKE '%${keyword}%' ORDER BY price DESC LIMIT ${pageNum - 1}, ${pageSize}`
    } else {
      sql = `SELECT * FROM tb_product WHERE name LIKE '%${keyword}%' LIMIT ${pageNum - 1}, ${pageSize}`
    }
    // console.log(sql)
    let sql2 = `SELECT COUNT(*) as total FROM tb_product WHERE name LIKE '%${keyword}%'`
    const res = await curd(sql)
    const res2 = await curd(sql2)
    // console.log(res)
    // console.log(res2[0].total)
    return { records: res, total: res2[0].total }
  } else {
    sql = `SELECT * FROM tb_product LIMIT ${pageNum - 1}, ${pageSize}`
    let res = await curd(sql)
    return res
  }
}

/**
 * 根据id查询商品详情
 */
async function getProductById ({ id }) {
  let sql = "SELECT * FROM tb_product WHERE id = ?"
  let res = await curd(sql, [id])
  return res[0]
}

/**
 * 根据id删除商品
 */
async function delProduct ({ id }) {
  isExist(id)
  const res = await Product.remove({ _id: id })
  if (!res || res.n === 0) {
    throw new Error('删除失败')
  }
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

module.exports = { addProduct, getProductByPage, getProductByCateId, getProductById, delProduct, uploadImg }
