'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class ListItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ListItem.init(
    {
      listId: DataTypes.INTEGER,
      itemId: DataTypes.INTEGER,
      reps: DataTypes.STRING,
      remark: DataTypes.STRING,
      sort: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'ListItem',
    }
  )
  return ListItem
}
