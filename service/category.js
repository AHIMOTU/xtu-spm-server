const Category = require('../models/category.js')
const curd = require('../common/mysql.js')

// 进行增删改查前先判断该数据是否存在
async function isExist (id) {
  let sql =  `SELECT * FROM tb_category WHERE id = ?`
  const res = await curd(sql, [id])
  console.log(res.length)
  return res.length > 0
}

/**
 * 新增\更新品类
 */
async function addCategory (category) {
  console.log(category)
  if (category.id) {
    await isExist(category.id)
    const res = await Category.updateOne({ id: category.id }, category)
    console.log(res)
    if (!res || res.n === 0) {
      throw new Error('更新品类失败')
    }
  } else {
    console.log(category)
    const { name, p_id } = category
    let sql = `INSERT INTO tb_category (name, p_id) VALUES (?, ?)`
    const res = await curd(sql, [name, p_id])
    if (!res.insertId) {
      throw new Error('新增品类失败')
    }
  }
}
/**
 * 删除品类
 */
async function delCategory ({ id }) {
  const data = await isExist(id)
  if (!data) throw new Error('该品类不存在')
  let sql =  `DELETE FROM tb_category WHERE id = ?`
  const res = await curd(sql, [id])
  console.log(res.insertId)
  if (!res) {
    throw new Error('删除品类失败')
  }
}
/**
 * 查询品类
 */
async function getCategoryByPage ({ pageSize, pageNum }) {
  if (!pageSize || !pageNum) { // 查询全部
    let sql = `SELECT * FROM tb_category`
    const categories = await curd(sql)
    return categories
  } else { // 分页查询
    let sql = `SELECT * FROM tb_category limit ${pageNum - 1}, ${pageSize}`
    const categories = await curd(sql)
    return categories
  }
}

module.exports = { addCategory, delCategory, getCategoryByPage }
