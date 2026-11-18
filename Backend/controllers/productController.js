import Product from "../models/Product.js";
import Seller from "../models/Seller.js";
import Category from "../models/Category.js";

// Helper: get the logged-in seller's approved store
const getApprovedSeller = async(userId) => {
    return Seller.findOne({
        user: userId,
        status: "approved",
    });
};

// Helper: create a URL-friendly product slug
const createSlug = (name) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
};

// SELLER: ADD PRODUCT
export const addProduct = async(req, res) => {
    try {
        const {
            name,
            description,
            brand,
            category,
            price,
            originalPrice,
            images,
            stock,
            unit,
            sku,
        } = req.body;

        if (!name || !category || price === undefined) {
            return res.status(400).json({
                success: false,
                message: "Product name, category and price are required",
            });
        }

        const productPrice = Number(price);
        const productStock =
            stock === undefined || stock === null ? 0 : Number(stock);

        if (!Number.isFinite(productPrice) || productPrice < 0) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid product price",
            });
        }

        if (!Number.isInteger(productStock) ||
            productStock < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a non-negative whole number",
            });
        }

        if (originalPrice !== undefined && originalPrice !== null) {
            const oldPrice = Number(originalPrice);

            if (!Number.isFinite(oldPrice) || oldPrice < productPrice) {
                return res.status(400).json({
                    success: false,
                    message: "Original price must be valid and not below selling price",
                });
            }
        }

        // Check seller approval
        const seller = await getApprovedSeller(req.user._id);

        if (!seller) {
            return res.status(403).json({
                success: false,
                message: "Your store must be approved before adding products",
            });
        }

        // Check active category
        const categoryExists = await Category.findOne({
            _id: category,
            isActive: true,
        });

        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: "Selected category is unavailable",
            });
        }

        const productImages = Array.isArray(images) ? images : [];

        const product = await Product.create({
            name: name.trim(),
            slug: createSlug(name),
            description: description || "",
            brand: brand || "",
            seller: seller._id,
            category: categoryExists._id,
            price: productPrice,
            originalPrice: originalPrice === undefined || originalPrice === null ?
                null : Number(originalPrice),
            images: productImages,
            stock: productStock,
            unit: unit || "piece",
            sku: sku || "",
            status: "pending",
        });

        return res.status(201).json({
            success: true,
            message: "Product submitted for admin approval",
            product,
        });
    } catch (error) {
        console.error("Add product error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to add product",
        });
    }
};

// SELLER: GET OWN PRODUCTS
export const getMyProducts = async(req, res) => {
    try {
        const seller = await Seller.findOne({
            user: req.user._id,
        });

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller store not found",
            });
        }

        const products = await Product.find({
                seller: seller._id,
            })
            .populate("category", "name slug")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    } catch (error) {
        console.error("Get seller products error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve products",
        });
    }
};

// PUBLIC: GET APPROVED PRODUCTS

export const getProducts = async(req, res) => {
    try {
        const {
            search = "",
                category,
                minPrice,
                maxPrice,
                page = 1,
                limit = 12,
        } = req.query;

        const pageNumber = Math.max(1, Number(page) || 1);
        const pageSize = Math.min(50, Math.max(1, Number(limit) || 12));

        const approvedSellers = await Seller.find({
            status: "approved",
            isStoreOpen: true,
        }).select("_id");

        const filter = {
            status: "approved",
            seller: { $in: approvedSellers.map((seller) => seller._id) },
            stock: { $gt: 0 },
        };

        if (category) {
            const categoryDoc = await Category.findOne({
                slug: category,
                isActive: true,
            }).select("_id");

            if (!categoryDoc) {
                return res.status(200).json({
                    success: true,
                    total: 0,
                    page: pageNumber,
                    pages: 0,
                    products: [],
                });
            }

            filter.category = categoryDoc._id;
        }

        if (search.trim()) {
            filter.$text = { $search: search.trim() };
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};

            if (minPrice !== undefined) {
                filter.price.$gte = Number(minPrice);
            }

            if (maxPrice !== undefined) {
                filter.price.$lte = Number(maxPrice);
            }
        }

        if (
            filter.price &&
            Object.values(filter.price).some(
                (value) => !Number.isFinite(value) || value < 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid price filter",
            });
        }

        const [products, total] = await Promise.all([
            Product.find(filter)
            .populate("seller", "storeName rating")
            .populate("category", "name slug")
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize),

            Product.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            total,
            page: pageNumber,
            pages: Math.ceil(total / pageSize),
            products,
        });
    } catch (error) {
        console.error("Get products error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve products",
        });
    }
};


