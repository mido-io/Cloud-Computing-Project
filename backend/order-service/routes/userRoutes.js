import express from "express";
import { registerUser, loginUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/userModel.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login",    loginUser);

// GET user name by ID — used by frontend to resolve customer names in orders
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name email role");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
