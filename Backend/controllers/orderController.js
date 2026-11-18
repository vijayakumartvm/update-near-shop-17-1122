import mongoose from "mongoose";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Seller from "../models/Seller.js";
import Coupon from "../models/Coupon.js";

// Helper for API errors
const createError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

// ==========================================
// CUSTOMER: CREATE ORDER / CHECKOUT
// ==========================================

export const createOrder = async(req, res) => {
    const session = await mongoose.startSession();

    try {
        const {
            shippingAddress,
            paymentMethod,
            couponCode: rawCouponCode,
        } = req.body;

        // Validate delivery address
        const requiredAddressFields = [
            "fullName",
            "phone",
            "addressLine",
            "city",
            "state",
            "pincode",
        ];

        if (!shippingAddress ||
            requiredAddressFields.some(
                (field) =>
                !shippingAddress[field] ||
                !String(shippingAddress[field]).trim()
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a complete delivery address",
            });
        }

        // COD payment only
        if (paymentMethod !== "cod") {
            return res.status(400).json({
                success: false,
                message: "Cash on Delivery is currently enabled",
            });
        }

        const couponCode =
            typeof rawCouponCode === "string" ?
            rawCouponCode.trim().toUpperCase() :
            "";

        let createdOrder = null;

        await session.withTransaction(async() => {

            // 1. Find customer cart
            const cart = await Cart.findOne({
                user: req.user._id,
            }).session(session);

            if (!cart || cart.items.length === 0) {
                throw createError(400, "Your cart is empty");
            }

            const selectedItems = cart.items.filter(
                (item) => item.selected !== false
            );

            if (selectedItems.length === 0) {
                throw createError(
                    400,
                    "Please select products for checkout"
                );
            }

            // 2. Fetch approved products
            const productIds = selectedItems.map(
                (item) => item.product
            );

            const products = await Product.find({
                _id: { $in: productIds },
                status: "approved",
            }).session(session);

            const productMap = new Map(
                products.map((product) => [
                    String(product._id),
                    product,
                ])
            );

            const sellerIds = selectedItems.map((item) => {
                const product = productMap.get(
                    String(item.product)
                );

                if (!product) {
                    throw createError(
                        400,
                        "One or more products are unavailable"
                    );
                }

                return product.seller;
            });

            // 3. Verify sellers
            const sellers = await Seller.find({
                _id: { $in: sellerIds },
                status: "approved",
                isStoreOpen: true,
            }).session(session);

            const approvedSellerIds = new Set(
                sellers.map((seller) => String(seller._id))
            );

            const orderItems = [];
            let subtotal = 0;

            // 4. Validate products and calculate subtotal
            for (const item of selectedItems) {
                const product = productMap.get(
                    String(item.product)
                );

                if (!product) {
                    throw createError(
                        400,
                        "Product is unavailable"
                    );
                }

                if (!approvedSellerIds.has(
                        String(product.seller)
                    )) {
                    throw createError(
                        400,
                        `${product.name} seller is unavailable`
                    );
                }

                if (item.quantity > product.stock) {
                    throw createError(
                        400,
                        `Insufficient stock for ${product.name}`
                    );
                }

                const itemTotal =
                    product.price * item.quantity;

                subtotal += itemTotal;

                const productImage =
                    Array.isArray(product.images) &&
                    product.images.length > 0 ?
                    product.images[0] :
                    "";

                orderItems.push({
                    product: product._id,
                    seller: product.seller,
                    productName: product.name,
                    productImage,
                    quantity: item.quantity,
                    price: product.price,
                    itemTotal,
                    sellerStatus: "pending",
                });
            }

            // 5. Calculate delivery fee
            const deliveryFee = subtotal >= 500 ? 0 : 30;
            const tax = 0;

            // 6. Validate coupon
            let appliedCoupon = null;
            let discount = 0;

            if (couponCode) {
                appliedCoupon = await Coupon.findOne({
                    code: couponCode,
                    isActive: true,
                }).session(session);

                if (!appliedCoupon) {
                    throw createError(
                        400,
                        "Invalid or inactive coupon"
                    );
                }

                const now = new Date();
                const validFrom = new Date(
                    appliedCoupon.validFrom
                );
                const validUntil = new Date(
                    appliedCoupon.validUntil
                );

                if (
                    Number.isNaN(validFrom.getTime()) ||
                    Number.isNaN(validUntil.getTime()) ||
                    now < validFrom ||
                    now > validUntil
                ) {
                    throw createError(
                        400,
                        "This coupon is not currently valid"
                    );
                }

                if (
                    appliedCoupon.appliesTo !== "grocery_order" &&
                    appliedCoupon.appliesTo !== "both"
                ) {
                    throw createError(
                        400,
                        "This coupon cannot be used for grocery orders"
                    );
                }

                if (
                    appliedCoupon.couponType === "movie_ticket"
                ) {
                    throw createError(
                        400,
                        "This coupon is for movie bookings"
                    );
                }

                // Minimum purchase check
                if (
                    subtotal <
                    Number(appliedCoupon.minimumOrderAmount || 0)
                ) {
                    throw createError(
                        400,
                        `Minimum purchase amount is ₹${appliedCoupon.minimumOrderAmount}`
                    );
                }

                // Overall coupon usage limit
                if (
                    appliedCoupon.usageLimit !== null &&
                    appliedCoupon.usageLimit !== undefined &&
                    appliedCoupon.usedCount >=
                    appliedCoupon.usageLimit
                ) {
                    throw createError(
                        400,
                        "Coupon usage limit has been reached"
                    );
                }

                // Customer-specific usage limit
                if (Number(appliedCoupon.perUserLimit) > 0) {
                    const customerUses =
                        await Order.countDocuments({
                            user: req.user._id,
                            coupon: appliedCoupon._id,
                            orderStatus: {
                                $ne: "cancelled",
                            },
                        }).session(session);

                    if (
                        customerUses >=
                        appliedCoupon.perUserLimit
                    ) {
                        throw createError(
                            400,
                            "You have already used this coupon the maximum number of times"
                        );
                    }
                }

                // 7. Calculate discount
                if (
                    appliedCoupon.couponType === "percentage"
                ) {
                    discount =
                        (subtotal *
                            Number(appliedCoupon.discountValue)) /
                        100;

                    if (
                        Number(appliedCoupon.maximumDiscount) > 0
                    ) {
                        discount = Math.min(
                            discount,
                            Number(appliedCoupon.maximumDiscount)
                        );
                    }
                } else if (
                    appliedCoupon.couponType === "fixed"
                ) {
                    discount = Number(
                        appliedCoupon.discountValue
                    );
                } else if (
                    appliedCoupon.couponType === "free_delivery"
                ) {
                    discount = deliveryFee;
                } else {
                    throw createError(
                        400,
                        "Unsupported coupon type"
                    );
                }

                discount = Math.max(
                    0,
                    Math.min(
                        discount,
                        subtotal + deliveryFee + tax
                    )
                );

                discount = Number(discount.toFixed(2));
            }

            // 8. Calculate final payable amount
            const totalAmount = Number(
                (
                    subtotal +
                    deliveryFee +
                    tax -
                    discount
                ).toFixed(2)
            );

            // 9. Reduce product stock
            for (const item of selectedItems) {
                const stockUpdate = await Product.updateOne({
                    _id: item.product,
                    stock: { $gte: item.quantity },
                    status: "approved",
                }, {
                    $inc: {
                        stock: -item.quantity,
                    },
                }, { session });

                if (stockUpdate.modifiedCount !== 1) {
                    throw createError(
                        409,
                        "Product stock changed. Please refresh your cart"
                    );
                }
            }

            // 10. Create order
            const orders = await Order.create(
                [{
                    user: req.user._id,
                    items: orderItems,

                    shippingAddress: {
                        ...shippingAddress,
                        country: shippingAddress.country || "India",
                    },

                    subtotal,
                    discount,
                    deliveryFee,
                    tax,
                    totalAmount,

                    coupon: appliedCoupon ?
                        appliedCoupon._id :
                        null,

                    couponCode: appliedCoupon ?
                        appliedCoupon.code :
                        "",

                    paymentMethod: "cod",
                    paymentStatus: "pending",
                    orderStatus: "pending",
                }, ], { session }
            );

            createdOrder = orders[0];

            // 11. Increment coupon usage
            if (appliedCoupon) {
                const couponFilter = {
                    _id: appliedCoupon._id,
                    isActive: true,
                };

                if (
                    appliedCoupon.usageLimit !== null &&
                    appliedCoupon.usageLimit !== undefined
                ) {
                    couponFilter.usedCount = {
                        $lt: appliedCoupon.usageLimit,
                    };
                }

                const couponUpdate = await Coupon.updateOne(
                    couponFilter, {
                        $inc: {
                            usedCount: 1,
                        },
                    }, { session }
                );

                if (couponUpdate.modifiedCount !== 1) {
                    throw createError(
                        409,
                        "Coupon usage limit reached"
                    );
                }
            }

            // 12. Remove purchased products from cart
            const purchasedIds = new Set(
                selectedItems.map(
                    (item) => String(item._id)
                )
            );

            cart.items = cart.items.filter(
                (item) =>
                !purchasedIds.has(String(item._id))
            );

            await cart.save({ session });
        });

        const populatedOrder = await Order.findById(
            createdOrder._id
        ).populate("items.seller", "storeName");

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: populatedOrder,
        });

    } catch (error) {
        console.error(
            "Create order error:",
            error.message
        );

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to place order",
        });

    } finally {
        await session.endSession();
    }
};

