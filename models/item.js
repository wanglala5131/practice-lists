'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Item.belongsTo(models.User)
      Item.belongsTo(models.Category)
      Item.belongsToMany(models.Subcategory, {
        through: models.ItemType,
        foreignKey: 'ItemId',
        as: 'Subcategories',
      })
      Item.belongsToMany(models.List, {
        through: models.ListItem,
        foreignKey: 'ItemId',
        as: 'Lists',
      })
    }
  }
  Item.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      image: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      categoryId: DataTypes.INTEGER,
      limit: DataTypes.STRING,
      isClosed: DataTypes.BOOLEAN,
      isLiked: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Item',
    }
  )
  return Item
}
