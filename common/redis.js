/**
 * redis封装
 */

const redis = require('redis')

const client = redis.createClient('6379', '39.108.6.26', { auth_pass: 'bjl123'})
client.on('error', (err) => {
    console.log('连接失败')
})
client.on('ready', (res) => {
    console.log('ready')
})
client.on('connect', () => {
    console.log('connect success')
})

function redisSet(key, val, expire, cb) {
    client.set(key, val, (err, res) => {
        if (err) {
            cb(err, null)
            return
        }
        if (!isNaN(expire) && expire > 0) {
            client.expire(key, parseInt((expire)))
        }
        cb(null, res)
    })
}

function resisGet(key, cb) {
    client.get(key, (err, res) => {
        if (err) {
            cb(err, null)
            return
        }
        cb(null, res)
    })
}

module.exports = { redisSet, resisGet }