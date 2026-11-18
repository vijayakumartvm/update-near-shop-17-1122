import express from "express";
import axios from "axios";

const router = express.Router();

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Get popular movies

// Get popular Tamil movies only
router.get("/popular", async(req, res) => {
    try {
        const response = await axios.get(
            `${TMDB_BASE_URL}/discover/movie`, {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    language: "ta-IN",
                    with_original_language: "ta",
                    with_origin_country: "IN",
                    region: "IN",
                    sort_by: "popularity.desc",
                    page: 1
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error(
            "TMDB Tamil movies error:",
            (error.response && error.response.data) || error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch Tamil movies"
        });
    }
});



// Get movies currently playing in India
router.get("/now-playing", async(req, res) => {
    try {
        const response = await axios.get(
            `${TMDB_BASE_URL}/movie/now_playing`, {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    language: "ta-IN",
                    page: 1,
                    region: "IN",
                },
            }
        );

        res.json(response.data);

    } catch (error) {
        console.error(
            "TMDB now playing error:",
            (error.response && error.response.data) || error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch now-playing movies",
        });
    }
});


router.get("/upcoming", async(req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];

        const response = await axios.get(
            `${TMDB_BASE_URL}/discover/movie`, {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    language: "ta-IN",
                    region: "IN",
                    with_original_language: "ta",
                    with_origin_country: "IN",
                    region: "IN",
                    "primary_release_date.gte": today,
                    sort_by: "primary_release_date.asc",
                    page: 1
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error(
            "TMDB upcoming Tamil movies error:",
            (error.response && error.response.data) || error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch upcoming Tamil movies"
        });
    }
});


// Get movie details by TMDB movie ID
router.get("/:id", async(req, res) => {
    try {
        const response = await axios.get(
            `${TMDB_BASE_URL}/movie/${req.params.id}`, {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    language: "ta-IN",
                    region: "IN"
                },
            }
        );

        res.json(response.data);

    } catch (error) {
        console.error(
            "TMDB movie details error:",

            (error.response && error.response.data) || error.message

        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch movie details",
        });
    }
});

export default router;