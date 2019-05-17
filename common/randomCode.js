/**
 * 生成6位数的验证码
 */

module.exports = function randomCode () {
    let code = ''
    let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
    for (let i = 0; i < 6; i++) {
        code += arr[parseInt(Math.random()*10)]
    }
    return code
}
