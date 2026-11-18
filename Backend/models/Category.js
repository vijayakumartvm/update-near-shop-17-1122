import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    // Category name
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },

    // URL-friendly category name
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
    },

    // Category description
    description: {
        type: String,
        default: "",
        trim: true,
    },

    // Category image
    image: {
        type: String,
        default: "",
        trim: true,
    },

    // Category icon
    icon: {
        type: String,
        default: "",
    },

    // Parent category for subcategories
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null,
    },

    // Display settings
    sortOrder: {
        type: Number,
        default: 0,
    },

    isFeatured: {
        type: Boolean,
        default: false,
    },

    // Admin can activate or deactivate categories
    isActive: {
        type: Boolean,
        default: true,
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
}, {
    timestamps: true,
});

// Automatically generate slug from category name
categorySchema.pre("validate", function() {
    if (this.name && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }
});

// Category indexes
categorySchema.index({ isActive: 1, sortOrder: 1 });
categorySchema.index({ parentCategory: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;