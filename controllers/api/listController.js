const db = require('../../models')
const Item = db.Item
const Subcategory = db.Subcategory
const Category = db.Category
const ItemType = db.ItemType
const Cart = db.Cart

const listController = {
  getCart: async (req, res) => {
    try {
      const cartItem = await Cart.findAll({
        where: {
          userId: req.user.id
        },
        order: [
          ['sort', 'ASC']
        ]
      })
      return res.json(cartItem)
    } catch (err) {
      return res.json(err)
    }
  },
  addToCart: async (req, res) => {
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

      const cartItem = await Cart.findAll({
        where: {
          userId: req.user.id
        }
      })
      if (cartItem.length > 20) {
        return res.json({ status: 'error', message: '暫時菜單最多只能20個唷' })
      } else {
        const repeatItem = await cartItem.filter(item => item.ItemId === ItemId)
        if (repeatItem.length !== 0) {
          return res.json({ status: 'error', message: '此項目已存在', repeatItem })
        } else {
          await Cart.create({
            UserId: req.user.id,
            ItemId: item.id,
            reps: '',
            remark: '',
            sort: 1000,
          })
          return res.json({ status: 'success' })
        }
      }
    } catch (err) {
      return res.json(err)
    }
  },

}

module.exports = listController