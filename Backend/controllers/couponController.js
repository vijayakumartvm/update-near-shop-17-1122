import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";

// Fields that an admin is allowed to create or update
const couponFields = [
    "code",
    "description",
    "couponType",
    "appliesTo",
    "minimumOrderAmount",
    "discountValue",
    "maximumDiscount",
    "ticketReward",
    "usageLimit",
    "perUserLimit",
    "validFrom",
    "validUntil",
    "isActive",
    "isAutoApply",
];

// ADMIN: Create a coupon
export const createCoupon = async(req, res) => {
    try {
        const {
            code,
            couponType,
            appliesTo,
            discountValue,
        } = req.body;

        if (!code || !couponType || !appliesTo) {
            return res.status(400).json({
                success: false,
                message: "Code, coupon type and applicability are required",
            });
        }

        if (
            ["percentage", "fixed"].includes(couponType) &&
            (discountValue === undefined || Number(discountValue) <= 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid discount value is required",
            });
        }

        const couponData = {};

        couponFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                couponData[field] = req.body[field];
            }
        });

        couponData.createdBy = req.user._id;

        const coupon = await Coupon.create(couponData);

        return res.status(201).json({
            success: true,
            message: "Coupon created successfully",
            coupon,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This coupon code already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ADMIN: Get all coupons
export const getAllCoupons = async(req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

        const filter = {};

        if (req.query.active === "true") {
            filter.isActive = true;
        } else if (req.query.active === "false") {
            filter.isActive = false;
        }

        const [coupons, total] = await Promise.all([
            Coupon.find(filter)
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit),

            Coupon.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            total,
            page,
            pages: Math.ceil(total / limit),
            coupons,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// CUSTOMER: Validate a coupon before checkout
export const validateCoupon = async(req, res) => {
    try {
        const code = String(req.body.code || "")
            .trim()
            .toUpperCase();

        const orderAmount = Number(req.body.orderAmount);
        const deliveryFee = Number(req.body.deliveryFee || 0);
        const appliesTo = req.body.appliesTo || "grocery_order";

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Please enter a coupon code",
            });
        }

        if (!Number.isFinite(orderAmount) ||
            orderAmount < 0 ||
            !Number.isFinite(deliveryFee) ||
            deliveryFee < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order amount or delivery fee",
            });
        }

        const coupon = await Coupon.findOne({
            code,
            isActive: true,
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Invalid or inactive coupon",
            });
        }

        const now = new Date();

        if (coupon.validFrom && now < new Date(coupon.validFrom)) {
            return res.status(400).json({
                success: false,
                message: "This coupon is not active yet",
            });
        }

        if (coupon.validUntil && now > new Date(coupon.validUntil)) {
            return res.status(400).json({
                success: false,
                message: "This coupon has expired",
            });
        }

        if (
            coupon.appliesTo !== "both" &&
            coupon.appliesTo !== appliesTo
        ) {
            return res.status(400).json({
                success: false,
                message: "This coupon cannot be used for this purchase",
            });
        }

        if (
            Number(coupon.usageLimit) > 0 &&
            coupon.usedCount >= coupon.usageLimit
        ) {
            return res.status(400).json({
                success: false,
                message: "This coupon usage limit has been reached",
            });
        }

        if (orderAmount < Number(coupon.minimumOrderAmount || 0)) {
            return res.status(400).json({
                success: false,
                message: `Minimum purchase amount is ₹${coupon.minimumOrderAmount}`,
            });
        }

        // Check how many non-cancelled orders this customer placed
        // using this coupon.
        if (Number(coupon.perUserLimit) > 0) {
            const customerUses = await Order.countDocuments({
                user: req.user._id,
                coupon: coupon._id,
                orderStatus: { $ne: "cancelled" },
            });

            if (customerUses >= coupon.perUserLimit) {
                return res.status(400).json({
                    success: false,
                    message: "You have already used this coupon the maximum number of times",
                });
            }
        }

        let discountAmount = 0;
        let freeDelivery = false;

        if (coupon.couponType === "percentage") {
            discountAmount =
                (orderAmount * Number(coupon.discountValue)) / 100;

            if (Number(coupon.maximumDiscount) > 0) {
                discountAmount = Math.min(
                    discountAmount,
                    Number(coupon.maximumDiscount)
                );
            }
        } else if (coupon.couponType === "fixed") {
            discountAmount = Number(coupon.discountValue);
        } else if (coupon.couponType === "free_delivery") {
            freeDelivery = true;
            discountAmount = deliveryFee;
        } else if (coupon.couponType === "movie_ticket") {
            return res.status(200).json({
                success: true,
                message: "Movie ticket reward coupon is valid",
                coupon: {
                    id: coupon._id,
                    code: coupon.code,
                    couponType: coupon.couponType,
                    ticketReward: coupon.ticketReward,
                },
            });
        }

        discountAmount = Math.max(
            0,
            Math.min(discountAmount, orderAmount + deliveryFee)
        );

        return res.status(200).json({
            success: true,
            message: "Coupon applied successfully",
            coupon: {
                id: coupon._id,
                code: coupon.code,
                couponType: coupon.couponType,
            },
            discountAmount,
            freeDelivery,
            payableAmount: Math.max(
                0,
                orderAmount + deliveryFee - discountAmount
            ),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ADMIN: Update a coupon
export const updateCoupon = async(req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found",
            });
        }

        couponFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                coupon[field] = req.body[field];
            }
        });

        await coupon.save();

        return res.status(200).json({
            success: true,
            message: "Coupon updated successfully",
            coupon,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This coupon code already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ADMIN: Deactivate a coupon instead of deleting it
export const deactivateCoupon = async(req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(
            req.params.id, { isActive: false }, { new: true }
        );

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Coupon deactivated successfully",
            coupon,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};