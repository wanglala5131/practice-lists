const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

const itemController = require('../controllers/api/itemController')
const userController = require('../controllers/api/userController')

const authenticated = passport.authenticate('jwt', { session: false })



router.post('/signin', userController.signIn)
router.get('/user/current', authenticated, userController.currentUser)

router.get('/', (req, res) => res.redirect('/api/practice'))
router.get('/practice', authenticated, itemController.getItems)

module.exports = router