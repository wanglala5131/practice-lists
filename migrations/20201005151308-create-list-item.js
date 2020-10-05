'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ListItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ListId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      ItemId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      reps: {
        type: Sequelize.STRING
      },
      remark: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ListItems');
  }
};