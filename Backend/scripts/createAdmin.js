import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async() => {
    try {
        const name = process.env.ADMIN_NAME;
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!name || !email || !password) {
            throw new Error(
                "ADMIN_NAME, ADMIN_EMAIL or ADMIN_PASSWORD is missing from .env"
            );
        }

        if (password.length < 12) {
            throw new Error(
                "Admin password must contain at least 12 characters"
            );
        }

        await connectDB();

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            if (existingUser.role === "admin") {
                console.log("Admin account already exists.");
                console.log("Admin email:", normalizedEmail);
                return;
            }

            throw new Error(
                "This email belongs to a non-admin account. Use a separate admin email."
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const admin = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "admin",
            isActive: true,
            isEmailVerified: true,
        });

        console.log("Admin account created successfully!");
        console.log("Admin ID:", admin._id);
        console.log("Admin email:", admin.email);
        console.log("Admin role:", admin.role);

    } catch (error) {
        console.error("Admin creation failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

createAdmin();