'use strict';
const {
  Model
} = require('sequelize');
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
  };
  ListItem.init({
    userId: DataTypes.INTEGER,
    listId: DataTypes.INTEGER,
    itemId: DataTypes.INTEGER,
    reps: DataTypes.STRING,
    remark: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ListItem',
  });
  return ListItem;
};