import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Seller from "../models/Seller.js";

dotenv.config();

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDirectory = path.resolve(
    __dirname,
    "../uploads/categories"
);

console.log("Grocery product import script initialized.");

const connectDatabase = async() => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing from Backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully.");
};

const getApprovedSeller = async() => {
    const seller = await Seller.findOne({
        status: "approved",
        isStoreOpen: true,
    });

    if (!seller) {
        throw new Error("No approved and open seller found.");
    }

    console.log("Approved seller found:", seller.storeName);
    return seller;
};

const getCategoryBySlug = async(slug) => {
    const category = await Category.findOne({
        slug,
        isActive: true,
    });

    if (!category) {
        throw new Error(`Category not found: ${slug}`);
    }

    return category;
};

const groceryProducts = [
    // VEGETABLES
    {
        name: "Fresh Tomatoes",
        slug: "fresh-tomatoes",
        categorySlug: "vegetables",
        price: 40,
        originalPrice: 50,
        stock: 100,
        unit: "kg",
        image: "veg_tomatoes.png",
    },
    {
        name: "Fresh Carrots",
        slug: "fresh-carrots",
        categorySlug: "vegetables",
        price: 45,
        originalPrice: 55,
        stock: 100,
        unit: "kg",
        image: "veg_carrots.png",
    },
    {
        name: "Fresh Onions",
        slug: "fresh-onions",
        categorySlug: "vegetables",
        price: 35,
        originalPrice: 45,
        stock: 100,
        unit: "kg",
        image: "veg_onions.png",
    },
    {
        name: "Fresh Potatoes",
        slug: "fresh-potatoes",
        categorySlug: "vegetables",
        price: 30,
        originalPrice: 40,
        stock: 100,
        unit: "kg",
        image: "veg_potatoes.png",
    },
    {
        name: "Fresh Spinach",
        slug: "fresh-spinach",
        categorySlug: "vegetables",
        price: 35,
        originalPrice: 45,
        stock: 100,
        unit: "bunch",
        image: "veg_spinach.png",
    },
    {
        name: "Fresh Cucumbers",
        slug: "fresh-cucumbers",
        categorySlug: "vegetables",
        price: 35,
        originalPrice: 45,
        stock: 100,
        unit: "kg",
        image: "veg_cucumbers.png",
    },
    {
        name: "Fresh Broccoli",
        slug: "fresh-broccoli",
        categorySlug: "vegetables",
        price: 80,
        originalPrice: 95,
        stock: 100,
        unit: "piece",
        image: "veg_broccoli.png",
    },
    {
        name: "Fresh Bell Peppers",
        slug: "fresh-bell-peppers",
        categorySlug: "vegetables",
        price: 90,
        originalPrice: 110,
        stock: 100,
        unit: "kg",
        image: "veg_bell_peppers.png",
    },

    // FRUITS
    {
        name: "Fresh Apples",
        slug: "fresh-apples",
        categorySlug: "fruits",
        price: 150,
        originalPrice: 180,
        stock: 100,
        unit: "kg",
        image: "Fruit_apples.png",
    },
    {
        name: "Fresh Bananas",
        slug: "fresh-bananas",
        categorySlug: "fruits",
        price: 50,
        originalPrice: 60,
        stock: 100,
        unit: "dozen",
        image: "Fruit_bananas.png",
    },
    {
        name: "Fresh Grapes",
        slug: "fresh-grapes",
        categorySlug: "fruits",
        price: 90,
        originalPrice: 110,
        stock: 100,
        unit: "kg",
        image: "Fruit_grapes.png",
    },
    {
        name: "Fresh Mangoes",
        slug: "fresh-mangoes",
        categorySlug: "fruits",
        price: 100,
        originalPrice: 120,
        stock: 100,
        unit: "kg",
        image: "Fruit_mangoes.png",
    },
    {
        name: "Fresh Oranges",
        slug: "fresh-oranges",
        categorySlug: "fruits",
        price: 70,
        originalPrice: 85,
        stock: 100,
        unit: "kg",
        image: "Fruit_oranges.png",
    },
    {
        name: "Fresh Pineapple",
        slug: "fresh-pineapple",
        categorySlug: "fruits",
        price: 80,
        originalPrice: 95,
        stock: 100,
        unit: "piece",
        image: "Fruit_pineapple.png",
    },
    {
        name: "Fresh Strawberries",
        slug: "fresh-strawberries",
        categorySlug: "fruits",
        price: 120,
        originalPrice: 145,
        stock: 100,
        unit: "box",
        image: "Fruit_strawberries.png",
    },
    {
        name: "Fresh Watermelon",
        slug: "fresh-watermelon",
        categorySlug: "fruits",
        price: 40,
        originalPrice: 50,
        stock: 100,
        unit: "kg",
        image: "Fruit_watermelon.png",
    },

    // RICE & GRAINS
    {
        name: "Basmati Rice",
        slug: "basmati-rice",
        categorySlug: "rice-and-grains",
        price: 90,
        originalPrice: 110,
        stock: 100,
        unit: "kg",
        image: "rice_basmati.png",
    },
    {
        name: "Brown Rice",
        slug: "brown-rice",
        categorySlug: "rice-and-grains",
        price: 80,
        originalPrice: 95,
        stock: 100,
        unit: "kg",
        image: "rice_brown.png",
    },
    {
        name: "Quinoa",
        slug: "quinoa",
        categorySlug: "rice-and-grains",
        price: 160,
        originalPrice: 180,
        stock: 100,
        unit: "kg",
        image: "rice_quinoa.png",
    },
    {
        name: "Wheat Grains",
        slug: "wheat-grains",
        categorySlug: "rice-and-grains",
        price: 45,
        originalPrice: 55,
        stock: 100,
        unit: "kg",
        image: "rice_wheat_grains.png",
    },
    {
        name: "Rolled Oats",
        slug: "rolled-oats",
        categorySlug: "rice-and-grains",
        price: 100,
        originalPrice: 120,
        stock: 100,
        unit: "pack",
        image: "rice_rolled_oats.png",
    },
    {
        name: "Millet",
        slug: "millet",
        categorySlug: "rice-and-grains",
        price: 70,
        originalPrice: 85,
        stock: 100,
        unit: "kg",
        image: "rice_millet.png",
    },
    {
        name: "Corn Kernels",
        slug: "corn-kernels",
        categorySlug: "rice-and-grains",
        price: 65,
        originalPrice: 80,
        stock: 100,
        unit: "kg",
        image: "rice_corn_kernels.png",
    },
    {
        name: "Barley",
        slug: "barley",
        categorySlug: "rice-and-grains",
        price: 75,
        originalPrice: 90,
        stock: 100,
        unit: "kg",
        image: "rice_barley.png",
    },

    // PULSES & LENTILS
    {
        name: "Red Lentils",
        slug: "red-lentils",
        categorySlug: "pulses-and-lentils",
        price: 120,
        originalPrice: 140,
        stock: 100,
        unit: "kg",
        image: "grocery_red_lentils.png",
    },

    // COOKING OILS
    {
        name: "Cooking Oil",
        slug: "cooking-oil",
        categorySlug: "cooking-oils",
        price: 150,
        originalPrice: 170,
        stock: 100,
        unit: "litre",
        image: "grocery_cooking_oil.png",
    },

    // SPICES & MASALAS
    {
        name: "Turmeric Powder",
        slug: "turmeric-powder",
        categorySlug: "spices-and-masalas",
        price: 80,
        originalPrice: 95,
        stock: 100,
        unit: "pack",
        image: "spice_turmeric_powder.png",
    },
    {
        name: "Red Chilli Powder",
        slug: "red-chilli-powder",
        categorySlug: "spices-and-masalas",
        price: 90,
        originalPrice: 105,
        stock: 100,
        unit: "pack",
        image: "spice_red_chili_powder.png",
    },
    {
        name: "Black Pepper",
        slug: "black-pepper",
        categorySlug: "spices-and-masalas",
        price: 120,
        originalPrice: 140,
        stock: 100,
        unit: "pack",
        image: "spice_black_pepper.png",
    },
    {
        name: "Cumin Seeds",
        slug: "cumin-seeds",
        categorySlug: "spices-and-masalas",
        price: 70,
        originalPrice: 85,
        stock: 100,
        unit: "pack",
        image: "spice_cumin.png",
    },
    {
        name: "Coriander Seeds",
        slug: "coriander-seeds",
        categorySlug: "spices-and-masalas",
        price: 65,
        originalPrice: 80,
        stock: 100,
        unit: "pack",
        image: "spice_coriander.png",
    },
    {
        name: "Cloves",
        slug: "cloves",
        categorySlug: "spices-and-masalas",
        price: 110,
        originalPrice: 130,
        stock: 100,
        unit: "pack",
        image: "spice_cloves.png",
    },
    {
        name: "Cinnamon Sticks",
        slug: "cinnamon-sticks",
        categorySlug: "spices-and-masalas",
        price: 90,
        originalPrice: 110,
        stock: 100,
        unit: "pack",
        image: "spice_cinnamon_sticks.png",
    },
    {
        name: "Cardamom",
        slug: "cardamom",
        categorySlug: "spices-and-masalas",
        price: 160,
        originalPrice: 190,
        stock: 100,
        unit: "pack",
        image: "spice_cardamom.png",
    },

    // DAIRY & EGGS
    {
        name: "Fresh Milk",
        slug: "fresh-milk",
        categorySlug: "dairy-and-eggs",
        price: 30,
        originalPrice: 35,
        stock: 100,
        unit: "litre",
        image: "dairy_milk.png",
    },
    {
        name: "Fresh Butter",
        slug: "fresh-butter",
        categorySlug: "dairy-and-eggs",
        price: 55,
        originalPrice: 65,
        stock: 100,
        unit: "pack",
        image: "dairy_butter.png",
    },
    {
        name: "Cheese",
        slug: "cheese",
        categorySlug: "dairy-and-eggs",
        price: 90,
        originalPrice: 105,
        stock: 100,
        unit: "pack",
        image: "dairy_cheese.png",
    },
    {
        name: "Paneer",
        slug: "paneer",
        categorySlug: "dairy-and-eggs",
        price: 100,
        originalPrice: 120,
        stock: 100,
        unit: "pack",
        image: "dairy_paneer.png",
    },
    {
        name: "Yogurt",
        slug: "yogurt",
        categorySlug: "dairy-and-eggs",
        price: 40,
        originalPrice: 50,
        stock: 100,
        unit: "pack",
        image: "dairy_yogurt.png",
    },

    // BAKERY & SNACKS
    {
        name: "Fresh Bread Loaf",
        slug: "fresh-bread-loaf",
        categorySlug: "bakery-and-snacks",
        price: 45,
        originalPrice: 55,
        stock: 100,
        unit: "piece",
        image: "bakery_bread_loaf.png",
    },
    {
        name: "Croissant",
        slug: "croissant",
        categorySlug: "bakery-and-snacks",
        price: 60,
        originalPrice: 70,
        stock: 100,
        unit: "piece",
        image: "bakery_croissant.png",
    },
    {
        name: "Chocolate Donut",
        slug: "chocolate-donut",
        categorySlug: "bakery-and-snacks",
        price: 50,
        originalPrice: 60,
        stock: 100,
        unit: "piece",
        image: "bakery_chocolate_donut.png",
    },
    {
        name: "Blueberry Muffin",
        slug: "blueberry-muffin",
        categorySlug: "bakery-and-snacks",
        price: 55,
        originalPrice: 65,
        stock: 100,
        unit: "piece",
        image: "bakery_blueberry_muffin.png",
    },
    {
        name: "Pain au Chocolate",
        slug: "pain-au-chocolate",
        categorySlug: "bakery-and-snacks",
        price: 65,
        originalPrice: 75,
        stock: 100,
        unit: "piece",
        image: "bakery_pain_chocolate.png",
    },
    {
        name: "Cinnamon Roll",
        slug: "cinnamon-roll",
        categorySlug: "bakery-and-snacks",
        price: 55,
        originalPrice: 65,
        stock: 100,
        unit: "piece",
        image: "bakery_cinnamon_roll.png",
    },
    {
        name: "Bread Rolls",
        slug: "bread-rolls",
        categorySlug: "bakery-and-snacks",
        price: 40,
        originalPrice: 50,
        stock: 100,
        unit: "pack",
        image: "bakery_bread_rolls.png",
    },
    {
        name: "Baguette",
        slug: "baguette",
        categorySlug: "bakery-and-snacks",
        price: 60,
        originalPrice: 70,
        stock: 100,
        unit: "piece",
        image: "bakery_baguette.png",
    },

    // SNACKS & NAMKEEN
    {
        name: "Chocolate",
        slug: "snack-chocolate",
        categorySlug: "snacks-and-namkeen",
        price: 80,
        originalPrice: 95,
        stock: 100,
        unit: "pack",
        image: "snack_chocolate.png",
    },
    {
        name: "Cookies",
        slug: "snack-cookies",
        categorySlug: "snacks-and-namkeen",
        price: 50,
        originalPrice: 60,
        stock: 100,
        unit: "pack",
        image: "snack_cookies.png",
    },
    {
        name: "Popcorn",
        slug: "snack-popcorn",
        categorySlug: "snacks-and-namkeen",
        price: 40,
        originalPrice: 50,
        stock: 100,
        unit: "pack",
        image: "snack_popcorn.png",
    },
    {
        name: "Roasted Nuts",
        slug: "roasted-nuts",
        categorySlug: "snacks-and-namkeen",
        price: 120,
        originalPrice: 140,
        stock: 100,
        unit: "pack",
        image: "snack_roasted_nuts.png",
    },

    // BEVERAGES
    {
        name: "Apple Juice",
        slug: "apple-juice",
        categorySlug: "beverages",
        price: 90,
        originalPrice: 110,
        stock: 100,
        unit: "litre",
        image: "juice_apple_juice.png",
    },
    {
        name: "Mango Juice",
        slug: "mango-juice",
        categorySlug: "beverages",
        price: 85,
        originalPrice: 100,
        stock: 100,
        unit: "litre",
        image: "juice_mango_juice.png",
    },
    {
        name: "Orange Juice",
        slug: "orange-juice",
        categorySlug: "beverages",
        price: 80,
        originalPrice: 95,
        stock: 100,
        unit: "litre",
        image: "juice_orange_juice.png",
    },
    {
        name: "Green Tea",
        slug: "green-tea",
        categorySlug: "beverages",
        price: 120,
        originalPrice: 140,
        stock: 100,
        unit: "pack",
        image: "tea_green_tea.png",
    },
    {
        name: "Robusta Coffee Beans",
        slug: "robusta-coffee-beans",
        categorySlug: "beverages",
        price: 180,
        originalPrice: 210,
        stock: 100,
        unit: "pack",
        image: "tea_robusta_coffee_beans.png",
    },
    {
        name: "Instant Coffee",
        slug: "instant-coffee",
        categorySlug: "beverages",
        price: 130,
        originalPrice: 150,
        stock: 100,
        unit: "pack",
        image: "tea_instant_coffee.png",
    },
    {
        name: "Hibiscus Tea",
        slug: "hibiscus-tea",
        categorySlug: "beverages",
        price: 120,
        originalPrice: 140,
        stock: 100,
        unit: "pack",
        image: "tea_hibiscus_tea.png",
    },
    {
        name: "Ground Coffee",
        slug: "ground-coffee",
        categorySlug: "beverages",
        price: 160,
        originalPrice: 185,
        stock: 100,
        unit: "pack",
        image: "tea_ground_coffee.png",
    },
    {
        name: "Chamomile Tea",
        slug: "chamomile-tea",
        categorySlug: "beverages",
        price: 140,
        originalPrice: 165,
        stock: 100,
        unit: "pack",
        image: "tea_chamomile_tea.png",
    },
    {
        name: "Assam Black Tea",
        slug: "assam-black-tea",
        categorySlug: "beverages",
        price: 110,
        originalPrice: 130,
        stock: 100,
        unit: "pack",
        image: "tea_assam_black_tea.png",
    },
    {
        name: "Arabica Coffee Beans",
        slug: "arabica-coffee-beans",
        categorySlug: "beverages",
        price: 200,
        originalPrice: 230,
        stock: 100,
        unit: "pack",
        image: "tea_arabica_coffee_beans.png",
    },

    // FROZEN FOODS
    {
        name: "Frozen Mixed Vegetables",
        slug: "frozen-mixed-vegetables",
        categorySlug: "frozen-foods",
        price: 120,
        originalPrice: 140,
        stock: 100,
        unit: "pack",
        image: "frozen_mixed_vegetables.png",
    },
    {
        name: "Frozen French Fries",
        slug: "frozen-french-fries",
        categorySlug: "frozen-foods",
        price: 100,
        originalPrice: 120,
        stock: 100,
        unit: "pack",
        image: "frozen_french_fries.png",
    },
    {
        name: "Frozen Peas",
        slug: "frozen-peas",
        categorySlug: "frozen-foods",
        price: 80,
        originalPrice: 95,
        stock: 100,
        unit: "pack",
        image: "frozen_peas.png",
    },
    {
        name: "Frozen Corn",
        slug: "frozen-corn",
        categorySlug: "frozen-foods",
        price: 75,
        originalPrice: 90,
        stock: 100,
        unit: "pack",
        image: "frozen_corn.png",
    },
    {
        name: "Frozen Fish Fillets",
        slug: "frozen-fish-fillets",
        categorySlug: "frozen-foods",
        price: 220,
        originalPrice: 250,
        stock: 100,
        unit: "pack",
        image: "frozen_fish_fillets.png",
    },
    {
        name: "Frozen Dumplings",
        slug: "frozen-dumplings",
        categorySlug: "frozen-foods",
        price: 150,
        originalPrice: 175,
        stock: 100,
        unit: "pack",
        image: "frozen_dumplings.png",
    },
    {
        name: "Frozen Berries",
        slug: "frozen-berries",
        categorySlug: "frozen-foods",
        price: 180,
        originalPrice: 210,
        stock: 100,
        unit: "pack",
        image: "frozen_berries.png",
    },

    // READY TO EAT
    {
        name: "Savory Snacks",
        slug: "savory-snacks",
        categorySlug: "ready-to-eat",
        price: 60,
        originalPrice: 75,
        stock: 100,
        unit: "pack",
        image: "pandry_savory.png",
    },
    {
        name: "Breakfast Cereal",
        slug: "breakfast-cereal",
        categorySlug: "ready-to-eat",
        price: 120,
        originalPrice: 140,
        stock: 100,
        unit: "pack",
        image: "pandry_cereal.png",
    },
    {
        name: "Oats",
        slug: "oats",
        categorySlug: "ready-to-eat",
        price: 90,
        originalPrice: 110,
        stock: 100,
        unit: "pack",
        image: "pandry_oats.png",
    },
    {
        name: "Crackers",
        slug: "crackers",
        categorySlug: "ready-to-eat",
        price: 50,
        originalPrice: 60,
        stock: 100,
        unit: "pack",
        image: "pandry_crackers.png",
    },
    {
        name: "Pretzels and Breadsticks",
        slug: "pretzels-breadsticks",
        categorySlug: "ready-to-eat",
        price: 70,
        originalPrice: 85,
        stock: 100,
        unit: "pack",
        image: "pandry_pretzels_breadsticks.png",
    },
    {
        name: "Pantry Popcorn",
        slug: "pantry-popcorn",
        categorySlug: "ready-to-eat",
        price: 45,
        originalPrice: 55,
        stock: 100,
        unit: "pack",
        image: "pandry_popcorn.png",
    },
    {
        name: "Dried Fruit Mix",
        slug: "dried-fruit-mix",
        categorySlug: "ready-to-eat",
        price: 140,
        originalPrice: 160,
        stock: 100,
        unit: "pack",
        image: "pandry_dried_fruit.png",
    },

    // SWEETS & CHOCOLATES
    {
        name: "Gulab Jamun",
        slug: "gulab-jamun",
        categorySlug: "sweets-and-chocolates",
        price: 100,
        originalPrice: 120,
        stock: 100,
        unit: "pack",
        image: "dessert_gulab_jamun.png",
    },
    {
        name: "Chocolate Brownies",
        slug: "chocolate-brownies",
        categorySlug: "sweets-and-chocolates",
        price: 80,
        originalPrice: 95,
        stock: 100,
        unit: "pack",
        image: "dessert_chocolate_brownies.png",
    },
    {
        name: "Cheesecake",
        slug: "cheesecake",
        categorySlug: "sweets-and-chocolates",
        price: 150,
        originalPrice: 180,
        stock: 100,
        unit: "piece",
        image: "dessert_cheesecake.png",
    },
    {
        name: "Rasmalai",
        slug: "rasmalai",
        categorySlug: "sweets-and-chocolates",
        price: 120,
        originalPrice: 140,
        stock: 100,
        unit: "pack",
        image: "dessert_rasmalai.png",
    },
    {
        name: "Tiramisu",
        slug: "tiramisu",
        categorySlug: "sweets-and-chocolates",
        price: 160,
        originalPrice: 185,
        stock: 100,
        unit: "piece",
        image: "dessert_tiramisu.png",
    },
    {
        name: "Macarons",
        slug: "macarons",
        categorySlug: "sweets-and-chocolates",
        price: 140,
        originalPrice: 165,
        stock: 100,
        unit: "pack",
        image: "dessert_macarons.png",
    },
    {
        name: "Fruit Tart",
        slug: "fruit-tart",
        categorySlug: "sweets-and-chocolates",
        price: 120,
        originalPrice: 140,
        stock: 100,
        unit: "piece",
        image: "dessert_fruit_tart.png",
    },
    {
        name: "Chocolate Mousse",
        slug: "chocolate-mousse",
        categorySlug: "sweets-and-chocolates",
        price: 130,
        originalPrice: 150,
        stock: 100,
        unit: "piece",
        image: "dessert_chocolate_mousse.png",
    },
    {
        name: "Chocolate Cake",
        slug: "chocolate-cake",
        categorySlug: "sweets-and-chocolates",
        price: 180,
        originalPrice: 210,
        stock: 100,
        unit: "piece",
        image: "des_chocolate_cake.png",
    },
    {
        name: "Cupcake",
        slug: "cupcake",
        categorySlug: "sweets-and-chocolates",
        price: 60,
        originalPrice: 75,
        stock: 100,
        unit: "piece",
        image: "des_cupcake.png",
    },

    // HEALTH & WELLNESS
    {
        name: "Almonds",
        slug: "almonds",
        categorySlug: "health-and-wellness",
        price: 180,
        originalPrice: 210,
        stock: 100,
        unit: "pack",
        image: "nut_almonds.png",
    },
    {
        name: "Cashews",
        slug: "cashews",
        categorySlug: "health-and-wellness",
        price: 200,
        originalPrice: 230,
        stock: 100,
        unit: "pack",
        image: "nut_cashews.png",
    },
    {
        name: "Pistachios",
        slug: "pistachios",
        categorySlug: "health-and-wellness",
        price: 220,
        originalPrice: 250,
        stock: 100,
        unit: "pack",
        image: "nut_pistachios.png",
    },
    {
        name: "Walnuts",
        slug: "walnuts",
        categorySlug: "health-and-wellness",
        price: 190,
        originalPrice: 220,
        stock: 100,
        unit: "pack",
        image: "nut_walnuts.png",
    },
    {
        name: "Pecans",
        slug: "pecans",
        categorySlug: "health-and-wellness",
        price: 220,
        originalPrice: 250,
        stock: 100,
        unit: "pack",
        image: "nut_pecans.png",
    },
    {
        name: "Peanuts",
        slug: "peanuts",
        categorySlug: "health-and-wellness",
        price: 80,
        originalPrice: 95,
        stock: 100,
        unit: "pack",
        image: "nut_peanuts.png",
    },
    {
        name: "Macadamia Nuts",
        slug: "macadamia-nuts",
        categorySlug: "health-and-wellness",
        price: 250,
        originalPrice: 280,
        stock: 100,
        unit: "pack",
        image: "nut_macadamia.png",
    },
    {
        name: "Hazelnuts",
        slug: "hazelnuts",
        categorySlug: "health-and-wellness",
        price: 210,
        originalPrice: 240,
        stock: 100,
        unit: "pack",
        image: "nut_hazelnuts.png",
    },
];

