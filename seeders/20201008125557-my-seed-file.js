'use strict';
const bcrypt = require('bcryptjs')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [
      {
        id: 1,
        name: 'user1',
        email: 'user1@example.com',
        password: bcrypt.hashSync('user1', bcrypt.genSaltSync(10)),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'user2',
        email: 'user2@example.com',
        password: bcrypt.hashSync('user2', bcrypt.genSaltSync(10)),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {})
    await queryInterface.bulkInsert('Categories', [
      {
        id: 1,
        name: '體能',
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: '排球',
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: '肌力',
        userId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        name: '游泳',
        userId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {})
    await queryInterface.bulkInsert('Subcategories', [
      {
        id: 1,
        name: '大腿',
        userId: 1,
        CategoryId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: '托球',
        userId: 1,
        CategoryId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: '低手',
        userId: 1,
        CategoryId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        name: '跑動',
        userId: 1,
        CategoryId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        name: '肌力',
        userId: 1,
        CategoryId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {})
    await queryInterface.bulkInsert('Items', [
      {
        id: 1,
        name: '小狗追球',
        description: '帶練者滾球，球員去追球將球撿回來，如果要累一點，可以要求球員回程時也用跑的，節奏快一點',
        image: '',
        UserId: 1,
        CategoryId: 1,
        limit: '需要一個比較長的場地',
        isClosed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: '八字墊球',
        description: '同一組的球員分成兩邊(A邊,B邊)，A邊拋球給B邊，B邊接回給A邊並跑到A邊最後面，第二球A邊一樣接回給B邊並跑到B邊最後面，以此類推。這個項目建議不要太多人，不然效果不大，也建議學姊和學妹分在同一組，不然學妹自己一組很可憐QQ',
        image: '',
        UserId: 1,
        CategoryId: 2,
        limit: '一組至少要3個人，但也別一組太多人',
        isClosed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {})
    await queryInterface.bulkInsert('itemtypes', [
      {
        itemId: 1,
        subcategoryId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        itemId: 1,
        subcategoryId: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        itemId: 2,
        subcategoryId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        itemId: 2,
        subcategoryId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        itemId: 2,
        subcategoryId: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {})
    await queryInterface.bulkDelete('Categories', null, {})
    await queryInterface.bulkDelete('Subcategories', null, {})
    await queryInterface.bulkDelete('items', null, {})
    await queryInterface.bulkDelete('itemtypes', null, {})
  }
};
