// const jwt = require("jsonwebtoken")
// const { User } = require("../models")

// const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// exports.authenticate = async (req, res, next) => {
//   try {
//     // Get token from header
//     const authHeader = req.headers.authorization
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Authentication required. No token provided." })
//     }

//     // Extract token
//     const token = authHeader.split(" ")[1]

//     // Verify token
//     jwt.verify(token, JWT_SECRET, async (err, decoded) => {
//       if (err) {
//         return res.status(401).json({ message: "Invalid or expired token" })
//       }

//       // Check if user exists
//       const user = await User.findByPk(decoded.id)
//       if (!user) {
//         return res.status(401).json({ message: "User not found" })
//       }

//       // Attach user to request
//       req.user = user
//       next()
//     })
//   } catch (error) {
//     next(error)
//   }
// }

// exports.authorize = (roles = []) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ message: "Authentication required" })
//     }

//     if (roles.length && !roles.includes(req.user.role)) {
//       return res.status(403).json({ message: "Forbidden: Insufficient permissions" })
//     }

//     next()
//   }
// }
