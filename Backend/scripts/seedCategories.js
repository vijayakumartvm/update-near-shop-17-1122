import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Category from "../models/Category.js";

dotenv.config();

const categories = [{
        name: "Vegetables",
        slug: "vegetables",
        description: "Fresh vegetables for everyday cooking",
        icon: "🥦",
        sortOrder: 1,
    },
    {
        name: "Fruits",
        slug: "fruits",
        description: "Fresh seasonal fruits",
        icon: "🍎",
        sortOrder: 2,
    },
    {
        name: "Rice & Grains",
        slug: "rice-and-grains",
        description: "Rice, wheat and other grains",
        icon: "🌾",
        sortOrder: 3,
    },
    {
        name: "Pulses & Lentils",
        slug: "pulses-and-lentils",
        description: "Fresh pulses and lentils",
        icon: "🫘",
        sortOrder: 4,
    },
    {
        name: "Cooking Oils",
        slug: "cooking-oils",
        description: "Cooking oils for daily use",
        icon: "🫒",
        sortOrder: 5,
    },
    {
        name: "Spices & Masalas",
        slug: "spices-and-masalas",
        description: "Indian spices and masalas",
        icon: "🌶️",
        sortOrder: 6,
    },
    {
        name: "Dairy & Eggs",
        slug: "dairy-and-eggs",
        description: "Milk, dairy products and eggs",
        icon: "🥛",
        sortOrder: 7,
    },
    {
        name: "Bakery & Snacks",
        slug: "bakery-and-snacks",
        description: "Fresh bakery products and snacks",
        icon: "🍞",
        sortOrder: 8,
    },
    {
        name: "Snacks & Namkeen",
        slug: "snacks-and-namkeen",
        description: "Snacks, namkeen and savouries",
        icon: "🍿",
        sortOrder: 9,
    },
    {
        name: "Beverages",
        slug: "beverages",
        description: "Drinks, juices and beverages",
        icon: "🧃",
        sortOrder: 10,
    },
    {
        name: "Personal Care",
        slug: "personal-care",
        description: "Personal hygiene and care products",
        icon: "🧴",
        sortOrder: 11,
    },
    {
        name: "Household Care",
        slug: "household-care",
        description: "Cleaning and household products",
        icon: "🧹",
        sortOrder: 12,
    },
    {
        name: "Baby Care",
        slug: "baby-care",
        description: "Essential baby care products",
        icon: "🍼",
        sortOrder: 13,
    },
    {
        name: "Pet Care",
        slug: "pet-care",
        description: "Food and care products for pets",
        icon: "🐾",
        sortOrder: 14,
    },
    {
        name: "Organic & Natural",
        slug: "organic-and-natural",
        description: "Organic and natural products",
        icon: "🌱",
        sortOrder: 15,
    },
    {
        name: "Frozen Foods",
        slug: "frozen-foods",
        description: "Frozen grocery products",
        icon: "🧊",
        sortOrder: 16,
    },
    {
        name: "Ready to Eat",
        slug: "ready-to-eat",
        description: "Ready to eat food products",
        icon: "🍱",
        sortOrder: 17,
    },
    {
        name: "Sweets & Chocolates",
        slug: "sweets-and-chocolates",
        description: "Sweets, chocolates and desserts",
        icon: "🍫",
        sortOrder: 18,
    },
    {
        name: "Kitchen Essentials",
        slug: "kitchen-essentials",
        description: "Essential kitchen products",
        icon: "🍳",
        sortOrder: 19,
    },
    {
        name: "Health & Wellness",
        slug: "health-and-wellness",
        description: "Health and wellness essentials",
        icon: "💚",
        sortOrder: 20,
    },
];

async function seedCategories() {
    try {
        await connectDB();

        let created = 0;
        let skipped = 0;
        let activated = 0;

        for (const categoryData of categories) {
            const existing = await Category.findOne({
                $or: [
                    { name: categoryData.name },
                    { slug: categoryData.slug },
                ],
            });

            if (existing) {
                // Keep existing category details.
                // Activate it if it was inactive.
                if (!existing.isActive) {
                    existing.isActive = true;
                    await existing.save();
                    activated++;
                } else {
                    skipped++;
                }

                continue;
            }

            await Category.create({
                ...categoryData,
                image: "",
                isFeatured: true,
                isActive: true,
            });

            created++;

            console.log(
                "Created category:",
                categoryData.name
            );
        }

        const total = await Category.countDocuments({
            isActive: true,
        });

        console.log("--------------------------------");
        console.log("NearShop category setup completed");
        console.log("New categories:", created);
        console.log("Existing categories skipped:", skipped);
        console.log("Inactive categories activated:", activated);
        console.log("Total active categories:", total);
        console.log("--------------------------------");

    } catch (error) {
        console.error(
            "Category seeding failed:",
            error.message
        );

        process.exitCode = 1;

    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    }
}

seedCategories();