'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WateringHistories', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      plantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Plants', key: 'id' },
        onDelete: 'CASCADE',
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      moistureBefore: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      moistureAfter: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      method: {
        type: Sequelize.ENUM('automatic', 'manual'),
        allowNull: false,
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    }, {
      indexes: [{ fields: ['plantId', 'timestamp'] }],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('WateringHistories');
  }
};