'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PlantTypes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      scientificName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      careInstructions: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      idealMoisture: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      idealLight: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      idealTemperature: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      wateringFrequency: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      imageUrl: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('PlantTypes');
  }
};