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
  putItem: async (req, res) => {
    try {
      const ItemId = req.params.id
      const putItem = await Item.findByPk(ItemId, {
        include: [{ model: Subcategory, as: 'Subcategories' }]
      })
      const { name, description, image, CategoryId, subcategories, limit } = req.body
      if (!name || !CategoryId || subcategories.length === 0) {
        return res.json({ status: 'error', message: '必填欄位要記得填喔！' })
      }
      await putItem.update({
        name, description, image, CategoryId, limit
      })

      //處理Subcategory  
      const newSubArr = subcategories.map(Number)
      const oriSubArr = []
      for (let subcategory of putItem.Subcategories) {
        await oriSubArr.push(subcategory.id)
      }
      const addSubArr = newSubArr.filter((subcategoryId) => {
        if (!oriSubArr.includes(subcategoryId)) {
          return subcategoryId
        }
      })
      const deleteSubArr = oriSubArr.filter((subcategoryId) => {
        if (!newSubArr.includes(subcategoryId)) {
          return subcategoryId
        }
      })
      //新增subcategory
      if (addSubArr.length !== 0) {
        for (let subcategoryId of addSubArr) {
          ItemType.create({
            ItemId,
            SubcategoryId: subcategoryId
          })
        }
      }
      //刪除subcategory
      if (deleteSubArr.length !== 0) {
        for (let subcategoryId of deleteSubArr) {
          const deleteItemType = await ItemType.findAll({
            where: {
              ItemId,
              SubcategoryId: subcategoryId
            }
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
      const putItem = await Item.findByPk(ItemId)
      await putItem.update({
        isClosed: !putItem.isClosed
      })
      res.json({ status: 'success' })
    }
    catch (err) {
      res.json(err)
    }
  },
  deleteItem: async (req, res) => {
    try {
      const ItemId = req.params.id
      const deleteItem = await Item.findByPk(ItemId)
      await deleteItem.destroy()
      const deleteItemTypeArr = await ItemType.findAll({
        where: { ItemId }
      })
      for (let deleteItemType of deleteItemTypeArr) {
        await deleteItemType.destroy()
      }
      return res.json({ status: 'success' })
    }
    catch (err) {
      res.json(err)
    }
  }
}

module.exports = itemController