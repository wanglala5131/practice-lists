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
          UserId: req.user.id,
        },
        order: [['sort', 'ASC']],
        include: [
          Item,
          {
            model: Item,
            include: [Category, { model: Subcategory, as: 'Subcategories' }],
          },
        ],
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
          userId: req.user.id,
        },
      })
      if (!item) return res.json({ status: 'error', message: '找不到此項目' })
      if (item.isClosed) {
        return res.json({
          status: 'error',
          message: '此項目已被封存，無法加入暫定清單',
        })
      }
      const cartItem = await Cart.findAll({
        where: {
          userId: req.user.id,
        },
      })
      if (cartItem.length > 20) {
        return res.json({ status: 'error', message: '暫時菜單最多只能20個唷' })
      } else {
        const repeatItem = await cartItem.filter(item => item.ItemId === ItemId)
        if (repeatItem.length !== 0) {
          return res.json({
            status: 'error',
            message: '此項目已存在',
            repeatItem,
          })
        } else {
          const data = await Cart.create({
            UserId: req.user.id,
            ItemId: item.id,
            reps: '',
            remark: '',
            sort: 1000,
          })
          return res.json({ status: 'success', data })
        }
      }
    } catch (err) {
      return res.json(err)
    }
  },
  putCartItem: async (req, res) => {
    try {
      const { updateItems } = req.body
      for (let item of updateItems) {
        await Cart.update(item, { where: { ItemId: item.ItemId } })
      }
      return res.json({ status: 'success' })
    } catch (err) {
      return res.json(err)
    }
  },
  deleteCartItem: async (req, res) => {
    try {
      const { id } = req.params
      Cart.destroy({ where: { id } })
      return res.json({ status: 'success' })
    } catch (err) {
      return res.json(err)
    }
  },
  submitCartItem: async (req, res) => {
    try {
      const { updateItems, listName } = req.body
      if (!listName) {
        return res.json({ status: 'error', message: '記得輸入菜單名稱唷！' })
      }
      if (updateItems.length < 3) {
        return res.json({ status: 'error', message: '菜單至少要包含3個項目唷' })
      }
      const list = await List.create({
        UserId: req.user.id,
        name: listName,
        isUsed: false,
      })
      let sortCount = 0
      for (let item of updateItems) {
        await ListItem.create({
          ListId: list.id,
          ItemId: item.ItemId,
          reps: item.reps,
          remark: item.remark,
          sort: sortCount,
        })
        sortCount++
      }
      //清空暫時菜單
      const cartItemsArr = await Cart.findAll({
        where: {
          UserId: req.user.id,
        },
      })
      for (let cartItems of cartItemsArr) {
        await cartItems.destroy()
      }
      return res.json({ status: 'success', list })
    } catch (err) {
      return res.json(err)
    }
  },
  getLists: async (req, res) => {
    try {
      const oriIsUsed = req.query.isUsed
      let isUsed = oriIsUsed === 'false' ? false : true
      const lists = await List.findAll({
        where: {
          UserId: req.user.id,
          isUsed,
        },
        order: [
          ['createdAt', 'DESC'],
          [{ model: Item, as: 'Items' }, { model: ListItem }, 'sort', 'ASC'],
        ],
        include: [
          {
            model: Item,
            as: 'Items',
            include: [Category, { model: Subcategory, as: 'Subcategories' }],
          },
        ],
      })
      return res.json(lists)
    } catch (err) {
      return res.json(err)
    }
  },
  getList: async (req, res) => {
    try {
      const { id } = req.params
      const list = await List.findOne({
        where: {
          UserId: req.user.id,
          id,
        },
        order: [
          [{ model: Item, as: 'Items' }, { model: ListItem }, 'sort', 'ASC'],
        ],
        include: [
          {
            model: Item,
            as: 'Items',
            include: [Category, { model: Subcategory, as: 'Subcategories' }],
          },
        ],
      })
      if (!list) {
        return res.json({ status: 'error', message: '找不到此清單' })
      }
      return res.json(list)
    } catch (err) {
      return res.json(err)
    }
  },
  listStatus: async (req, res) => {
    try {
      const { id } = req.params
      const list = await List.findOne({
        where: {
          id,
          UserId: req.user.id,
        },
      })
      if (!list) {
        return res.json({ status: 'error', message: '找不到此菜單資料' })
      }
      list.update({
        isUsed: !list.isUsed,
      })
      return res.json({ status: 'success' })
    } catch (err) {
      return res.json(err)
    }
  },
  deleteList: async (req, res) => {
    try {
      const { id } = req.params
      const deleteList = await List.findOne({
        where: {
          id,
          UserId: req.user.id,
        },
      })
      await deleteList.destroy()
      const deleteListItemArr = await ListItem.findAll({
        where: { ListId: id },
      })
      for (let deleteListItem of deleteListItemArr) {
        await deleteListItem.destroy()
      }
      return res.json({ status: 'success' })
    } catch (err) {
      return res.json(err)
    }
  },
  putList: async (req, res) => {
    try {
      const ListId = req.params.id
      const { updateItems, listName } = req.body
      if (updateItems.length < 3) {
        return res.json({ status: 'error', message: '項目至少需要三項' })
      }
      if (!listName) {
        return res.json({ status: 'error', message: '請輸入菜單名稱' })
      }
      const list = await List.findOne({
        where: {
          id: ListId,
        },
      })
      const listItems = await ListItem.findAll({
        where: {
          ListId,
        },
      })
      if (list.name !== listName) {
        await list.update({
          name: listName,
        })
      }
      for (let item of listItems) {
        for (let upItem of updateItems) {
          if (item.ItemId === upItem.ItemId) {
            //有不一樣才更新
            if (
              item.sort !== upItem.sort ||
              item.sort !== upItem.sort ||
              item.remark !== upItem.remark ||
              item.reps !== upItem.reps
            ) {
              item.update({
                sort: upItem.sort,
                remark: upItem.remark,
                reps: upItem.reps,
              })
            }
            break //找到了就跳下一個迴圈
          }
        }
      }
      return res.json({ status: 'success' })
    } catch (err) {
      return res.json(err)
    }
  },
}

module.exports = listController
