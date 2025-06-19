const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PlantType extends Model {
    static associate(models) {
      PlantType.hasMany(models.Plant, { foreignKey: "plantTypeId" });
    }
  }

  PlantType.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      scientificName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      careInstructions: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      idealMoisture: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      idealLight: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      idealTemperature: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wateringFrequency: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "PlantType",
    }
  );

  return PlantType;
};