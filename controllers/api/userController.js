const bcrypt = require('bcryptjs')
const db = require('../../models')
const User = db.User
const passport = require('../../config/passport')

// JWT
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const userController = {
  signIn: async (req, res) => {
    // 檢查必要資料
    if (!req.body.email || !req.body.password) {
      return res.json({ status: 'error', message: "required fields didn't exist" })
    }
    // 檢查 user 是否存在與密碼是否正確
    const { email, password } = req.body

    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(401).json({ status: 'error', message: 'no such user found' })
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ status: 'error', message: 'passwords did not match' })
    }
    // 簽發 token
    let payload = { id: user.id }
    let token = await jwt.sign(payload, process.env.JWT_SECRET)
    return res.json({
      status: 'success',
      token,
      user: {
        id: user.id, name: user.name, email: user.email
      }
    })
  },
  signUp: async (req, res) => {
    const { name, email, password } = req.body
    const user = await User.findOne({ where: { email } })
    if (!name || !email || !password) {
      return res.json({ status: 'error', message: '請輸入完整資訊' })
    }
    if (user) {
      return res.json({ status: 'error', message: '此電子信箱已被註冊' })
    }
    await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcrypt.genSaltSync(10))
    })
    return res.json({ status: 'success' })
  },
  currentUser: (req, res) => {
    const { id, name, email } = req.user
    return res.json({ id, name, email })
  },

}

module.exports = userController