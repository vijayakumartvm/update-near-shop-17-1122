import mongoose from "mongoose";

const refundRequestSchema = new mongoose.Schema({
    // Customer requesting the refund
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    // Refund source
    refundType: {
        type: String,
        enum: ["grocery_order", "movie_booking"],
        required: true,
    },

    // Related grocery order
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        default: null,
    },

    // Related movie booking
    movieBooking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MovieBooking",
        default: null,
    },

    // Unique refund reference
    refundReference: {
        type: String,
        required: true,
        unique: true,
        default: () =>
            `NSREF-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    },

    // Customer's refund reason
    reason: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
    },

    // Amount requested by customer
    requestedAmount: {
        type: Number,
        required: true,
        min: 0.01,
    },

    // Amount approved after eligibility verification
    approvedAmount: {
        type: Number,
        default: 0,
        min: 0,
    },

    // Refund destination
    refundMethod: {
        type: String,
        enum: [
            "original_payment",
            "nearshop_wallet",
        ],
        default: "original_payment",
    },

    // Refund processing status
    status: {
        type: String,
        enum: [
            "requested",
            "under_review",
            "approved",
            "rejected",
            "processing",
            "completed",
            "failed",
        ],
        default: "requested",
    },

    // Eligibility verification
    eligibility: {
        checked: {
            type: Boolean,
            default: false,
        },

        eligible: {
            type: Boolean,
            default: false,
        },

        policyDetails: {
            type: String,
            default: "",
        },

        checkedAt: {
            type: Date,
            default: null,
        },
    },

    // Admin review
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },

    reviewedAt: {
        type: Date,
        default: null,
    },

    rejectionReason: {
        type: String,
        default: "",
    },

    // Payment gateway refund details
    externalRefundId: {
        type: String,
        default: "",
    },

    transactionReference: {
        type: String,
        default: "",
    },

    completedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

// Customer refund history
refundRequestSchema.index({
    user: 1,
    createdAt: -1,
});

// Admin refund management
refundRequestSchema.index({
    status: 1,
    createdAt: -1,
});

// Related order and booking searches
refundRequestSchema.index({ order: 1 });
refundRequestSchema.index({ movieBooking: 1 });

const RefundRequest = mongoose.model(
    "RefundRequest",
    refundRequestSchema
);

export default RefundRequest;