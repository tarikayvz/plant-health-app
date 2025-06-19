const { User, sequelize } = require("../models")
const jwt = require("jsonwebtoken")
const { sendEmail } = require("../utils/email")
const crypto = require("crypto")
const { Op } = require("sequelize")

// JWT yapılandırması için çevre değişkenlerini kullan
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN

// Debug endpoint
exports.debug = async (req, res, next) => {
  try {
    console.log("=== DEBUG INFO ===")
    console.log("NODE_ENV:", process.env.NODE_ENV)
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL)
    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET)

    // Model kontrolü
    console.log("User model exists:", !!User)
    console.log("User model name:", User?.name)
    console.log("User table name:", User?.tableName)

    // Available models
    const models = require("../models")
    console.log("Available models:", Object.keys(models))

    // Raw SQL test - Available tables
    try {
      const [results] = await sequelize.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
      )
      console.log(
        "Available tables:",
        results.map((r) => r.table_name),
      )
    } catch (sqlError) {
      console.log("SQL Error:", sqlError.message)
    }

    // User table test
    try {
      const userCount = await User.count()
      console.log("User count:", userCount)
    } catch (userError) {
      console.log("User model error:", userError.message)
    }

    // Raw SQL User test
    try {
      const [rawUsers] = await sequelize.query('SELECT COUNT(*) as count FROM "Users"')
      console.log("Raw SQL User count:", rawUsers[0].count)
    } catch (rawError) {
      console.log("Raw SQL Error:", rawError.message)
    }

    res.json({
      nodeEnv: process.env.NODE_ENV,
      databaseUrlExists: !!process.env.DATABASE_URL,
      jwtSecretExists: !!process.env.JWT_SECRET,
      userModelExists: !!User,
      userModelName: User?.name,
      userTableName: User?.tableName,
      availableModels: Object.keys(models),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Debug error:", error)
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
}

exports.register = async (req, res, next) => {
  try {
    console.log("=== REGISTER REQUEST START ===")
    console.log("Request body:", req.body)
    console.log("User model exists:", !!User)
    console.log("NODE_ENV:", process.env.NODE_ENV)

    const { name, email, password } = req.body

    console.log("Checking if user exists with email:", email)

    // Check if user already exists - Önce raw SQL ile test edelim
    try {
      const [existingUsersRaw] = await sequelize.query('SELECT * FROM "Users" WHERE email = $1', {
        bind: [email],
        type: sequelize.QueryTypes.SELECT,
      })

      console.log("Raw SQL existing users:", existingUsersRaw)

      if (existingUsersRaw.length > 0) {
        console.log("User already exists (raw SQL)")
        return res.status(400).json({ message: "Email already in use" })
      }
    } catch (rawError) {
      console.error("Raw SQL error:", rawError)
      // Raw SQL başarısız olursa Sequelize ile dene

      try {
        const existingUser = await User.findOne({ where: { email } })
        console.log("Sequelize existing user:", existingUser)

        if (existingUser) {
          console.log("User already exists (Sequelize)")
          return res.status(400).json({ message: "Email already in use" })
        }
      } catch (sequelizeError) {
        console.error("Sequelize findOne error:", sequelizeError)
        throw sequelizeError
      }
    }

    console.log("User does not exist, creating new user...")

    // Create new user - Önce raw SQL ile dene
    try {
      const bcrypt = require("bcrypt")
      const hashedPassword = await bcrypt.hash(password, 10)

      const [newUserRaw] = await sequelize.query(
        `INSERT INTO "Users" (name, email, password, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, NOW(), NOW()) 
         RETURNING id, name, email, "createdAt", "updatedAt"`,
        {
          bind: [name, email, hashedPassword],
          type: sequelize.QueryTypes.INSERT,
        },
      )

      console.log("User created successfully (raw SQL):", newUserRaw)

      // Generate JWT token
      const token = jwt.sign({ id: newUserRaw[0].id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      })

      const userWithoutPassword = {
        id: newUserRaw[0].id,
        name: newUserRaw[0].name,
        email: newUserRaw[0].email,
        createdAt: newUserRaw[0].createdAt,
        updatedAt: newUserRaw[0].updatedAt,
      }

      console.log("Registration successful (raw SQL)")

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: userWithoutPassword,
      })
    } catch (rawCreateError) {
      console.error("Raw SQL create error:", rawCreateError)

      // Raw SQL başarısız olursa Sequelize ile dene
      try {
        console.log("Trying with Sequelize...")

        const user = await User.create({
          name,
          email,
          password,
        })

        console.log("User created successfully (Sequelize):", user.toJSON())

        // Generate JWT token
        const token = jwt.sign({ id: user.id }, JWT_SECRET, {
          expiresIn: JWT_EXPIRES_IN,
        })

        const userWithoutPassword = {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }

        console.log("Registration successful (Sequelize)")

        res.status(201).json({
          message: "User registered successfully",
          token,
          user: userWithoutPassword,
        })
      } catch (sequelizeCreateError) {
        console.error("Sequelize create error:", sequelizeCreateError)
        throw sequelizeCreateError
      }
    }
  } catch (error) {
    console.error("Register error:", error)
    console.error("Error stack:", error.stack)

    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
}

exports.login = async (req, res, next) => {
  try {
    console.log("=== LOGIN REQUEST START ===")
    console.log("Request body:", { email: req.body.email, passwordLength: req.body.password?.length })

    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ where: { email } })
    console.log("User found:", !!user)

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password)
    console.log("Password valid:", isPasswordValid)

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    })

    // Remove password from response
    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    console.log("Login successful")

    res.status(200).json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    next(error)
  }
}

exports.refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ message: "Token is required" })
    }

    // Verify token
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired token" })
      }

      // Check if user exists
      const user = await User.findByPk(decoded.id)
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Generate new token
      const newToken = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      })

      res.status(200).json({
        message: "Token refreshed successfully",
        token: newToken,
      })
    })
  } catch (error) {
    next(error)
  }
}

exports.logout = async (req, res, next) => {
  try {
    // In a stateless JWT authentication system, the client is responsible for discarding the token
    // Here we just send a success response
    res.status(200).json({ message: "Logout successful" })
  } catch (error) {
    next(error)
  }
}

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body

    // Find user by email
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = Date.now() + 3600000 // 1 hour

    // Update user with reset token
    await user.update({
      resetToken,
      resetTokenExpiry,
    })

    // Send email with reset token
    const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`
    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      message: `You requested a password reset. Please click on the link to reset your password: ${resetUrl}`,
    })

    res.status(200).json({ message: "Password reset email sent" })
  } catch (error) {
    next(error)
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body

    // Find user by reset token
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: Date.now() },
      },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" })
    }

    // Update password and clear reset token
    user.password = password
    user.resetToken = null
    user.resetTokenExpiry = null
    await user.save()

    res.status(200).json({ message: "Password reset successful" })
  } catch (error) {
    next(error)
  }
}

exports.updateFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body
    const userId = req.user.id

    // Update user's FCM token
    await User.update({ fcmToken }, { where: { id: userId } })

    res.status(200).json({ message: "FCM token updated successfully" })
  } catch (error) {
    next(error)
  }
}
