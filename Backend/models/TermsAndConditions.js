import mongoose from "mongoose";

const termsAndConditionsSchema = new mongoose.Schema({
    // Policy title
    title: {
        type: String,
        required: true,
        trim: true,
    },

    // Who must follow this policy
    audience: {
        type: String,
        enum: ["customer", "seller", "admin", "all"],
        required: true,
    },

    // Policy category
    policyType: {
        type: String,
        enum: [
            "general_terms",
            "privacy_policy",
            "return_policy",
            "cancellation_policy",
            "seller_policy",
            "coupon_policy",
            "movie_booking_policy",
            "movie_refund_policy",
            "wallet_policy",
        ],
        required: true,
    },

    // Full policy content
    content: {
        type: String,
        required: true,
    },

    // Policy version
    version: {
        type: Number,
        required: true,
        min: 1,
    },

    // Policy publishing status
    status: {
        type: String,
        enum: ["draft", "published", "archived"],
        default: "draft",
    },

    effectiveFrom: {
        type: Date,
        required: true,
    },

    effectiveUntil: {
        type: Date,
        default: null,
    },

    publishedAt: {
        type: Date,
        default: null,
    },

    // Require users to accept updated terms
    requiresReacceptance: {
        type: Boolean,
        default: true,
    },

    // Admin who created this policy
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    // Admin who last updated it
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
}, {
    timestamps: true,
});

// Do not allow duplicate versions of the same policy
termsAndConditionsSchema.index({
    audience: 1,
    policyType: 1,
    version: 1,
}, {
    unique: true,
});

termsAndConditionsSchema.index({
    audience: 1,
    status: 1,
    effectiveFrom: 1,
});

const TermsAndConditions = mongoose.model(
    "TermsAndConditions",
    termsAndConditionsSchema
);

export default TermsAndConditions;