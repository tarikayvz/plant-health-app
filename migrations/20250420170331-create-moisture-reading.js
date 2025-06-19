'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MoistureReadings', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      deviceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Devices', key: 'id' },
        onDelete: 'CASCADE',
      },
      moistureLevel: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      notificationSent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
      indexes: [{ fields: ['deviceId', 'timestamp'] }],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MoistureReadings');
  }
};