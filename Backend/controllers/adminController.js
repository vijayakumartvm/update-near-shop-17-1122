import Order from "../models/Order.js";
import User from "../models/User.js";
import Seller from "../models/Seller.js";
import Product from "../models/Product.js";

// ADMIN DASHBOARD SUMMARY
export const getAdminDashboard = async(req, res) => {
    try {
        const [
            totalCustomers,
            totalSellers,
            totalProducts,
            totalOrders,
            pendingSellers,
            revenueResult,
            orderStatus,
            recentOrders,
            monthlySales
        ] = await Promise.all([

            User.countDocuments({ role: "customer" }),

            Seller.countDocuments(),

            Product.countDocuments(),

            Order.countDocuments(),

            Seller.countDocuments({ status: "pending" }),

            Order.aggregate([{
                    $match: {
                        orderStatus: { $ne: "cancelled" }
                    }
                },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: "$totalAmount" }
                    }
                }
            ]),

            Order.aggregate([{
                $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 }
                }
            }]),

            Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("user", "name email"),

            Order.aggregate([{
                    $match: {
                        createdAt: {
                            $gte: new Date(
                                new Date().getFullYear(),
                                0,
                                1
                            )
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            month: {
                                $month: "$createdAt"
                            }
                        },
                        revenue: {
                            $sum: "$totalAmount"
                        }
                    }
                },
                {
                    $sort: { "_id.month": 1 }
                }
            ])
        ]);

        const revenue = revenueResult.length > 0 ? revenueResult[0].revenue : 0;

        return res.status(200).json({
            success: true,

            statistics: {
                totalCustomers,
                totalSellers,
                totalProducts,
                totalOrders,
                pendingSellers,
                revenue
            },

            orderStatus,

            recentOrders,

            monthlySales
        });

    } catch (error) {
        console.error("Admin Dashboard Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load admin dashboard"
        });
    }
};