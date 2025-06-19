const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, { foreignKey: "userId" });
    }
  }

  Notification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("moisture", "health", "system", "other"),
        allowNull: false,
      },
      relatedEntityType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      relatedEntityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      actionRequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      actionType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      actionCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Notification",
      indexes: [{ fields: ["userId", "timestamp"] }, { fields: ["userId", "read"] }],
    }
  );

  return Notification;
};