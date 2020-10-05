'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class List extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      List.belongsTo(models.User)
      List.belongsToMany(models.Item, {
        through: models.ListItem,
        foreignKey: 'ListId',
        as: 'Items'
      })
    }
  };
  List.init({
    userId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    isUsed: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'List',
  });
  return List;
};