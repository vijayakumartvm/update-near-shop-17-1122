import Seller from "../models/Seller.js";

// CREATE OR UPDATE SELLER STORE PROFILE
export const createSellerProfile = async(req, res) => {
    try {
        const {
            storeName,
            storeDescription,
            storeCategory,
            contactPhone,
            supportEmail,
            storeLogo,
            storeBanner,
            address,
            businessType,
            gstNumber,
        } = req.body;

        if (!storeName || !contactPhone) {
            return res.status(400).json({
                success: false,
                message: "Store name and contact phone are required",
            });
        }

        // Only the logged-in seller can create their own profile
        const seller = await Seller.findOneAndUpdate({ user: req.user._id }, {
            $set: {
                storeName,
                storeDescription,
                storeCategory,
                contactPhone,
                supportEmail,
                storeLogo,
                storeBanner,
                address,
                businessType,
                gstNumber,
            },
            $setOnInsert: {
                user: req.user._id,
                status: "pending",
            },
        }, {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        });

        return res.status(200).json({
            success: true,
            message: "Store profile saved. Waiting for admin approval.",
            seller,
        });
    } catch (error) {
        console.error("Seller profile error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to save seller profile",
        });
    }
};


// GET LOGGED-IN SELLER PROFILE
export const getMySellerProfile = async(req, res) => {
    try {
        const seller = await Seller.findOne({
            user: req.user._id,
        }).populate("user", "name email phone");

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller store profile not found",
            });
        }

        return res.status(200).json({
            success: true,
            seller,
        });
    } catch (error) {
        console.error("Get seller profile error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to get seller profile",
        });
    }
};


// ADMIN: GET ALL SELLERS
export const getAllSellers = async(req, res) => {
    try {
        const { status, page = 1, limit = 10, search = "" } = req.query;

        const pageNumber = Math.max(1, Number(page) || 1);
        const pageSize = Math.min(50, Math.max(1, Number(limit) || 10));

        const filter = {};

        if (
            status && ["pending", "approved", "rejected", "suspended"].includes(status)
        ) {
            filter.status = status;
        }

        const searchText = String(search).trim();

        if (searchText) {
            filter.$or = [
                { storeName: { $regex: searchText, $options: "i" } },
                { contactPhone: { $regex: searchText, $options: "i" } },
            ];
        }

        const [sellers, total] = await Promise.all([
            Seller.find(filter)
            .populate("user", "name email phone")
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize),

            Seller.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            total,
            page: pageNumber,
            pages: Math.ceil(total / pageSize),
            sellers,
        });
    } catch (error) {
        console.error("Get sellers error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve sellers",
        });
    }
};


// ADMIN: APPROVE, REJECT OR SUSPEND SELLER
export const updateSellerStatus = async(req, res) => {
    try {
        const { status, rejectionReason } = req.body;

        const allowedStatuses = [
            "approved",
            "rejected",
            "suspended",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid seller status",
            });
        }

        if (
            status === "rejected" &&
            (!rejectionReason || !rejectionReason.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a rejection reason",
            });
        }

        const seller = await Seller.findById(req.params.id);

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found",
            });
        }

        seller.status = status;
        seller.rejectionReason =
            status === "rejected" ? rejectionReason.trim() : "";

        if (status === "approved") {
            seller.approvedAt = new Date();
            seller.approvedBy = req.user._id;
        } else {
            seller.approvedAt = null;
            seller.approvedBy = null;
        }

        await seller.save();

        return res.status(200).json({
            success: true,
            message: `Seller ${status} successfully`,
            seller,
        });
    } catch (error) {
        console.error("Update seller status error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to update seller status",
        });
    }
};