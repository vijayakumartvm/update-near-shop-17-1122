import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// GET CUSTOMER CART
export const getCart = async(req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.user._id,
        }).populate({
            path: "items.product",
            select: "name slug price originalPrice images stock unit status seller category",
            populate: [{
                    path: "seller",
                    select: "storeName status isStoreOpen",
                },
                {
                    path: "category",
                    select: "name slug",
                },
            ],
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                message: "Your cart is empty",
                items: [],
            });
        }

        const subtotal = cart.items.reduce((total, item) => {
            if (item.product && item.product.status === "approved") {
                return total + item.product.price * item.quantity;
            }

            return total;
        }, 0);

        return res.status(200).json({
            success: true,
            cart,
            subtotal,
        });
    } catch (error) {
        console.error("Get cart error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve cart",
        });
    }
};


// ADD PRODUCT TO CART
export const addToCart = async(req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Valid product ID is required",
            });
        }

        const requestedQuantity = Number(quantity);

        if (!Number.isInteger(requestedQuantity) ||
            requestedQuantity < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive whole number",
            });
        }

        const product = await Product.findById(productId)
            .populate("seller", "status isStoreOpen");

        if (!product || product.status !== "approved") {
            return res.status(404).json({
                success: false,
                message: "Product is unavailable",
            });
        }

        if (!product.seller ||
            product.seller.status !== "approved" ||
            !product.seller.isStoreOpen
        ) {
            return res.status(400).json({
                success: false,
                message: "This seller's store is currently unavailable",
            });
        }

        if (requestedQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} units are available`,
            });
        }

        let cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {
            cart = new Cart({
                user: req.user._id,
                items: [],
            });
        }

        const existingItem = cart.items.find(
            (item) => String(item.product) === String(product._id)
        );

        if (existingItem) {
            const newQuantity =
                existingItem.quantity + requestedQuantity;

            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} units are available`,
                });
            }

            existingItem.quantity = newQuantity;
            existingItem.selected = true;
        } else {
            cart.items.push({
                product: product._id,
                quantity: requestedQuantity,
                selected: true,
            });
        }

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product added to cart successfully",
            cart,
        });
    } catch (error) {
        console.error("Add to cart error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to add product to cart",
        });
    }
};


// UPDATE PRODUCT QUANTITY
export const updateCartItem = async(req, res) => {
    try {
        const { quantity } = req.body;

        const newQuantity = Number(quantity);

        if (!Number.isInteger(newQuantity) || newQuantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid quantity",
            });
        }

        const cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const item = cart.items.id(req.params.itemId);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }

        const product = await Product.findById(item.product)
            .populate("seller", "status isStoreOpen");

        if (!product ||
            product.status !== "approved" ||
            !product.seller ||
            product.seller.status !== "approved" ||
            !product.seller.isStoreOpen
        ) {
            return res.status(400).json({
                success: false,
                message: "This product is no longer available",
            });
        }

        if (newQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} units are available`,
            });
        }

        item.quantity = newQuantity;

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated",
            cart,
        });
    } catch (error) {
        console.error("Update cart error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to update cart",
        });
    }
};


// SELECT OR DESELECT CART ITEM
export const updateCartSelection = async(req, res) => {
    try {
        const { selected } = req.body;

        if (typeof selected !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "Selected must be true or false",
            });
        }

        const cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const item = cart.items.id(req.params.itemId);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }

        item.selected = selected;

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart selection updated",
            cart,
        });
    } catch (error) {
        console.error("Cart selection error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to update cart selection",
        });
    }
};


// REMOVE ONE PRODUCT FROM CART
export const removeCartItem = async(req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const item = cart.items.id(req.params.itemId);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }

        cart.items.pull({ _id: req.params.itemId });

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart,
        });
    } catch (error) {
        console.error("Remove cart item error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to remove product",
        });
    }
};


// CLEAR ENTIRE CUSTOMER CART
export const clearCart = async(req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                message: "Cart is already empty",
            });
        }

        cart.items = [];

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            cart,
        });
    } catch (error) {
        console.error("Clear cart error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to clear cart",
        });
    }
};