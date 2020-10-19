const db = require('../../models')
const Item = db.Item
const Subcategory = db.Subcategory
const Category = db.Category
const ItemType = db.ItemType
const Cart = db.Cart
const List = db.List
const ListItem = db.ListItem

//前端傳進putCartItem的陣列範例
// const updateItems = [
//   {
//     ItemId: 2,
//     reps: 'eee',
//     remark: 'eeee--',
//     sort: 2
//   },
//   {
//     ItemId: 4,
//     reps: 'eeee--',
//     remark: 'ee',
//     sort: 3
//   }
// ]

const listController = {
  getCart: async (req, res) => {
    try {
      const cartItem = await Cart.findAll({
        where: {
          UserId: req.user.id
        },
        order: [
          ['sort', 'ASC']
        ],
        include: [
          Item
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
  putCartItem: async (req, res) => {
    try {
      //TODO: 確認前端是否正確傳物件進來，最外層有一個updateItems
      const { updateItems } = req.body
      for (let item of updateItems) {
        await Cart.update(item, { 'where': { ItemId: item.ItemId } })
      }
      return res.json({ status: 'success' })
    } catch (err) {
      return res.json(err)
    }
  },
  deleteCartItem: async (req, res) => {
    try {
      const { id } = req.params
      Cart.destroy({ "where": { id } })
      return res.json({ status: 'success' })
    } catch (err) {
      return res.json(err)
    }
  },
  submitCartItem: async (req, res) => {
    try {
      //TODO: 確認前端是否正確傳物件進來，最外層有一個updateItems，和name
      const { updateItems, listName } = req.body
      const list = await List.create({
        UserId: req.user.id,
        name: listName,
        isUsed: false
      })
      for (let item of updateItems) {
        await ListItem.create({
          ListId: list.id,
          ItemId: item.ItemId,
          reps: item.reps,
          remark: item.remark
        })
      }
      return res.json({ status: 'success' })
    } catch (err) {
      return res.json(err)
    }
  },
  getLists: async (req, res) => {
    try {
      const lists = await List.findAll({
        where: {
          UserId: req.user.id
        },
        include: [
          {
            model: Item, as: 'Items', include: [
              Category,
              { model: Subcategory, as: 'Subcategories' }
            ]
          },
        ]
      })
      return res.json(lists)
    } catch (err) {
      return res.json(err)
    }
  }
}

module.exports = listController