// ==========================================
// CUSTOMER: GET MY ORDERS
// ==========================================

export const getMyOrders = async(req, res) => {
    try {
        const orders = await Order.find({
                user: req.user._id,
            })
            .populate("items.seller", "storeName")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });

    } catch (error) {
        console.error(
            "Get customer orders error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve your orders",
        });
    }
};

// ==========================================
// CUSTOMER: GET ONE ORDER
// ==========================================

export const getOrderById = async(req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id,
        }).populate("items.seller", "storeName");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        return res.status(200).json({
            success: true,
            order,
        });

    } catch (error) {
        console.error("Get order error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve order",
        });
    }
};

// ==========================================
// CUSTOMER: CANCEL PENDING COD ORDER
// ==========================================

export const cancelOrder = async(req, res) => {
    const session = await mongoose.startSession();

    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        const { reason } = req.body;
        let cancelledOrder = null;

        await session.withTransaction(async() => {
            const order = await Order.findOne({
                _id: req.params.id,
                user: req.user._id,
            }).session(session);

            if (!order) {
                throw createError(404, "Order not found");
            }

            if (
                order.paymentMethod !== "cod" ||
                order.paymentStatus !== "pending" ||
                order.orderStatus !== "pending"
            ) {
                throw createError(
                    400,
                    "This order cannot be cancelled through this endpoint"
                );
            }

            // Restore stock
            for (const item of order.items) {
                await Product.updateOne({ _id: item.product }, {
                    $inc: {
                        stock: item.quantity,
                    },
                }, { session });

                item.sellerStatus = "cancelled";
            }

            // Release coupon usage for the cancelled order
            if (order.coupon) {
                await Coupon.updateOne({
                    _id: order.coupon,
                    usedCount: { $gt: 0 },
                }, {
                    $inc: {
                        usedCount: -1,
                    },
                }, { session });
            }

            order.orderStatus = "cancelled";

            order.cancellationReason =
                typeof reason === "string" && reason.trim() ?
                reason.trim() :
                "Cancelled by customer";

            await order.save({ session });

            cancelledOrder = order;
        });

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order: cancelledOrder,
        });

    } catch (error) {
        console.error("Cancel order error:", error.message);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to cancel order",
        });

    } finally {
        await session.endSession();
    }
};