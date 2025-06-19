'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HealthHistories', {
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
      healthStatus: {
        type: Sequelize.ENUM('healthy', 'diseased', 'dry', 'yellow', 'unknown'),
        allowNull: false,
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      confidence: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      notificationSent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.dropTable('HealthHistories');
  }
};