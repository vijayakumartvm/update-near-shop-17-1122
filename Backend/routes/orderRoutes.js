import express from "express";

import {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
} from "../controllers/orderController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer authentication required
router.use(protect, authorize("customer"));

// Place order
router.post("/", createOrder);

// Get customer orders
router.get("/my-orders", getMyOrders);

// Get one order
router.get("/:id", getOrderById);

// Cancel order
router.patch("/:id/cancel", cancelOrder);

export default router;