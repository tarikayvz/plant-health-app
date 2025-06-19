const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class WateringHistory extends Model {
    static associate(models) {
      WateringHistory.belongsTo(models.Plant, { foreignKey: "plantId" });
    }
  }

  WateringHistory.init(
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
      moistureBefore: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      moistureAfter: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      method: {
        type: DataTypes.ENUM("automatic", "manual"),
        allowNull: false,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "WateringHistory",
      indexes: [{ fields: ["plantId", "timestamp"] }],
    }
  );

  return WateringHistory;
};