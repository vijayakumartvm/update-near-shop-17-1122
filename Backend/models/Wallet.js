import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
    // Customer who owns this wallet
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },

    // Available wallet balance in INR
    balance: {
        type: Number,
        default: 0,
        min: 0,
    },

    // Promotional balance from NearShop offers
    rewardBalance: {
        type: Number,
        default: 0,
        min: 0,
    },

    // Eligible refund credits
    refundBalance: {
        type: Number,
        default: 0,
        min: 0,
    },

    currency: {
        type: String,
        default: "INR",
        uppercase: true,
    },

    // Wallet status
    status: {
        type: String,
        enum: ["active", "locked", "closed"],
        default: "active",
    },

    lastTransactionAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

// Find customer wallet
walletSchema.index({ user: 1 });

const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;