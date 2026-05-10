import express from "express";
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    updateOrderDetails
} from "../controllers/orderController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only customers can place orders
router.post("/", protect, authorizeRoles("customer"), createOrder);

// View orders — any authenticated user
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);

// Update order details (items, address) — customers only
router.patch("/:id", protect, authorizeRoles("customer"), updateOrderDetails);

// Update order STATUS — any authenticated user (restaurant dashboard uses this)
router.put("/status/:id", protect, updateOrderStatus);

// Cancel order — customers only
router.delete("/:id", protect, authorizeRoles("customer"), cancelOrder);

export default router;
