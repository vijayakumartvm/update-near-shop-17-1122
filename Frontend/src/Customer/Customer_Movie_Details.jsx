
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Common_navbar from "../components/Navbar/Common_navbar";
import Common_Footer from "../components/Footer/Common_Footer";

import "./Customer_Movie_Details.css";

const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP_URL = "https://image.tmdb.org/t/p/w1280";

function Customer_Movie_Details() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        setError("");
        setMovie(null);

        const response = await fetch(
          `http://localhost:5000/api/movies/${id}`
        );

        if (!response.ok) {
          throw new Error("Unable to fetch movie details");
        }

        const data = await response.json();

        if (!data || !data.id) {
          throw new Error("Movie not found");
        }

        setMovie(data);
      } catch (err) {
        console.error("Movie details error:", err);
        setError("Unable to load movie details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetails();
    }
  }, [id]);

  const formatRuntime = (runtime) => {
    if (!runtime) return "Not available";

    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;

    return `${hours}h ${minutes}m`;
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  return (
    <>
      <Common_navbar />

      <main className="ns-movie-detail-page">

        <button
          className="ns-movie-detail-back"
          onClick={() => navigate("/customer/movies")}
        >
          ← Back to Movies
        </button>

        {/* Loading */}
        {loading && (
          <div className="ns-movie-not-found">
            <h2>Loading Movie Details...</h2>
            <p>Please wait while we fetch movie information.</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="ns-movie-not-found">
            <h2>Movie Details Unavailable</h2>
            <p>{error}</p>

            <button
              onClick={() => navigate("/customer/movies")}
            >
              Back to Movies
            </button>
          </div>
        )}

        {/* Movie Details */}
        {!loading && !error && movie && (
          <>
            <section
              className="ns-movie-detail-card"
              style={
                movie.backdrop_path
                  ? {
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.94), rgba(255,255,255,0.96)), url(${TMDB_BACKDROP_URL}${movie.backdrop_path})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                  : {}
              }
            >

              {/* Real Movie Poster */}
              <div className="ns-movie-detail-poster">

                {movie.poster_path ? (
                  <img
                    src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
                    alt={movie.title}
                  />
                ) : (
                  <span>🎬</span>
                )}

                <div className="ns-movie-poster-caption">
                  {movie.title}
                </div>

              </div>

              {/* Movie Information */}
              <div className="ns-movie-detail-content">

                <span className="ns-movie-detail-tag">
                  MOVIE DETAILS
                </span>

                <h1>{movie.title}</h1>

                {movie.original_title &&
                  movie.original_title !== movie.title && (
                    <p>{movie.original_title}</p>
                  )}

                <p className="ns-movie-detail-genre">
                  {movie.genres?.length
                    ? movie.genres.map((genre) => genre.name).join(" | ")
                    : "Genre not available"}
                </p>

                <div className="ns-movie-detail-rating">
                  ⭐ {movie.vote_average
                    ? `${movie.vote_average.toFixed(1)}/10`
                    : "Not rated"}
                </div>

                <div className="ns-movie-detail-meta">

                  <div>
                    <span>Language</span>
                    <strong>
                      {movie.original_language?.toUpperCase() || "N/A"}
                    </strong>
                  </div>

                  <div>
                    <span>Duration</span>
                    <strong>
                      {formatRuntime(movie.runtime)}
                    </strong>
                  </div>

                  <div>
                    <span>Release Date</span>
                    <strong>
                      {formatDate(movie.release_date)}
                    </strong>
                  </div>

                  <div>
                    <span>Status</span>
                    <strong>{movie.status || "N/A"}</strong>
                  </div>

                  <div>
                    <span>Rating Count</span>
                    <strong>{movie.vote_count ?? 0}</strong>
                  </div>

                  <div>
                    <span>Popularity</span>
                    <strong>
                      {movie.popularity?.toFixed(0) ?? "N/A"}
                    </strong>
                  </div>

                </div>

                <h3>About the Movie</h3>

                <p className="ns-movie-detail-description">
                  {movie.overview || "Movie description not available."}
                </p>

                <div className="ns-movie-detail-actions">

                  <button
                    className="ns-movie-detail-book"
                    onClick={() => navigate("/customer/movies")}
                  >
                    Choose Theatre & Show Time →
                  </button>

                  <button
                    className="ns-movie-detail-secondary"
                    onClick={() => navigate("/customer/movies")}
                  >
                    Explore Other Movies
                  </button>

                </div>

              </div>

            </section>

            <section className="ns-movie-offer-info">
              <div className="ns-movie-offer-icon">🎁</div>

              <div>
                <h3>NearShop Special Movie Offers</h3>

                <p>
                  Explore special movie-ticket offers
                  and NearShop entertainment rewards.
                </p>
              </div>
            </section>
          </>
        )}

      </main>

      <Common_Footer />
    </>
  );
}

export default Customer_Movie_Details;
