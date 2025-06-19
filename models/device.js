const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
    static associate(models) {
      Device.belongsTo(models.User, { foreignKey: "userId" });
      Device.hasMany(models.Plant, { foreignKey: "deviceId" });
      Device.hasMany(models.MoistureReading, { foreignKey: "deviceId" });
      Device.hasMany(models.CameraCapture, { foreignKey: "deviceId" });
    }
  }

  Device.init(
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deviceIdentifier: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      lastConnected: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      autoWatering: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      moistureThreshold: {
        type: DataTypes.INTEGER,
        defaultValue: 30,
      },
    },
    {
      sequelize,
      modelName: "Device",
    }
  );

  return Device;
};