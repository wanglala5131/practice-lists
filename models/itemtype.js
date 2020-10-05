'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ItemType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  ItemType.init({
    userId: DataTypes.INTEGER,
    subcategoryId: DataTypes.INTEGER,
    itemId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ItemType',
  });
  return ItemType;
};