import User from "../models/User.js"
import { sendEmail } from "../config/emailService.js"

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password")
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update user
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, profilePicture, isActive } = req.body

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Only admins can change roles
    if (role && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can change user roles" })
    }

    // Update user fields
    if (name) user.name = name
    if (email) user.email = email
    if (role) user.role = role
    if (profilePicture) user.profilePicture = profilePicture
    if (isActive !== undefined) user.isActive = isActive

    const updatedUser = await user.save()

    // If role was changed, send notification email
    if (role && role !== user.role) {
      await sendEmail(user.email, "Your Role Has Been Updated", "role-update", {
        name: user.name,
        role: role,
        updatedBy: req.user.name,
      })
    }

    res.status(200).json({
      message: "User updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
        isActive: updatedUser.isActive,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Prevent deleting the last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" })
      if (adminCount <= 1) {
        return res.status(400).json({ message: "Cannot delete the last admin user" })
      }
    }

    await user.deleteOne()

    res.status(200).json({ message: "User deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Assign role to user
export const assignRole = async (req, res) => {
  try {
    const { userId, role } = req.body

    if (!userId || !role) {
      return res.status(400).json({ message: "User ID and role are required" })
    }

    // Validate role
    const validRoles = ["user", "admin", "agent"]
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(", ")}` })
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Prevent changing the last admin
    if (user.role === "admin" && role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" })
      if (adminCount <= 1) {
        return res.status(400).json({ message: "Cannot change role of the last admin user" })
      }
    }

    user.role = role
    await user.save()

    // Send notification email
    await sendEmail(user.email, "Your Role Has Been Updated", "role-update", {
      name: user.name,
      role: role,
      updatedBy: req.user.name,
    })

    res.status(200).json({
      message: "User role updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get user stats
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const adminCount = await User.countDocuments({ role: "admin" })
    const agentCount = await User.countDocuments({ role: "agent" })
    const regularUserCount = await User.countDocuments({ role: "user" })
    const activeUsers = await User.countDocuments({ isActive: true })
    const inactiveUsers = await User.countDocuments({ isActive: false })

    res.status(200).json({
      totalUsers,
      byRole: {
        admin: adminCount,
        agent: agentCount,
        user: regularUserCount,
      },
      activeUsers,
      inactiveUsers,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Change user status (active/inactive)
export const changeUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body

    if (isActive === undefined) {
      return res.status(400).json({ message: "Status (isActive) is required" })
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Prevent deactivating the last admin
    if (user.role === "admin" && !isActive) {
      const activeAdminCount = await User.countDocuments({ role: "admin", isActive: true })
      if (activeAdminCount <= 1) {
        return res.status(400).json({ message: "Cannot deactivate the last active admin user" })
      }
    }

    user.isActive = isActive
    await user.save()

    res.status(200).json({
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Bulk assign roles
export const bulkAssignRoles = async (req, res) => {
  try {
    const { users } = req.body

    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: "Users array is required" })
    }

    const validRoles = ["user", "admin", "agent"]
    const results = []
    const errors = []

    for (const userUpdate of users) {
      const { userId, role } = userUpdate

      if (!userId || !role) {
        errors.push({ userId, error: "User ID and role are required" })
        continue
      }

      if (!validRoles.includes(role)) {
        errors.push({ userId, error: `Invalid role. Must be one of: ${validRoles.join(", ")}` })
        continue
      }

      try {
        const user = await User.findById(userId)

        if (!user) {
          errors.push({ userId, error: "User not found" })
          continue
        }

        // Prevent changing the last admin
        if (user.role === "admin" && role !== "admin") {
          const adminCount = await User.countDocuments({ role: "admin" })
          if (adminCount <= 1) {
            errors.push({ userId, error: "Cannot change role of the last admin user" })
            continue
          }
        }

        user.role = role
        await user.save()

        results.push({
          userId,
          name: user.name,
          email: user.email,
          role: user.role,
          success: true,
        })

        // Send notification email
        await sendEmail(user.email, "Your Role Has Been Updated", "role-update", {
          name: user.name,
          role: role,
          updatedBy: req.user.name,
        })
      } catch (error) {
        errors.push({ userId, error: error.message })
      }
    }

    res.status(200).json({
      message: "Bulk role assignment completed",
      results,
      errors,
      success: results.length,
      failed: errors.length,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
