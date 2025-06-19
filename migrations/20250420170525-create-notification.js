'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
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
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('moisture', 'health', 'system', 'other'),
        allowNull: false,
      },
      relatedEntityType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      relatedEntityId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      actionRequired: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      actionType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      actionCompleted: {
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
      indexes: [
        { fields: ['userId', 'timestamp'] },
        { fields: ['userId', 'read'] },
      ],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Notifications');
  }
};