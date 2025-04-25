import express from "express"
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  assignRole,
  getUserStats,
  changeUserStatus,
  bulkAssignRoles,
} from "../controllers/userController.js"
// import { protect, adminOnly } from "../middleware/authMiddleware.js"

const router = express.Router()

// Admin only routes
router.get("/",  getUsers)
router.get("/stats",  getUserStats)
router.post("/assign-role", assignRole)
router.post("/bulk-assign-roles", protect, adminOnly, bulkAssignRoles)

// Routes for specific users
router.get("/:id", protect, getUserById)
router.put("/:id", protect, updateUser)
router.delete("/:id", protect, adminOnly, deleteUser)
router.patch("/:id/status", protect, adminOnly, changeUserStatus)

export default router
