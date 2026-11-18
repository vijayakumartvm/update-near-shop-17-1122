import mongoose from "mongoose";

const termsAcceptanceSchema = new mongoose.Schema({
    // User who accepted the terms
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    // Accepted Terms and Conditions document
    terms: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TermsAndConditions",
        required: true,
    },

    // Save the exact version accepted
    acceptedVersion: {
        type: Number,
        required: true,
        min: 1,
    },

    // Role of the user at acceptance
    userRole: {
        type: String,
        enum: ["customer", "seller", "admin"],
        required: true,
    },

    // Where acceptance happened
    acceptanceMethod: {
        type: String,
        enum: [
            "registration",
            "seller_onboarding",
            "checkout",
            "account_update",
        ],
        default: "registration",
    },

    // Acceptance timestamp
    acceptedAt: {
        type: Date,
        default: Date.now,
        immutable: true,
    },
}, {
    timestamps: true,
});

// Prevent duplicate acceptance records
// for the same user, policy and version.
termsAcceptanceSchema.index({
    user: 1,
    terms: 1,
    acceptedVersion: 1,
}, {
    unique: true,
});

termsAcceptanceSchema.index({
    user: 1,
    acceptedAt: -1,
});

const TermsAcceptance = mongoose.model(
    "TermsAcceptance",
    termsAcceptanceSchema
);

export default TermsAcceptance;