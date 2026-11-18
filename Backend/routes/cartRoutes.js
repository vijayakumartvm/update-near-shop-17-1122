import express from "express";

import {
    getCart,
    addToCart,
    updateCartItem,
    updateCartSelection,
    removeCartItem,
    clearCart,
} from "../controllers/cartController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// All cart routes require a logged-in customer
router.use(protect, authorize("customer"));

// Get customer cart
router.get("/", getCart);

// Add product
router.post("/items", addToCart);

// Update quantity
router.patch("/items/:itemId", updateCartItem);

// Select or deselect product
router.patch(
    "/items/:itemId/selection",
    updateCartSelection
);

// Remove product
router.delete("/items/:itemId", removeCartItem);

// Clear entire cart
router.delete("/", clearCart);

export default router;