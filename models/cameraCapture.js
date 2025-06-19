const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CameraCapture extends Model {
    static associate(models) {
      CameraCapture.belongsTo(models.Device, { foreignKey: "deviceId" });
    }
  }

  CameraCapture.init(
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
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      healthStatus: {
        type: DataTypes.ENUM("healthy", "diseased", "dry", "yellow", "unknown"),
        allowNull: true,
      },
      confidence: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      processed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "CameraCapture",
      indexes: [{ fields: ["deviceId", "timestamp"] }],
    }
  );

  return CameraCapture;
};