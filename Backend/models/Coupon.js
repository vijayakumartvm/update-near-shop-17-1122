import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    // Coupon code
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },

    description: {
        type: String,
        default: "",
        trim: true,
    },

    // Coupon purpose
    couponType: {
        type: String,
        enum: [
            "percentage",
            "fixed",
            "free_delivery",
            "movie_ticket",
        ],
        required: true,
    },

    // Where the coupon can be used
    appliesTo: {
        type: String,
        enum: [
            "grocery_order",
            "movie_booking",
            "both",
        ],
        default: "grocery_order",
    },

    // Minimum grocery purchase requirement
    minimumOrderAmount: {
        type: Number,
        default: 0,
        min: 0,
    },

    // Discount amount or percentage
    discountValue: {
        type: Number,
        default: 0,
        min: 0,
    },

    // Maximum percentage discount
    maximumDiscount: {
        type: Number,
        default: null,
        min: 0,
    },

    // Movie ticket reward details
    ticketReward: {
        ticketCount: {
            type: Number,
            default: 1,
            min: 1,
        },

        maximumTicketValue: {
            type: Number,
            default: 0,
            min: 0,
        },
    },

    // Overall usage limits
    usageLimit: {
        type: Number,
        default: null,
        min: 1,
    },

    usedCount: {
        type: Number,
        default: 0,
        min: 0,
    },

    perUserLimit: {
        type: Number,
        default: 1,
        min: 1,
    },

    // Coupon validity
    validFrom: {
        type: Date,
        required: true,
    },

    validUntil: {
        type: Date,
        required: true,
    },

    // Coupon status
    isActive: {
        type: Boolean,
        default: true,
    },

    // Automatic coupon application
    isAutoApply: {
        type: Boolean,
        default: false,
    },

    // Admin who created the coupon
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
}, {
    timestamps: true,
});

// Normalize coupon codes
couponSchema.pre("validate", function() {
    if (this.code) {
        this.code = this.code.trim().toUpperCase();
    }

    if (
        this.validFrom &&
        this.validUntil &&
        this.validUntil <= this.validFrom
    ) {
        this.invalidate(
            "validUntil",
            "Coupon expiry must be after its start date"
        );
    }

    if (
        this.couponType === "movie_ticket" &&
        !["movie_booking", "both"].includes(this.appliesTo)
    ) {
        this.invalidate(
            "appliesTo",
            "Movie ticket coupons must apply to movie bookings"
        );
    }
});

// Database indexes

couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;