import express from "express";

import {
    addProduct,
    getMyProducts,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getAllProductsAdmin,
    reviewProduct,
} from "../controllers/productController.js";

import {
    protect,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// SELLER: Add a grocery product
router.post(
    "/",
    protect,
    authorize("seller"),
    addProduct
);

// SELLER: View own products
router.get(
    "/my-products",
    protect,
    authorize("seller"),
    getMyProducts
);

// ADMIN: View all products
router.get(
    "/admin/all",
    protect,
    authorize("admin"),
    getAllProductsAdmin
);

// ADMIN: Approve or reject a product
router.patch(
    "/admin/:id/review",
    protect,
    authorize("admin"),
    reviewProduct
);

// PUBLIC: Browse approved products
router.get("/", getProducts);

// PUBLIC: View one approved product
router.get("/:id", getProductById);

// SELLER: Edit own product
router.put(
    "/:id",
    protect,
    authorize("seller"),
    updateProduct
);

// SELLER: Remove own product
router.delete(
    "/:id",
    protect,
    authorize("seller"),
    deleteProduct
);

export default router;