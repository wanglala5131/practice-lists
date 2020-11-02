const db = require('../../models')
const Item = db.Item
const Subcategory = db.Subcategory
const Category = db.Category
const ItemType = db.ItemType
const Cart = db.Cart
const fs = require('fs')

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
      return res.json({ status: 'success', item })
    } catch (err) {
      return res.json(err)
    }
  },
  addItem: async (req, res) => {
    try {
      const UserId = req.user.id
      const {
        name,
        description,
        CategoryId: categoryId,
        subcategories,
        limit,
      } = req.body
      if (!name || !CategoryId || subcategories.length === 0) {
        return res.json({ status: 'error', message: '必填欄位要記得填喔！' })
      }
      const { file } = req
      if (file) {
        fs.readFile(file.path, (err, data) => {
          if (err) {
            return res.json({ message: 'error' })
          }
          fs.writeFile(`upload/${file.originalname}`, data, async () => {
            const newItem = await Item.create({
              name,
              description,
              image: `/upload/${file.originalname}`,
              CategoryId,
              limit,
              UserId,
              isClosed: false,
            })
            const ItemId = await newItem.id
            for (let subcategory of subcategories) {
              await ItemType.create({
                ItemId,
                SubcategoryId: Number(subcategory),
              })
            }
            return res.json({ newItem })
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
        })
        const ItemId = await newItem.id
        for (let subcategory of subcategories) {
          await ItemType.create({
            ItemId,
            SubcategoryId: Number(subcategory),
          })
        }
        return res.json({ newItem })
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
      const { name, description, CategoryId, subcategories, limit } = req.body
      if (!name || !CategoryId || subcategories.length === 0) {
        return res.json({ status: 'error', message: '必填欄位要記得填喔！' })
      }
      const { file } = req
      if (file) {
        fs.readFile(file.path, async (err, data) => {
          try {
            if (err) {
              return res.json({ message: 'error' })
            }
            await fs.writeFile(`upload/${file.originalname}`, data, () => {
              putItem.update({
                name,
                description,
                image: `/upload/${file.originalname}`,
                CategoryId,
                limit,
              })
            })
          } catch (err) {
            return res.json(err)
          }
        })
      } else {
        await putItem.update({
          name,
          description,
          CategoryId,
          limit,
        })
      }
      //處理Subcategory
      const newSubArr = subcategories.map(Number)
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
      res.json({ status: 'success' })
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
}

module.exports = itemController
