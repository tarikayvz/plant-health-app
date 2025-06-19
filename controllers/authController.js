const { User } = require("../models")
const jwt = require("jsonwebtoken")
const { sendEmail } = require("../utils/email")
const crypto = require("crypto")
const { Op } = require("sequelize")

// JWT yapılandırması için çevre değişkenlerini kullan
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" })
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    })

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

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    next(error)
  }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password)
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

    res.status(200).json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
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
