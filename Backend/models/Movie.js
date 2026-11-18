import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    // Movie information
    title: {
        type: String,
        required: true,
        trim: true,
    },

    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
    },

    description: {
        type: String,
        default: "",
        trim: true,
    },

    // Movie images and videos
    poster: {
        type: String,
        default: "",
    },

    banner: {
        type: String,
        default: "",
    },

    trailerUrl: {
        type: String,
        default: "",
    },

    // Movie details
    language: {
        type: [String],
        default: ["Tamil"],
    },

    genres: {
        type: [String],
        default: [],
    },

    durationMinutes: {
        type: Number,
        min: 1,
        default: null,
    },

    certificate: {
        type: String,
        enum: ["U", "UA", "A", "S", "Not Rated"],
        default: "Not Rated",
    },

    releaseDate: {
        type: Date,
        default: null,
    },

    // Movie listing status
    status: {
        type: String,
        enum: ["draft", "published", "inactive"],
        default: "draft",
    },

    // Movie booking provider information
    bookingProvider: {
        type: String,
        default: "",
    },

    externalMovieId: {
        type: String,
        default: "",
    },

    // Admin who manages the movie listing
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },

    isFeatured: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Generate URL-friendly movie slug
movieSchema.pre("validate", function() {
    if (this.title && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }
});

// Search indexes
movieSchema.index({ title: "text", description: "text" });
movieSchema.index({ status: 1, releaseDate: -1 });
movieSchema.index({ isFeatured: 1, status: 1 });

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;