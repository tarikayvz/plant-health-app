
const { PlantType } = require("./models") 
const { sequelize } = require("./models") 

const seedPlantTypes = async () => {
  await sequelize.sync()

  const plantTypes = [
    {
      name: "Fesleğen",
      scientificName: "Ocimum basilicum",
      idealMoisture: 60,
      wateringFrequency: 3,
      imageUrl: "https://example.com/feslegen.jpg",
      careInstructions: "Direkt güneş ışığı almayan bir yerde yetiştirin.",
    },
    {
      name: "Sukulent",
      scientificName: "Crassula ovata",
      idealMoisture: 30,
      wateringFrequency: 14,
      imageUrl: "https://example.com/sukulent.jpg",
      careInstructions: "Az sulayın, güneşli ortamları sever.",
    },
    {
      name: "Aloe Vera",
      scientificName: "Aloe barbadensis miller",
      idealMoisture: 40,
      wateringFrequency: 10,
      imageUrl: "https://example.com/aloe-vera.jpg",
      careInstructions: "İyi drene edilen topraklarda büyür.",
    },
  ]

  for (const type of plantTypes) {
    await PlantType.findOrCreate({ where: { name: type.name }, defaults: type })
  }

  console.log("🌱 Plant types seeded successfully.")
  process.exit()
}

seedPlantTypes().catch((err) => {
  console.error("Seed error:", err)
  process.exit(1)
})
