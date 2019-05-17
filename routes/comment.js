const express = require('express')
const router = express.Router()
const CommentService = require('../service/comment.js')

// 新增评论
router.post('/add', async (req, res, next) => {
    await CommentService.addComment(req.body, req.userId)
    res.success()
})

// 通过商品id获取评论
router.get('/find', async (req, res, next) => {
    const data = await CommentService.getComment(req.query)
    res.success(data)
})

module.exports = router
