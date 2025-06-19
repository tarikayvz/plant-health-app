const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class HealthHistory extends Model {
    static associate(models) {
      HealthHistory.belongsTo(models.Plant, { foreignKey: "plantId" });
    }
  }

  HealthHistory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      plantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Plants", key: "id" },
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      healthStatus: {
        type: DataTypes.ENUM("healthy", "diseased", "dry", "yellow", "unknown"),
        allowNull: false,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      confidence: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      notificationSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "HealthHistory",
      indexes: [{ fields: ["plantId", "timestamp"] }],
    }
  );

  return HealthHistory;
};