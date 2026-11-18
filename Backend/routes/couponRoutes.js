import express from "express";

import {
    createCoupon,
    getAllCoupons,
    validateCoupon,
    updateCoupon,
    deactivateCoupon,
} from "../controllers/couponController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin: create a coupon
router.post(
    "/",
    protect,
    authorize("admin"),
    createCoupon
);

// Admin: view all coupons
router.get(
    "/",
    protect,
    authorize("admin"),
    getAllCoupons
);

// Customer: validate a coupon
router.post(
    "/validate",
    protect,
    authorize("customer"),
    validateCoupon
);

// Admin: update a coupon
router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateCoupon
);

// Admin: deactivate a coupon
router.patch(
    "/:id/deactivate",
    protect,
    authorize("admin"),
    deactivateCoupon
);

export default router;