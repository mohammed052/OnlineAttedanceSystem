// middleware/authMiddleware.js
const jwt = require('jsonwebtoken')
const User = require('../models/userModel') // Adjust path if needed

const protectRole = (...allowedRoles) => {
  return async (req, res, next) => {
    let token

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        // Get token from header
        token = req.headers.authorization.split(' ')[1]

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Fetch user from DB (excluding password)
        const user = await User.findById(decoded.id).select('-password')

        if (!user) {
          return res.status(401).json({ message: 'User not found' })
        }

        // Check if user's role is allowed
        if (!allowedRoles.includes(user.role)) {
          return res.status(403).json({ message: 'Access denied' })
        }

        req.user = user
        next()
      } catch (error) {
        console.error(error)
        return res.status(401).json({ message: 'Not authorized, token failed' })
      }
    } else {
      return res.status(401).json({ message: 'No token provided' })
    }
  }
}

module.exports = { protectRole }
