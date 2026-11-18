import mongoose from "mongoose";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

// ADMIN: CREATE CATEGORY
export const createCategory = async(req, res) => {
    try {
        const {
            name,
            slug,
            description,
            image,
            icon,
            parentCategory,
            sortOrder,
            isFeatured,
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }

        const categorySlug =
            typeof slug === "string" && slug.trim() ?
            slug.trim().toLowerCase() :
            name.trim().toLowerCase()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        const existingCategory = await Category.findOne({
            $or: [
                { name: name.trim() },
                { slug: categorySlug },
            ],
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category name or slug already exists",
            });
        }

        if (parentCategory) {
            if (!mongoose.isValidObjectId(parentCategory)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid parent category ID",
                });
            }

            const parent = await Category.findOne({
                _id: parentCategory,
                isActive: true,
            });

            if (!parent) {
                return res.status(404).json({
                    success: false,
                    message: "Parent category not found",
                });
            }
        }

        const category = await Category.create({
            name: name.trim(),
            slug: categorySlug,
            description: description || "",
            image: req.file ?
                `/uploads/categories/${req.file.filename}` : image || "",
            icon: icon || "",
            parentCategory: parentCategory || null,
            sortOrder: Number(sortOrder) || 0,
            isFeatured: Boolean(isFeatured),
            isActive: true,
            createdBy: req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            category,
        });
    } catch (error) {
        console.error("Create category error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to create category",
        });
    }
};

// PUBLIC: GET ALL ACTIVE CATEGORIES
export const getCategories = async(req, res) => {
    try {
        const { parentCategory, featured } = req.query;

        const filter = {
            isActive: true,
        };

        if (parentCategory === "root") {
            filter.parentCategory = null;
        } else if (parentCategory) {
            if (!mongoose.isValidObjectId(parentCategory)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid parent category ID",
                });
            }

            filter.parentCategory = parentCategory;
        }

        if (featured === "true") {
            filter.isFeatured = true;
        }

        const categories = await Category.find(filter)
            .populate("parentCategory", "name slug")
            .sort({ sortOrder: 1, name: 1 });

        return res.status(200).json({
            success: true,
            count: categories.length,
            categories,
        });
    } catch (error) {
        console.error("Get categories error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve categories",
        });
    }
};

// ADMIN: GET ALL CATEGORIES
export const getAllCategoriesAdmin = async(req, res) => {
    try {
        const categories = await Category.find()
            .populate("parentCategory", "name slug")
            .sort({ sortOrder: 1, name: 1 });

        return res.status(200).json({
            success: true,
            count: categories.length,
            categories,
        });
    } catch (error) {
        console.error("Admin get categories error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve all categories",
        });
    }
};

// PUBLIC: GET CATEGORY BY SLUG
export const getCategoryBySlug = async(req, res) => {
    try {
        const category = await Category.findOne({
            slug: req.params.slug,
            isActive: true,
        }).populate("parentCategory", "name slug");

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        return res.status(200).json({
            success: true,
            category,
        });
    } catch (error) {
        console.error("Get category error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve category",
        });
    }
};

// ADMIN: UPDATE CATEGORY
export const updateCategory = async(req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        const {
            name,
            description,
            image,
            icon,
            parentCategory,
            sortOrder,
            isFeatured,
            isActive,
        } = req.body;

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Category name cannot be empty",
                });
            }

            const duplicate = await Category.findOne({
                name: name.trim(),
                _id: { $ne: category._id },
            });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message: "Another category already uses this name",
                });
            }

            category.name = name.trim();
            category.slug = name.trim()
                .toLowerCase()
                .replace(/&/g, "and")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
        }

        if (parentCategory !== undefined) {
            if (parentCategory === null || parentCategory === "") {
                category.parentCategory = null;
            } else {
                if (!mongoose.isValidObjectId(parentCategory)) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid parent category ID",
                    });
                }

                if (String(category._id) === String(parentCategory)) {
                    return res.status(400).json({
                        success: false,
                        message: "A category cannot be its own parent",
                    });
                }

                const parent = await Category.findOne({
                    _id: parentCategory,
                    isActive: true,
                });

                if (!parent) {
                    return res.status(404).json({
                        success: false,
                        message: "Parent category not found",
                    });
                }

                category.parentCategory = parent._id;
            }
        }

        if (description !== undefined) category.description = description;
        if (req.file) {
            category.image = `/uploads/categories/${req.file.filename}`;
        } else if (image !== undefined) {
            category.image = image;
        }
        if (icon !== undefined) category.icon = icon;
        if (sortOrder !== undefined) category.sortOrder = Number(sortOrder);
        if (isFeatured !== undefined) category.isFeatured = Boolean(isFeatured);
        if (isActive !== undefined) category.isActive = Boolean(isActive);

        await category.save();

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category,
        });
    } catch (error) {
        console.error("Update category error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to update category",
        });
    }
};

// ADMIN: DEACTIVATE CATEGORY
export const deleteCategory = async(req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        const productCount = await Product.countDocuments({
            category: category._id,
            status: { $in: ["pending", "approved"] },
        });

        if (productCount > 0) {
            return res.status(409).json({
                success: false,
                message: "Move or deactivate this category's products first",
                productCount,
            });
        }

        category.isActive = false;
        await category.save();

        return res.status(200).json({
            success: true,
            message: "Category deactivated successfully",
        });
    } catch (error) {
        console.error("Delete category error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to deactivate category",
        });
    }
};