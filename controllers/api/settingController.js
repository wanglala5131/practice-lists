const db = require('../../models')
const Item = db.Item
const Subcategory = db.Subcategory
const Category = db.Category
const ItemType = db.ItemType


const settingController = {
  getSubcategories: async (req, res) => {
    try {
      const subcategories = await Subcategory.findAll({
        where: {
          UserId: req.user.id
        },
        include: [
          { model: Item, as: 'Items' }
        ]
      })
      const categories = await Category.findAll({
        where: {
          UserId: req.user.id
        }
      })
      return res.json({ subcategories, categories })
    } catch (err) {
      return res.json(err)
    }

  },
  addSubcategory: async (req, res) => {
    try {
      const { name, CategoryId } = req.body
      if (!name || !CategoryId) {
        return res.json({ status: 'error', message: '請填入資訊' })
      }
      const newSubcategory = await Subcategory.create({
        name,
        CategoryId,
        UserId: req.user.id
      })
      return res.json(newSubcategory)
    } catch (err) {
      return res.json(err)
    }
  },
  deleteSubcategory: async (req, res) => {
    try {
      const { id } = req.params
      const deleteSubcategory = await Subcategory.findOne({
        where: {
          id,
          UserId: req.user.id
        },
        include: [
          { model: Item, as: 'Items' }
        ]
      })
      if (!deleteSubcategory) {
        return res.json({ status: 'error', message: '找不到此項目類別' })
      }
      if (deleteSubcategory.Items.length) {
        return res.json({ status: "error", message: '項目數須為零才可刪除' })
      } else {
        await deleteSubcategory.destroy()
        return res.json({ status: "success" })
      }
    } catch (err) {
      return res.json(err)
    }
  },
  putSubcategory: async (req, res) => {
    try {
      const { id } = req.params
      const { name, CategoryId } = req.body
      const putSubcategory = await Subcategory.findOne({
        where: {
          id,
          UserId: req.user.id
        }
      })
      if (!putSubcategory) {
        return res.json({ status: 'error', message: '找不到此項目類別' })
      }
      if (!name || !CategoryId) {
        return res.json({ status: 'error', message: '請填入資訊' })
      }
      await putSubcategory.update({
        name,
        CategoryId
      })
      return res.json({ status: "success" })
    } catch (err) {
      return res.json(err)
    }
  },
  getCategories: async (req, res) => {
    try {
      const categories = await Category.findAll({
        where: {
          UserId: req.user.id
        },
        include: [
          Subcategory
        ]
      })
      return res.json(categories)
    } catch (err) {
      return res.json(err)
    }
  },
  addCategory: async (req, res) => {
    try {
      const { name } = req.body
      if (!name) {
        return res.json({ status: 'error', message: '請填入資訊' })
      }
      const newCategory = await Category.create({
        name,
        UserId: req.user.id
      })
      return res.json(newCategory)
    } catch (err) {
      return res.json(err)
    }
  },
  putCategory: async (req, res) => {
    try {
      const { id } = req.params
      const { name } = req.body
      const putCategory = await Category.findOne({
        where: {
          id,
          UserId: req.user.id
        },
        include: [
          Subcategory
        ]
      })
      if (!putCategory) {
        return res.json({ status: 'error', message: '找不到此運動類型' })
      }
      if (!name) {
        return res.json({ status: 'error', message: "請填入資訊" })
      }
      await putCategory.update({
        name
      })
      return res.json({ status: 'success', putCategory })
    } catch (err) {
      return res.json(err)
    }
  },
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params
      const deleteCategory = await Category.findOne({
        where: {
          id,
          UserId: req.user.id
        },
        include: [
          Subcategory
        ]
      })
      if (!deleteCategory) {
        return res.json({ status: 'error', message: '找不到此運動類型' })
      }
      if (deleteCategory.Subcategories.length) {
        return res.json({ status: 'error', message: '項目類別須為零才可刪除' })
      } else {
        await deleteCategory.destroy()
        return res.json({ status: 'success' })
      }
    } catch (err) {
      return res.json(err)
    }
  }
}

module.exports = settingController