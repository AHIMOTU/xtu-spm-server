const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const logger = require('morgan')
// const mongoose = require('mongoose')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const productRouter = require('./routes/product')
const categoryRouter = require('./routes/category')
const cartRouter = require('./routes/cart')
const addressRouter = require('./routes/address')
const orderRouter = require('./routes/order')
const commentRouter = require('./routes/comment')

const app = express()

// 连接mongodb数据库
// const db = mongoose.connection
// mongoose.connect('mongodb://127.0.0.1:27017/bishe')
// db.on('connected', () => {
//   console.log('~~~~~~~~~connect success~~~~~~~~')
// })
// db.on('error', (err) => {
//   console.log('<^><^><^>connect failed<^><^><^>' + err)
// })

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// 自定义中间件
app.use(require('./middleware/res.js'))
app.use(require('./middleware/token.js'))

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
  secret: '12345',
  name: 'name',
  cookie:
    { maxAge: 60000 },
  resave: false,
  saveUninitialized: true
}))

// 路由
app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/product', productRouter)
app.use('/category', categoryRouter)
app.use('/cart', cartRouter)
app.use('/address', addressRouter)
app.use('/order', orderRouter)
app.use('/comment', commentRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message
  // res.locals.error = req.app.get('env') === 'development' ? err : {}

  // console.log('err1234567890-')
  // 利用中间件统一处理抛出的错误
  res.fail(err.toString())
})

module.exports = app
