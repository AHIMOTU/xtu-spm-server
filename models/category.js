const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '品类吗不能为空'],
    unique: true
  },
  shortName: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now()
  }
})

module.exports = mongoose.model('category', schema)
