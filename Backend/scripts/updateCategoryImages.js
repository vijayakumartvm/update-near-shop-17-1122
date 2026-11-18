import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import connectDB from "../config/db.js";
import Category from "../models/Category.js";

dotenv.config();

const imageFolder = path.join(process.cwd(), "uploads", "categories");

// Only the image field will be updated.
// The other category information will remain unchanged.
const categoryImages = {
    vegetables: "veg_tomatoes.png",
    fruits: "Fruit_apples.png",
    "rice-and-grains": "rice_basmati.png",
    "pulses-and-lentils": "grocery_red_lentils.png",
    "cooking-oils": "grocery_cooking_oil.png",
    "spices-and-masalas": "spice_turmeric_powder.png",
    "dairy-and-eggs": "dairy_milk.png",
    "bakery-and-snacks": "bakery_bread_loaf.png",
    "snacks-and-namkeen": "snack_roasted_nuts.png",
    beverages: "juice_mixed_fruit_juice.png",
    "personal-care": "",
    "household-care": "",
    "baby-care": "",
    "pet-care": "",
    "organic-and-natural": "category_img1.png",
    "frozen-foods": "frozen_mixed_vegetables.png",
    "ready-to-eat": "pandry_savory.png",
    "sweets-and-chocolates": "dessert_gulab_jamun.png",
    "kitchen-essentials": "category_img3.png",
    "health-and-wellness": "nut_almonds.png",
};

const updateCategoryImages = async() => {
    try {
        await connectDB();

        let updated = 0;

        for (const [slug, filename] of Object.entries(categoryImages)) {
            if (filename && !fs.existsSync(path.join(imageFolder, filename))) {
                throw new Error(`Image file not found: ${filename}`);
            }

            const imagePath = filename ?
                `/uploads/categories/${filename}` :
                "";

            const result = await Category.updateOne({ slug }, { $set: { image: imagePath } });

            if (result.matchedCount === 0) {
                throw new Error(`Category not found: ${slug}`);
            }

            console.log(`Updated: ${slug} -> ${imagePath || "No image yet"}`);
            updated++;
        }

        console.log(`\nSuccess! Updated ${updated} categories.`);
    } catch (error) {
        console.error("Update failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

updateCategoryImages();