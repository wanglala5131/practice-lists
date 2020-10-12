const db = require('../../models')
const Item = db.Item
const Subcategory = db.Subcategory
const Category = db.Category
const ItemType = db.ItemType

const itemController = {
  getItems: async (req, res) => {
    try {

      const userId = req.user.id
      const items = await Item.findAll({
        where: {
          userId
        },
        include: [
          Category,
          { model: Subcategory, as: 'Subcategories' }
        ]
      })
      return res.json({ items })
    }
    catch (err) {
      return res.json(err)
    }
  },
  addItem: async (req, res) => {
    try {
      const UserId = req.user.id
      const { name, description, image, CategoryId, subcategories, limit } = req.body
      if (!name || !CategoryId || subcategories.length === 0) {
        return res.json({ status: 'error', message: '必填欄位要記得填喔！' })
      }
      const newItem = await Item.create({
        name,
        description,
        image,
        CategoryId,
        limit,
        UserId,
        isClosed: false
      })
      const ItemId = await newItem.id
      for (let subcategory of subcategories) {
        await ItemType.create({
          ItemId,
          SubcategoryId: Number(subcategory)
        })
      }
      return res.json({ newItem })
    } catch (err) {
      return res.json(err)
    }
  },
  closeItem: async (req, res) => {
    try {
      const ItemId = req.params.id
      const putItem = await Item.findByPk(ItemId)
      await putItem.update({
        isClosed: !putItem.isClosed
      })
      res.json({ status: 'success' })
    }
    catch (err) {
      res.json(err)
    }
  }
}

module.exports = itemController