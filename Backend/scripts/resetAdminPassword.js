import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const resetAdminPassword = async() => {
    try {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password || password.length < 12) {
            throw new Error("Check ADMIN_EMAIL and ADMIN_PASSWORD in .env");
        }

        await connectDB();

        const admin = await User.findOne({
            email: email.trim().toLowerCase(),
            role: "admin",
        });

        if (!admin) {
            throw new Error("Admin account not found");
        }

        admin.password = await bcrypt.hash(password, 12);

        await admin.save();

        console.log("Admin password updated successfully!");
        console.log("Admin email:", admin.email);

    } catch (error) {
        console.error("Password reset failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

resetAdminPassword();