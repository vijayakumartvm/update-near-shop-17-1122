import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    // Product information
    name: {
        type: String,
        required: true,
        trim: true,
    },

    slug: {
        type: String,
        trim: true,
        lowercase: true,
    },

    description: {
        type: String,
        default: "",
        trim: true,
    },

    brand: {
        type: String,
        default: "",
        trim: true,
    },

    // Seller who owns this product
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        required: true,
        index: true,
    },

    // Grocery category
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
        index: true,
    },

    // Pricing
    price: {
        type: Number,
        required: true,
        min: 0,
    },

    originalPrice: {
        type: Number,
        default: null,
        min: 0,
    },

    // Product images
    images: {
        type: [String],
        default: [],
    },

    // Inventory
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },

    unit: {
        type: String,
        default: "piece",
        trim: true,
    },

    sku: {
        type: String,
        trim: true,
        uppercase: true,
        default: "",
    },

    // Product approval
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "inactive"],
        default: "pending",
    },

    rejectionReason: {
        type: String,
        default: "",
    },

    isFeatured: {
        type: Boolean,
        default: false,
    },

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

// Search indexes
productSchema.index({ name: "text", description: "text", brand: "text" });
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;