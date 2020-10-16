const db = require('../../models')
const Item = db.Item
const Subcategory = db.Subcategory
const Category = db.Category
const ItemType = db.ItemType
const Cart = db.Cart

const listController = {
  addToTemList: async (req, res) => {
    try {
      let { id } = req.params
      const ItemId = parseInt(id)
      const item = await Item.findOne({
        where: {
          id: ItemId,
          userId: req.user.id
        }
      })
      if (!item) return res.json({ status: 'error', message: '找不到此項目' })

      const cartItem = await Cart.findOne({
        where: {
          ItemId,
          userId: req.user.id
        }
      })
      console.log(ItemId)
      if (cartItem) {
        return res.json({ status: 'error', message: '此項目已存在於暫存菜單中' })
      } else {
        await Cart.create({
          UserId: req.user.id,
          ItemId: item.id,
          reps: '',
          remark: ''
        })
        return res.json({ status: 'success' })
      }
    } catch (err) {
      return res.json(err)
    }
  }
}

module.exports = listController