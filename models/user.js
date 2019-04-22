const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: Number
  },
  role: {
    type: Number,
    default: 0 // 0 普通管理员 1 超级管理员
  },
  createTime: {
    type: Date,
    default: Date.now()
  }
})

module.exports = mongoose.model('user', schema)
