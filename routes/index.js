const itemController = require('../controllers/api/itemController')

module.exports = app => {
  app.get('/', (req, res) => res.redirect('/practice'))
  app.get('/practice', itemController.getItems)
}