import jwt from "jsonwebtoken"
import User from "../models/User.js"

// Protect Routes
export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select("-password")
      next()
    } catch (error) {
      res.status(401).json({ message: "Not authorized, invalid token" })
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" })
  }
}

// Admin Role Middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    res.status(403).json({ message: "Access denied. Admins only." })
  }
}

// Agent Role Middleware
export const agentOnly = (req, res, next) => {
  if (req.user && (req.user.role === "agent" || req.user.role === "admin")) {
    next()
  } else {
    res.status(403).json({ message: "Access denied. Agents and admins only." })
  }
}

// Role-based access middleware
export const hasRole = (roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next()
    } else {
      res.status(403).json({ message: `Access denied. Required roles: ${roles.join(", ")}` })
    }
  }
}
