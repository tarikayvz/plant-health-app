const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Plant extends Model {
    static associate(models) {
      Plant.belongsTo(models.User, { foreignKey: "userId" });
      Plant.belongsTo(models.Device, { foreignKey: "deviceId" });
      Plant.belongsTo(models.PlantType, { foreignKey: "plantTypeId" });
      Plant.hasMany(models.WateringHistory, { foreignKey: "plantId" });
      Plant.hasMany(models.HealthHistory, { foreignKey: "plantId" });
    }
  }

  Plant.init(
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
      deviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Devices", key: "id" },
      },
      plantTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "PlantTypes", key: "id" },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      plantedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      lastWatered: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      currentMoisture: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      currentHealth: {
        type: DataTypes.ENUM("healthy", "diseased", "dry", "yellow"),
        defaultValue: "healthy",
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Plant",
    }
  );

  return Plant;
};