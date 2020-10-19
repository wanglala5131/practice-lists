const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const itemController = require('../controllers/api/itemController')
const userController = require('../controllers/api/userController')
const settingController = require('../controllers/api/settingController')
const listController = require('../controllers/api/listController')

const authenticated = passport.authenticate('jwt', { session: false })


//user
router.post('/practice/signin', userController.signIn)
router.post('/practice/signup', userController.signUp)
router.get('/practice/users/current', authenticated, userController.currentUser)

//item
router.get('/', (req, res) => res.redirect('/api/practice'))
router.get('/practice', authenticated, itemController.getItems)
router.get('/practice/items/:id', authenticated, itemController.getItem)
router.post('/practice/items', authenticated, upload.single('image'), itemController.addItem)
router.put('/practice/items/:id', authenticated, upload.single('image'), itemController.putItem)
router.put('/practice/items/:id/close', authenticated, itemController.closeItem)
router.delete('/practice/items/:id', authenticated, itemController.deleteItem)

//TODO: 記得加上確認userid的判斷，findByPk要改成findOne
//setting
router.get('/practice/setting/subcategories', authenticated, settingController.getSubcategories)
router.post('/practice/setting/subcategories', authenticated, settingController.addSubcategory)
router.put('/practice/setting/subcategories/:id', authenticated, settingController.putSubcategory)
router.delete('/practice/setting/subcategories/:id', authenticated, settingController.deleteSubcategory)
router.get('/practice/setting/categories', authenticated, settingController.getCategories)
router.post('/practice/setting/categories', authenticated, settingController.addCategory)
router.put('/practice/setting/categories/:id', authenticated, settingController.putCategory)
router.delete('/practice/setting/categories/:id', authenticated, settingController.deleteCategory)

//cart
router.get('/practice/cart', authenticated, listController.getCart)
router.post('/practice/cart/:id', authenticated, listController.addToCart)
router.put('/practice/cart/edit', authenticated, listController.putCartItem)
router.delete('/practice/cart/:id', authenticated, listController.deleteCartItem)
router.put('/practice/cart/submit', authenticated, listController.submitCartItem)

//list
router.get('/practice/lists', authenticated, listController.getLists)
router.put('/practice/lists/:id', authenticated, listController.listStatus)


module.exports = router