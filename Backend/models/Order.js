import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },

    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        required: true,
    },

    productName: {
        type: String,
        required: true,
        trim: true,
    },

    productImage: {
        type: String,
        default: "",
    },

    quantity: {
        type: Number,
        required: true,
        min: 1,
    },

    // Price at the time of purchase
    price: {
        type: Number,
        required: true,
        min: 0,
    },

    itemTotal: {
        type: Number,
        required: true,
        min: 0,
    },

    sellerStatus: {
        type: String,
        enum: [
            "pending",
            "accepted",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
        ],
        default: "pending",
    },
}, { timestamps: true });

const addressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },

    phone: {
        type: String,
        required: true,
    },

    addressLine: {
        type: String,
        required: true,
    },

    city: {
        type: String,
        required: true,
    },

    state: {
        type: String,
        required: true,
    },

    pincode: {
        type: String,
        required: true,
    },

    country: {
        type: String,
        default: "India",
    },
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        default: () =>
            `NS-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    },

    // Customer who placed the order
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    items: {
        type: [orderItemSchema],
        required: true,
        validate: {
            validator: (items) => items.length > 0,
            message: "An order must contain at least one product",
        },
    },

    shippingAddress: {
        type: addressSchema,
        required: true,
    },

    // Order amount details
    subtotal: {
        type: Number,
        required: true,
        min: 0,
    },

    discount: {
        type: Number,
        default: 0,
        min: 0,
    },

    deliveryFee: {
        type: Number,
        default: 0,
        min: 0,
    },

    tax: {
        type: Number,
        default: 0,
        min: 0,
    },

    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },

    // Applied coupon
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
        default: null,
    },

    couponCode: {
        type: String,
        default: "",
    },

    // Payment information
    paymentMethod: {
        type: String,
        enum: [
            "cod",
            "upi",
            "card",
            "netbanking",
            "wallet",
        ],
        required: true,
    },

    paymentStatus: {
        type: String,
        enum: [
            "pending",
            "paid",
            "failed",
            "refunded",
            "partially_refunded",
        ],
        default: "pending",
    },

    transactionId: {
        type: String,
        default: "",
    },

    // Overall order status
    orderStatus: {
        type: String,
        enum: [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "out_for_delivery",
            "delivered",
            "cancelled",
        ],
        default: "pending",
    },

    cancellationReason: {
        type: String,
        default: "",
    },

    deliveredAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

// Useful database indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ "items.seller": 1, orderStatus: 1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;