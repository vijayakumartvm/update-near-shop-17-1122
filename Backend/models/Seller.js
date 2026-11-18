import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
    // Link seller profile to the User account
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },

    // Shop information
    storeName: {
        type: String,
        required: true,
        trim: true,
    },

    storeDescription: {
        type: String,
        default: "",
        trim: true,
    },

    storeCategory: {
        type: String,
        default: "Grocery",
    },

    // Contact information
    contactPhone: {
        type: String,
        required: true,
        trim: true,
    },

    supportEmail: {
        type: String,
        lowercase: true,
        trim: true,
        default: "",
    },

    // Store images
    storeLogo: {
        type: String,
        default: "",
    },

    storeBanner: {
        type: String,
        default: "",
    },

    // Store address
    address: {
        street: { type: String, default: "" },
        city: { type: String, default: "" },
        district: { type: String, default: "" },
        state: { type: String, default: "" },
        pincode: { type: String, default: "" },
        country: { type: String, default: "India" },
    },

    // Business information
    businessType: {
        type: String,
        enum: ["individual", "partnership", "company", "other"],
        default: "individual",
    },

    gstNumber: {
        type: String,
        default: "",
        trim: true,
        uppercase: true,
    },

    // Admin approval
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "suspended"],
        default: "pending",
    },

    rejectionReason: {
        type: String,
        default: "",
    },

    approvedAt: {
        type: Date,
        default: null,
    },

    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },

    // Store availability
    isStoreOpen: {
        type: Boolean,
        default: true,
    },

    // Store rating
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        count: {
            type: Number,
            default: 0,
        },
    },
}, {
    timestamps: true,
});

const Seller = mongoose.model("Seller", sellerSchema);

export default Seller;