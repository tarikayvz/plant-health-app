const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MoistureReading extends Model {
    static associate(models) {
      MoistureReading.belongsTo(models.Device, { foreignKey: "deviceId" });
    }
  }

  MoistureReading.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      deviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Devices", key: "id" },
      },
      moistureLevel: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      notificationSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "MoistureReading",
      indexes: [{ fields: ["deviceId", "timestamp"] }],
    }
  );

  return MoistureReading;
};