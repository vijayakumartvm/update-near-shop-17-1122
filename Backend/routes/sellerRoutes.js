import express from "express";

import {
    createSellerProfile,
    getMySellerProfile,
    getAllSellers,
    updateSellerStatus,
} from "../controllers/sellerController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Seller creates or updates their store profile
router.post(
    "/profile",
    protect,
    authorize("seller"),
    createSellerProfile
);

// Seller views their own store profile
router.get(
    "/profile",
    protect,
    authorize("seller"),
    getMySellerProfile
);

// Admin views all sellers
router.get(
    "/",
    protect,
    authorize("admin"),
    getAllSellers
);

// Admin approves, rejects or suspends a seller
router.patch(
    "/:id/status",
    protect,
    authorize("admin"),
    updateSellerStatus
);

export default router;