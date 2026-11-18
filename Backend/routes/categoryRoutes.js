import express from "express";

import {
    createCategory,
    getCategories,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
    getAllCategoriesAdmin
} from "../controllers/categoryController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";
import uploadCategory from "../middleware/uploadCategory.js";

const router = express.Router();

// Public: list active categories
router.get("/", getCategories);

// Admin: list all categories (active and inactive)
router.get(
    "/admin/all",
    protect,
    authorize("admin"),
    getAllCategoriesAdmin
);

// Public: get category details
router.get("/slug/:slug", getCategoryBySlug);

// Admin: create category
router.post(
    "/",
    protect,
    authorize("admin"),
    uploadCategory.single("image"),
    createCategory
);

// Admin: update category
router.put(
    "/:id",
    protect,
    authorize("admin"),
    uploadCategory.single("image"),
    updateCategory
);

// Admin: deactivate category
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteCategory
);

export default router;