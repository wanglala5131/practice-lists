const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const itemController = require('../controllers/api/itemController')
const userController = require('../controllers/api/userController')
const settingController = require('../controllers/api/settingController')

const authenticated = passport.authenticate('jwt', { session: false })



router.post('/practice/signin', userController.signIn)
router.get('/practice/users/current', authenticated, userController.currentUser)

router.get('/', (req, res) => res.redirect('/api/practice'))
router.get('/practice', authenticated, itemController.getItems)
router.get('/practice/items/:id', authenticated, itemController.getItem)
router.post('/practice/items', authenticated, upload.single('image'), itemController.addItem)
router.put('/practice/items/:id', authenticated, upload.single('image'), itemController.putItem)
router.put('/practice/items/:id/close', authenticated, itemController.closeItem)
router.delete('/practice/items/:id', authenticated, itemController.deleteItem)

//setting
router.get('/practice/setting/subcategories', authenticated, settingController.getSubcategories)
router.post('/practice/setting/subcategories', authenticated, settingController.addSubcategory)
router.put('/practice/setting/subcategories/:id', authenticated, settingController.putSubcategory)
router.delete('/practice/setting/subcategories/:id', authenticated, settingController.deleteSubcategory)
router.get('/practice/setting/categories', authenticated, settingController.getCategories)
router.post('/practice/setting/categories', authenticated, settingController.addCategory)
router.put('/practice/setting/categories/:id', authenticated, settingController.putCategory)


module.exports = router