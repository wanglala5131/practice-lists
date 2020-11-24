const db = require('../../models')
const Item = db.Item
const Subcategory = db.Subcategory
const Category = db.Category
const ItemType = db.ItemType
const Cart = db.Cart
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const itemController = {
  getItems: async (req, res) => {
    try {
      const userId = req.user.id
      const items = await Item.findAll({
        where: {
          userId,
          isClosed: false,
        },
        include: [Category, { model: Subcategory, as: 'Subcategories' }],
      })
      const cartItems = await Cart.findAll({
        where: {
          userId,
        },
        include: [
          Item,
          {
            model: Item,
            include: [Category, { model: Subcategory, as: 'Subcategories' }],
          },
        ],
      })
      let cartItemsArr = []
      cartItems.map(cartItem => cartItemsArr.push(cartItem.ItemId))
      return res.json({ items, cartItems, cartItemsArr })
    } catch (err) {
      return res.json(err)
    }
  },
  getCloseItems: async (req, res) => {
    try {
      const userId = req.user.id
      const items = await Item.findAll({
        where: {
          userId,
          isClosed: true,
        },
        include: [Category, { model: Subcategory, as: 'Subcategories' }],
      })
      return res.json({ items })
    } catch (err) {
      return res.json(err)
    }
  },
  getItem: async (req, res) => {
    try {
      const userId = req.user.id
      const ItemId = req.params.id
      const item = await Item.findOne({
        where: {
          id: ItemId,
          UserId: req.user.id,
        },
        include: [Category, { model: Subcategory, as: 'Subcategories' }],
      })
      if (!item) {
        return res.json({ status: 'error', message: '找不到此項目資訊' })
      }
      const cartItems = await Cart.findAll({
        where: {
          userId,
        },
        include: [
          Item,
          {
            model: Item,
            include: [Category, { model: Subcategory, as: 'Subcategories' }],
          },
        ],
      })
      let cartItemsArr = []
      cartItems.map(cartItem => cartItemsArr.push(cartItem.ItemId))
      return res.json({ status: 'success', item, cartItems, cartItemsArr })
    } catch (err) {
      return res.json(err)
    }
  },
  addItem: async (req, res) => {
    try {
      const UserId = req.user.id
      const CategoryId = Number(req.body.CategoryId)
      const { name, description, subcategoriesArr, limit } = req.body
      if (!name || !CategoryId || subcategoriesArr.length === 0) {
        return res.json({ status: 'error', message: '必填欄位要記得填喔！' })
      }
      //若傳來的subcategory只有一項，會變成字串
      let subcategories = []
      if (typeof subcategoriesArr === 'string') {
        subcategories.push(Number(subcategoriesArr))
      } else {
        subcategoriesArr.map(id => subcategories.push(Number(id)))
      }
      const { file } = req
      if (file) {
        const filetype = ['image/jpeg', 'image/png']
        if (!filetype.includes(file.mimetype)) {
          return res.json({
            status: 'error',
            message: '只能傳送圖片格式，例如png、jepg等',
          })
        }
        imgur.setClientID(IMGUR_CLIENT_ID)
        imgur.upload(file.path, (err, img) => {
          return Item.create({
            name,
            description,
            image: img.data.link,
            CategoryId,
            limit,
            UserId,
            isClosed: false,
            isLiked: false,
          }).then(newItem => {
            const ItemId = newItem.id
            for (let subcategory of subcategories) {
              ItemType.create({
                ItemId,
                SubcategoryId: Number(subcategory),
              })
            }
            return res.json({ status: 'success', newItem })
          })
        })
      } else {
        const newItem = await Item.create({
          name,
          description,
          image: null,
          CategoryId,
          limit,
          UserId,
          isClosed: false,
          isLiked: false,
        })
        const ItemId = await newItem.id
        for (let subcategory of subcategories) {
          await ItemType.create({
            ItemId,
            SubcategoryId: Number(subcategory),
          })
        }
        return res.json({ status: 'success', newItem })
      }
    } catch (err) {
      return res.json(err)
    }
  },
  putItem: async (req, res) => {
    try {
      const ItemId = Number(req.params.id)
      const putItem = await Item.findOne({
        where: {
          id: ItemId,
          UserId: req.user.id,
        },
        include: [{ model: Subcategory, as: 'Subcategories' }],
      })
      if (!putItem) {
        return res.json({ status: 'error', message: '找不到此項目資訊' })
      }
      const CategoryId = Number(req.body.CategoryId)
      const { name, description, subcategoriesArr, limit } = req.body
      if (!name || !CategoryId || subcategoriesArr.length === 0) {
        return res.json({ status: 'error', message: '必填欄位要記得填喔！' })
      }
      //處理Subcategory
      let newSubArr = []
      if (typeof subcategoriesArr === 'string') {
        newSubArr.push(Number(subcategoriesArr))
      } else {
        subcategoriesArr.map(id => newSubArr.push(Number(id)))
      }
      const oriSubArr = []
      for (let subcategory of putItem.Subcategories) {
        await oriSubArr.push(subcategory.id)
      }
      const addSubArr = newSubArr.filter(subcategoryId => {
        if (!oriSubArr.includes(subcategoryId)) {
          return subcategoryId
        }
      })
      const deleteSubArr = oriSubArr.filter(subcategoryId => {
        if (!newSubArr.includes(subcategoryId)) {
          return subcategoryId
        }
      })
      //新增subcategory
      if (addSubArr.length !== 0) {
        for (let subcategoryId of addSubArr) {
          ItemType.create({
            ItemId,
            SubcategoryId: subcategoryId,
          })
        }
      }
      //刪除subcategory
      if (deleteSubArr.length !== 0) {
        for (let subcategoryId of deleteSubArr) {
          const deleteItemType = await ItemType.findAll({
            where: {
              ItemId,
              SubcategoryId: subcategoryId,
            },
          })
          await deleteItemType[0].destroy()
        }
      }
      const { file } = req
      if (file) {
        const filetype = ['image/jpeg', 'image/png']
        if (!filetype.includes(file.mimetype)) {
          return res.json({
            status: 'error',
            message: '只能傳送圖片格式，例如png、jepg',
          })
        }
        imgur.setClientID(IMGUR_CLIENT_ID)
        imgur.upload(file.path, (err, img) => {
          if (err) {
            return res.json({ status: 'error' })
          }
          const updateItem = putItem
            .update({
              name,
              description,
              image: img.data.link,
              CategoryId,
              limit,
            })
            .then(updateItem => {
              return res.json({ status: 'success', updateItem })
            })
        })
      } else {
        const updateItem = await putItem.update({
          name,
          description,
          CategoryId,
          limit,
        })
        return res.json({ status: 'success', updateItem })
      }
    } catch (err) {
      res.json(err)
    }
  },
  closeItem: async (req, res) => {
    try {
      const ItemId = req.params.id
      const putItem = await Item.findOne({
        where: {
          id: ItemId,
          UserId: req.user.id,
        },
      })
      if (!putItem) {
        return res.json({ status: 'error', message: '找不到此項目資訊' })
      }
      const cartItems = await Cart.findOne({
        where: {
          ItemId,
        },
      })
      if (cartItems) {
        return res.json({
          status: 'error',
          message: '請從暫定清單中移除此項目，再進行封存',
        })
      }
      await putItem.update({
        isClosed: !putItem.isClosed,
        isLiked: false,
      })
      res.json({ status: 'success' })
    } catch (err) {
      return res.json(err)
    }
  },
  deleteItem: async (req, res) => {
    try {
      const ItemId = req.params.id
      const deleteItem = await Item.findOne({
        where: {
          id: ItemId,
          UserId: req.user.id,
        },
      })
      if (!deleteItem) {
        return res.json({ status: 'error', message: '找不到此項目資訊' })
      }
      await deleteItem.destroy()
      const deleteItemTypeArr = await ItemType.findAll({
        where: { ItemId },
      })
      for (let deleteItemType of deleteItemTypeArr) {
        await deleteItemType.destroy()
      }
      return res.json({ status: 'success' })
    } catch (err) {
      return res.json(err)
    }
  },
  changeLike: async (req, res) => {
    try {
      const ItemId = req.params.id
      const item = await Item.findOne({
        where: {
          id: ItemId,
          UserId: req.user.id,
        },
      })
      if (!item) {
        return res.json({ status: 'error', message: '找不到此項目資訊' })
      }
      await item.update({
        isLiked: !item.isLiked,
      })
      return res.json({ status: 'success' })
    } catch (err) {
      res.json(err)
    }
  },
  deleteItemImage: async (req, res) => {
    try {
      const ItemId = Number(req.params.id)
      const putItem = await Item.findOne({
        where: {
          id: ItemId,
          UserId: req.user.id,
        },
        include: [{ model: Subcategory, as: 'Subcategories' }],
      })
      if (!putItem) {
        return res.json({ status: 'error', message: '找不到此項目資訊' })
      }
      if (!putItem.image) {
        return res.json({ status: 'error', message: '此項目已經沒有照片' })
      }
      await putItem.update({
        image: '',
      })
      return res.json({ status: 'success', data: putItem })
    } catch (err) {
      return res.json(err)
    }
  },
}

module.exports = itemController
