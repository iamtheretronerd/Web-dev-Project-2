import express from "express";
import MyMongoDB from "../db/myMongoDB.js";

const router = express.Router();

// Initialize MongoDB for users collection
const usersDB = MyMongoDB({
  dbName: "9thSeat",
  collectionName: "users",
});

// Signup route - POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, profileImage } = req.body;

    // Check if user already exists
    const existingUser = await usersDB.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user
    const newUser = {
      name,
      email,
      password,
      profileImage,
      createdAt: new Date(),
    };

    const result = await usersDB.insertDocument(newUser);

    res.json({
      success: true,
      message: "User created successfully",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
});

// Login route - POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await usersDB.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Remove password from response
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;

    res.json({
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to login",
      error: error.message,
    });
  }
});

// Update user profile - PUT /api/auth/update
router.put("/update", async (req, res) => {
  try {
    const { name, email, password, currentEmail, profileImage } = req.body;

    // Find user by current email
    const user = await usersDB.findOne({ email: currentEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if new email is already taken
    if (email !== currentEmail) {
      const emailExists = await usersDB.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    // Prepare update object
    const updateData = {
      name,
      email,
      profileImage,
      updatedAt: new Date(),
    };

    if (password) {
      updateData.password = password;
    }

    // Update user
    const result = await usersDB.updateDocument(
      { email: currentEmail },
      updateData,
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes were made",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
});

export default router;
