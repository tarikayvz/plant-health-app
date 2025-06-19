'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Plants', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      deviceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Devices', key: 'id' },
        onDelete: 'CASCADE',
      },
      plantTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'PlantTypes', key: 'id' },
        onDelete: 'RESTRICT',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      plantedDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      lastWatered: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      currentMoisture: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      currentHealth: {
        type: Sequelize.ENUM('healthy', 'diseased', 'dry', 'yellow'),
        defaultValue: 'healthy',
      },
      imageUrl: {
        type: Sequelize.STRING,
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
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Plants');
  }
};