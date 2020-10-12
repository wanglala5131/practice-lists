const db = require('../../models')
const Item = db.Item
const Subcategory = db.Subcategory
const Category = db.Category

const itemController = {
  getItems: (req, res) => {
    const userId = req.user.id
    Item.findAll({
      where: {
        userId
      },
      include: [
        Category,
        { model: Subcategory, as: 'Subcategories' }
      ]
    }).then(items => {
      return res.json({ items })
    })

  },

}

module.exports = itemController