// PUBLIC: GET SINGLE APPROVED PRODUCT
export const getProductById = async(req, res) => {
    try {
        const product = await Product.findOne({
                _id: req.params.id,
                status: "approved",
            })
            .populate(
                "seller",
                "storeName rating address status isStoreOpen"
            )
            .populate("category", "name slug");

        if (!product ||
            !product.seller ||
            product.seller.status !== "approved" ||
            !product.seller.isStoreOpen
        ) {
            return res.status(404).json({
                success: false,
                message: "Product not found or unavailable",
            });
        }

        return res.status(200).json({
            success: true,
            product,
        });
    } catch (error) {
        console.error("Get product details error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve product details",
        });
    }
};

// SELLER: UPDATE OWN PRODUCT
export const updateProduct = async(req, res) => {
    try {
        const seller = await Seller.findOne({
            user: req.user._id,
            status: "approved",
        });

        if (!seller) {
            return res.status(403).json({
                success: false,
                message: "Approved seller account required",
            });
        }

        const product = await Product.findOne({
            _id: req.params.id,
            seller: seller._id,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found in your store",
            });
        }

        const allowedFields = [
            "name",
            "description",
            "brand",
            "category",
            "price",
            "originalPrice",
            "images",
            "stock",
            "unit",
            "sku",
        ];

        let requiresReview = false;

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                if (
                    ["name", "category", "price", "originalPrice", "description", "brand", "images"].includes(field) &&
                    product.status === "approved"
                ) {
                    requiresReview = true;
                }

                product[field] = req.body[field];
            }
        }

        if (req.body.category !== undefined) {
            const categoryExists = await Category.findOne({
                _id: req.body.category,
                isActive: true,
            });

            if (!categoryExists) {
                return res.status(400).json({
                    success: false,
                    message: "Selected category is unavailable",
                });
            }
        }

        if (req.body.name !== undefined) {
            product.slug = createSlug(req.body.name);
        }

        if (req.body.price !== undefined) {
            const price = Number(req.body.price);

            if (!Number.isFinite(price) || price < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product price",
                });
            }

            product.price = price;
        }

        if (req.body.stock !== undefined) {
            const stock = Number(req.body.stock);

            if (!Number.isInteger(stock) || stock < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Stock must be a non-negative whole number",
                });
            }

            product.stock = stock;
        }

        if (requiresReview) {
            product.status = "pending";
        }

        await product.save();

        return res.status(200).json({
            success: true,
            message: requiresReview ?
                "Product updated and submitted for admin review" : "Product updated successfully",
            product,
        });
    } catch (error) {
        console.error("Update product error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to update product",
        });
    }
};

// SELLER: SOFT DELETE OWN PRODUCT
export const deleteProduct = async(req, res) => {
    try {
        const seller = await Seller.findOne({
            user: req.user._id,
        });

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller store not found",
            });
        }

        const product = await Product.findOne({
            _id: req.params.id,
            seller: seller._id,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        product.status = "inactive";
        await product.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from your store",
        });
    } catch (error) {
        console.error("Delete product error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to remove product",
        });
    }
};

// ADMIN: VIEW ALL PRODUCTS
export const getAllProductsAdmin = async(req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const pageNumber = Math.max(1, Number(page) || 1);
        const pageSize = Math.min(50, Math.max(1, Number(limit) || 20));

        const filter = {};

        if (status) {
            const allowedStatuses = [
                "pending",
                "approved",
                "rejected",
                "inactive",
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product status filter",
                });
            }

            filter.status = status;
        }

        const [products, total] = await Promise.all([
            Product.find(filter)
            .populate("seller", "storeName status")
            .populate("category", "name")
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize),

            Product.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            total,
            page: pageNumber,
            pages: Math.ceil(total / pageSize),
            products,
        });
    } catch (error) {
        console.error("Admin get products error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve admin products",
        });
    }
};

// ADMIN: APPROVE OR REJECT PRODUCT
export const reviewProduct = async(req, res) => {
    try {
        const { status, rejectionReason } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be approved or rejected",
            });
        }

        if (status === "rejected" && (!rejectionReason || !rejectionReason.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please provide a rejection reason",
            });
        }

        const product = await Product.findById(req.params.id).populate("seller");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        if (
            status === "approved" &&
            (!product.seller || product.seller.status !== "approved")
        ) {
            return res.status(400).json({
                success: false,
                message: "Approve the seller store before approving its products",
            });
        }

        product.status = status;

        // Save rejection reason only when rejected
        product.rejectionReason =
            status === "rejected" ? rejectionReason.trim() : "";

        await product.save();

        return res.status(200).json({
            success: true,
            message: `Product ${status} successfully`,
            product,
        });
    } catch (error) {
        console.error("Review product error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to review product",
        });
    }
};