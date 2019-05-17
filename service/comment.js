const curd = require('../common/mysql.js')

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
    let sql = `SELECT c.id, c.rate, c.content, c.create_time, u.username FROM tb_comment c LEFT JOIN tb_user u ON c.user_id = u.id WHERE product_id = ?`
    let result = await curd(sql, [id])
    return result
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

module.exports = { addComment, getComment }
