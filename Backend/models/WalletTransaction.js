import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema({
    // Customer who owns this transaction
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    // Customer wallet
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Wallet",
        required: true,
    },

    // Credit or debit
    transactionType: {
        type: String,
        enum: ["credit", "debit"],
        required: true,
    },

    // Which wallet balance is affected
    balanceType: {
        type: String,
        enum: ["general", "reward", "refund"],
        required: true,
    },

    // Transaction category
    category: {
        type: String,
        enum: [
            "grocery_reward",
            "movie_reward",
            "movie_ticket_payment",
            "movie_refund",
            "grocery_refund",
            "wallet_payment",
            "coupon_redemption",
            "admin_adjustment",
        ],
        required: true,
    },

    // Transaction amount in INR
    amount: {
        type: Number,
        required: true,
        min: 0.01,
    },

    // Wallet balance after transaction
    balanceAfter: {
        type: Number,
        required: true,
        min: 0,
    },

    // Currency
    currency: {
        type: String,
        default: "INR",
        uppercase: true,
    },

    // Transaction status
    status: {
        type: String,
        enum: [
            "pending",
            "completed",
            "failed",
            "reversed",
        ],
        default: "pending",
    },

    // Unique transaction reference
    transactionReference: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    // Related grocery order
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        default: null,
    },

    // Related movie booking
    movieBooking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MovieBooking",
        default: null,
    },

    // Related coupon
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
        default: null,
    },

    // Description for transaction history
    description: {
        type: String,
        default: "",
        trim: true,
    },

    // Gateway or external payment reference
    externalReference: {
        type: String,
        default: "",
        trim: true,
    },

    // Admin who made an adjustment, if applicable
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },

    completedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

// Customer wallet transaction history
walletTransactionSchema.index({
    user: 1,
    createdAt: -1,
});

// Find transactions belonging to a wallet
walletTransactionSchema.index({
    wallet: 1,
    createdAt: -1,
});

// Find transactions by status and category
walletTransactionSchema.index({
    status: 1,
    category: 1,
});

const WalletTransaction = mongoose.model(
    "WalletTransaction",
    walletTransactionSchema
);

export default WalletTransaction;