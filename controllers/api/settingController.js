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
      const { id: SubcategoryId } = req.params
      const deleteSubcategory = await Subcategory.findByPk(SubcategoryId, {
        include: [
          { model: Item, as: 'Items' }
        ]
      })
      if (deleteSubcategory.Items.length === 0) {
        deleteSubcategory.destroy()
        return res.json({ status: "success" })
      } else {
        return res.json({ status: "error", message: '項目數須為零才可刪除' })
      }
    } catch (err) {
      return res.json(err)
    }
  },
  putSubcategory: async (req, res) => {
    try {
      const { id } = req.params
      const { subcategoryName: name, CategoryId } = req.body
      const putSubcategory = await Subcategory.findByPk(id)
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
  }
}

module.exports = settingController