const importGroceryProducts = async() => {
    try {
        await connectDatabase();

        const seller = await getApprovedSeller();

        const operations = [];
        const missingImages = [];
        const missingCategories = [];

        for (const item of groceryProducts) {
            const imagePath = path.join(
                uploadsDirectory,
                item.image
            );

            if (!fs.existsSync(imagePath)) {
                missingImages.push(item.image);
                continue;
            }

            const category = await Category.findOne({
                slug: item.categorySlug,
                isActive: true,
            });

            if (!category) {
                missingCategories.push(item.categorySlug);
                continue;
            }

            operations.push({
                updateOne: {
                    filter: {
                        seller: seller._id,
                        slug: item.slug,
                    },
                    update: {
                        $setOnInsert: {
                            name: item.name,
                            slug: item.slug,
                            seller: seller._id,
                            category: category._id,
                            price: item.price,
                            originalPrice: item.originalPrice,
                            stock: item.stock,
                            unit: item.unit,
                            images: [
                                `/uploads/categories/${item.image}`,
                            ],
                            status: "pending",
                        },
                    },
                    upsert: true,
                },
            });
        }

        let result = null;

        if (operations.length > 0) {
            result = await Product.bulkWrite(operations);
        }

        console.log("\nImport completed.");
        console.log("Products checked:", groceryProducts.length);
        console.log(
            "New products inserted:",
            result ? result.upsertedCount : 0
        );
        console.log("Missing images:", missingImages);
        console.log("Missing categories:", missingCategories);

    } catch (error) {
        console.error("Product import failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB connection closed.");
    }
};

importGroceryProducts();