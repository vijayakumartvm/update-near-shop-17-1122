
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Common_navbar from "../components/Navbar/Common_navbar";
import Common_Footer from "../components/Footer/Common_Footer";
import MovieBanner from "../assets/customer_img/movie-banner-1.png";

import "./Customer_Movie_Tickets.css";

const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w500";

const cities = [
  "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli",
  "Salem", "Tiruppur", "Erode", "Vellore",
  "Tiruvannamalai", "Thanjavur", "Tirunelveli", "Thoothukudi",
  "Dindigul", "Kanchipuram", "Karur", "Hosur",
  "Nagercoil", "Kanyakumari", "Cuddalore", "Villupuram",
  "Namakkal", "Krishnagiri", "Ramanathapuram", "Sivakasi",
  "Kumbakonam", "Pollachi", "Ooty", "Theni",
  "Pudukkottai", "Ariyalur", "Perambalur", "Dharmapuri",
  "Virudhunagar", "Nagapattinam", "Mayiladuthurai",
];

const theatres = {
  Chennai: [
    {
      name: "PVR Cinemas",
      area: "Velachery",
      address: "Phoenix Marketcity, Velachery Main Road, Chennai",
      times: ["10:00 AM", "1:15 PM", "4:30 PM", "7:45 PM", "10:30 PM"],
    },
    {
      name: "INOX",
      area: "Royapettah",
      address: "Express Avenue Mall, Royapettah, Chennai",
      times: ["9:30 AM", "12:45 PM", "4:00 PM", "7:15 PM", "10:15 PM"],
    },
    {
      name: "AGS Cinemas",
      area: "T. Nagar",
      address: "AGS Cinemas, T. Nagar, Chennai",
      times: ["10:30 AM", "2:00 PM", "5:30 PM", "9:00 PM"],
    },
  ],

  Coimbatore: [
    {
      name: "Broadway Cinemas",
      area: "Gandhipuram",
      address: "Broadway Cinemas, Gandhipuram, Coimbatore",
      times: ["10:00 AM", "1:30 PM", "5:00 PM", "8:30 PM"],
    },
    {
      name: "KG Cinemas",
      area: "Race Course",
      address: "KG Cinemas, Race Course, Coimbatore",
      times: ["9:45 AM", "1:00 PM", "4:15 PM", "7:30 PM"],
    },
  ],

  Madurai: [
    {
      name: "INOX",
      area: "Vishaal de Mall",
      address: "Vishaal de Mall, Gokhale Road, Madurai",
      times: ["10:15 AM", "1:30 PM", "4:45 PM", "8:00 PM"],
    },
    {
      name: "Ambiga Cinemas",
      area: "Anna Nagar",
      address: "Ambiga Cinemas, Anna Nagar, Madurai",
      times: ["10:00 AM", "2:00 PM", "6:00 PM", "9:30 PM"],
    },
  ],

  Tiruchirappalli: [
    {
      name: "LA Cinemas",
      area: "Thillai Nagar",
      address: "LA Cinemas, Thillai Nagar, Tiruchirappalli",
      times: ["10:00 AM", "1:15 PM", "4:30 PM", "7:45 PM"],
    },
  ],

  Tiruvannamalai: [
    {
      name: "Apsara Theatre",
      area: "Town",
      address: "Apsara Theatre, Tiruvannamalai, Tamil Nadu",
      times: ["10:30 AM", "2:00 PM", "6:00 PM", "9:30 PM"],
    },
  ],

  Salem: [
    {
      name: "ARRS Multiplex",
      area: "Five Roads",
      address: "ARRS Multiplex, Five Roads, Salem",
      times: ["10:00 AM", "1:30 PM", "5:00 PM", "8:30 PM"],
    },
  ],
};

const getTheatresByCity = (city) => {
  if (theatres[city]) {
    return theatres[city];
  }

  return [
    {
      name: `${city} Sample Cinema 1`,
      area: city,
      address: `${city}, Tamil Nadu`,
      times: ["10:00 AM", "1:30 PM", "5:00 PM", "8:30 PM"],
    },
    {
      name: `${city} Sample Cinema 2`,
      area: city,
      address: `${city}, Tamil Nadu`,
      times: ["9:30 AM", "12:45 PM", "4:00 PM", "7:30 PM"],
    },
  ];
};

const genres = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  18: "Drama",
  14: "Fantasy",
  27: "Horror",
  9648: "Mystery",
  10749: "Romance",
  53: "Thriller",
};

const Customer_Movie_Tickets = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("now");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCity, setSelectedCity] = useState("Chennai");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("popularity");

  // Right-side booking panel
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const bookingDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);

    return {
      value: [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-"),
      day: date.toLocaleDateString("en-IN", { weekday: "short" }),
      number: date.getDate(),
      month: date.toLocaleDateString("en-IN", { month: "short" }),
    };
  });

  // Fetch Tamil movies
  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/movies/popular"
      );

      if (!response.ok) {
        throw new Error("Unable to fetch movies");
      }

      const data = await response.json();

      const tamilMovies = (data.results || []).filter(
        (movie) => movie.original_language === "ta"
      );

      setMovies(tamilMovies);
    } catch (err) {
      console.error("Movie loading error:", err);
      setError(
        "Unable to load Tamil movies. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Available genres
  const availableGenres = useMemo(() => {
    const found = new Set();

    movies.forEach((movie) => {
      (movie.genre_ids || []).forEach((id) => {
        if (genres[id]) found.add(genres[id]);
      });
    });

    return ["All", ...Array.from(found)];
  }, [movies]);

  // Filter and sort movies
  const displayedMovies = useMemo(() => {
    let result = [...movies];

    if (selectedGenre !== "All") {
      result = result.filter((movie) =>
        (movie.genre_ids || []).some(
          (id) => genres[id] === selectedGenre
        )
      );
    }

    if (sortBy === "rating") {
      result.sort(
        (a, b) => b.vote_average - a.vote_average
      );
    } else if (sortBy === "release") {
      result.sort((a, b) =>
        (b.release_date || "").localeCompare(
          a.release_date || ""
        )
      );
    } else {
      result.sort(
        (a, b) => b.popularity - a.popularity
      );
    }

    return result;
  }, [movies, selectedGenre, sortBy]);

  // Open right-side theatre panel
  const showTheatres = (movie) => {
    setSelectedMovie(movie);
    setSelectedShow(null);
  };

  // Close booking panel
  const closeBookingPanel = () => {
    setSelectedMovie(null);
    setSelectedShow(null);
  };

  // Select theatre and showtime
  const handleShowSelection = (movie, theatre, time) => {
    setSelectedShow({
      movieId: movie.id,
      movieTitle: movie.title,
      theatre: theatre.name,
      address: theatre.address,
      city: selectedCity,
      time,
      date: selectedDate,
    });
  };

  // Continue to seat selection
  const continueToSeatSelection = () => {
    if (!selectedMovie || !selectedShow) {
      return;
    }

    navigate(
      `/customer/movie/${selectedMovie.id}/showtimes`,
      {
        state: {
          movie: selectedMovie,
          movieId: selectedMovie.id,
          movieTitle: selectedMovie.title,
          moviePoster: selectedMovie.poster_path,
          city: selectedShow.city,
          theatre: selectedShow.theatre,
          address: selectedShow.address,
          date: selectedShow.date,
          time: selectedShow.time,
        },
      }
    );
  };


  return (
    <>
      <Common_navbar />

      <main className="ns-movies-page">

        {/* Page Header */}
        <header className="ns-movies-header">
          <div>
            <h2>Movie Tickets</h2>
            <p>
              Book your favourite Tamil movies with NearShop.
            </p>
          </div>

          <Link
            to="/customer"
            className="ns-movies-shop-btn"
          >
            Continue Shopping
          </Link>
        </header>

        {/* Movie Banner */}
        <section className="ns-movies-banner">
          <img
            src={MovieBanner}
            alt="NearShop Movie Tickets"
            className="ns-movies-banner-image"
          />
        </section>

        {/* Main Movie Content */}
        <section
          className="ns-movies-content"
          id="ns-movie-list"
        >

          {/* Tabs */}
          <div className="ns-movies-tabs">
            <button
              type="button"
              className={activeTab === "now" ? "active" : ""}
              onClick={() => setActiveTab("now")}
            >
              ▣ &nbsp; Now Showing
            </button>

            <button
              type="button"
              className={activeTab === "coming" ? "active" : ""}
              onClick={() => setActiveTab("coming")}
            >
              ▦ &nbsp; Coming Soon
            </button>

            <button
              type="button"
              className={activeTab === "offers" ? "active" : ""}
              onClick={() => setActiveTab("offers")}
            >
              ◇ &nbsp; Offers
            </button>
          </div>

          {/* Now Showing */}
          {activeTab === "now" && (
            <>
              {/* Filters */}
              <div className="ns-movie-filters">

                <div className="ns-movie-genre-filter">
                  <strong>Filter by Genre:</strong>

                  {availableGenres.map((genre) => (
                    <button
                      type="button"
                      key={genre}
                      className={
                        selectedGenre === genre
                          ? "selected"
                          : ""
                      }
                      onClick={() => setSelectedGenre(genre)}
                    >
                      {genre}
                    </button>
                  ))}
                </div>

                <label className="ns-movie-city-select">
                  <span>📍</span>

                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setSelectedShow(null);
                    }}
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Section Heading */}
              <div className="ns-movie-section-heading">
                <h2>Now Showing in Tamil Nadu</h2>
                <span>{displayedMovies.length} Movies</span>
              </div>

              {/* Sorting */}
              <div className="ns-movie-sort">
                <label htmlFor="movie-sort">Sort by:</label>

                <select
                  id="movie-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popularity">Popularity</option>
                  <option value="rating">Rating</option>
                  <option value="release">Release Date</option>
                </select>
              </div>

              {/* Loading */}
              {loading && (
                <div className="ns-movies-message">
                  <span>🎬</span>
                  <p>Loading Tamil movies...</p>
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <div className="ns-movies-message ns-movies-error">
                  <p>{error}</p>

                  <button
                    type="button"
                    onClick={fetchMovies}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* No Movies */}
              {!loading &&
                !error &&
                displayedMovies.length === 0 && (
                  <div className="ns-movies-message">
                    <span>🎥</span>
                    <h3>No Tamil Movies Found</h3>
                    <p>
                      Try again later or select another genre.
                    </p>
                  </div>
                )}

              {/* Movie Grid */}
              <div className="ns-movies-grid">

                {displayedMovies.map((movie) => (
                  <article
                    className="ns-movie-card"
                    key={movie.id}
                  >

                    {/* Movie Poster */}
                    <Link
                      to={`/customer/movie/${movie.id}`}
                      className="ns-movie-poster"
                    >
                      {movie.poster_path ? (
                        <img
                          src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
                          alt={movie.title}
                          loading="lazy"
                        />
                      ) : (
                        <div className="ns-movie-no-poster">
                          🎬
                        </div>
                      )}

                      <span className="ns-movie-status">
                        Now Showing
                      </span>
                    </Link>

                    {/* Movie Information */}
                    <div className="ns-movie-info">

                      <div className="ns-movie-title-row">
                        <h3>{movie.title}</h3>

                        <span>
                          ★{" "}
                          {movie.vote_average?.toFixed(1) || "N/A"}
                        </span>
                      </div>

                      <p>
                        <span className="ns-language-tag">
                          Tamil
                        </span>

                        {(movie.genre_ids || [])
                          .map((id) => genres[id])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join(" • ") || "Tamil Movie"}
                      </p>

                      <small>
                        Release:{" "}
                        {movie.release_date || "Not available"}
                      </small>

                      <button
                        type="button"
                        className="ns-movie-book-btn"
                        onClick={() => showTheatres(movie)}
                      >
                        Book Tickets →
                      </button>

                    </div>
                  </article>
                ))}

              </div>
            </>
          )}

          {/* Coming Soon */}
          {activeTab === "coming" && (
            <div className="ns-movies-empty">
              <span>🍿</span>
              <h3>Coming Soon</h3>
              <p>
                Upcoming Tamil movie listings will appear here.
              </p>

              <button
                type="button"
                onClick={() => setActiveTab("now")}
              >
                View Now Showing
              </button>
            </div>
          )}

          {/* Offers */}
          {activeTab === "offers" && (
            <div className="ns-movies-offer">
              <span>🎁</span>

              <div>
                <h3>Movie Ticket Special Offers</h3>
                <p>
                  Discover NearShop offers for your entertainment.
                </p>
              </div>

              <Link to="/customer/offers">
                View Offers
              </Link>
            </div>
          )}

        </section>

        {/* Benefits */}
        <section className="ns-movie-benefits">

          <div>
            <span>♧</span>
            <section>
              <strong>Easy Booking</strong>
              <p>Book in just a few clicks</p>
            </section>
          </div>

          <div>
            <span>%</span>
            <section>
              <strong>Best Offers</strong>
              <p>Exclusive movie ticket deals</p>
            </section>
          </div>

          <div>
            <span>▣</span>
            <section>
              <strong>Choose Your Seats</strong>
              <p>Select your preferred seats</p>
            </section>
          </div>

          <div>
            <span>♢</span>
            <section>
              <strong>Secure & Safe</strong>
              <p>Safe booking experience</p>
            </section>
          </div>

        </section>

        {/* Information Note */}
        <div className="ns-movies-note">
          <strong>Note:</strong> Movie details and posters are fetched
          from TMDB. Theatre names, locations and showtimes in this
          demonstration are sample data, not live cinema availability.
        </div>

      </main>

      {/* RIGHT SIDE BOOKING DRAWER */}
      {/* UPDATED RIGHT SIDE BOOKING DRAWER */}
      {selectedMovie && (
        <>
          <div
            className="ns-booking-overlay"
            onClick={closeBookingPanel}
          />

          <aside
            className="ns-booking-drawer ns-booking-drawer-new"
            aria-label="Movie theatre booking panel"
          >
            {/* Header */}
            <div className="ns-booking-drawer-header">
              <h2>Book Movie Tickets</h2>

              <button
                type="button"
                onClick={closeBookingPanel}
                aria-label="Close booking panel"
              >
                ✕
              </button>
            </div>

            {/* Movie details */}
            <div className="ns-drawer-movie">
              {selectedMovie.poster_path ? (
                <img
                  src={`${TMDB_IMAGE_URL}${selectedMovie.poster_path}`}
                  alt={selectedMovie.title}
                />
              ) : (
                <div className="ns-drawer-no-poster">🎬</div>
              )}

              <div className="ns-drawer-movie-info">
                <h3>{selectedMovie.title}</h3>

                <p>
                  Tamil
                  {selectedMovie.genre_ids?.length
                    ? " • " +
                    selectedMovie.genre_ids
                      .map((id) => genres[id])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join(" • ")
                    : ""}
                </p>

                <span>
                  ⭐ {selectedMovie.vote_average?.toFixed(1) || "N/A"}/10
                </span>
              </div>
            </div>

            <div className="ns-drawer-divider" />

            {/* City */}
            <div className="ns-drawer-section">
              <label htmlFor="drawer-city">Select City</label>

              <select
                id="drawer-city"
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedShow(null);
                }}
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Date selector */}
            <div className="ns-drawer-section">
              <label>Select Date</label>

              <div className="ns-drawer-date-list">
                {bookingDates.map((date) => (
                  <button
                    type="button"
                    key={date.value}
                    className={
                      selectedDate === date.value ? "active" : ""
                    }
                    onClick={() => {
                      setSelectedDate(date.value);
                      setSelectedShow(null);
                    }}
                  >
                    <span>{date.day}</span>
                    <strong>{date.number}</strong>
                    <small>{date.month}</small>
                  </button>
                ))}
              </div>
            </div>

            {/* Theatre and showtimes */}
            <div className="ns-drawer-section ns-drawer-theatre-section">
              <label>Select Theatre & Show Time</label>

              {getTheatresByCity(selectedCity).map((theatre) => (
                <div
                  className="ns-drawer-theatre ns-drawer-theatre-new"
                  key={theatre.name}
                >
                  <div className="ns-theatre-information">
                    <div className="ns-theatre-logo">
                      {theatre.name.toLowerCase().includes("pvr")
                        ? "PVR"
                        : theatre.name.toLowerCase().includes("inox")
                          ? "INOX"
                          : theatre.name.toLowerCase().includes("ags")
                            ? "AGS"
                            : "🎬"}
                    </div>

                    <div className="ns-theatre-details">
                      <h3>{theatre.name}</h3>
                      <p>{theatre.area}</p>
                      <small>📍 {theatre.address}</small>
                    </div>
                  </div>

                  <div className="ns-drawer-showtimes">
                    {theatre.times.map((time) => (
                      <button
                        type="button"
                        key={time}
                        className={
                          selectedShow?.theatre === theatre.name &&
                            selectedShow?.time === time
                            ? "selected"
                            : ""
                        }
                        onClick={() =>
                          handleShowSelection(
                            selectedMovie,
                            theatre,
                            time
                          )
                        }
                      >
                        <strong>{time}</strong>
                        <small>2D • Tamil</small>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected show */}
            {selectedShow && (
              <div className="ns-drawer-selected-show">
                <strong>Selected Show</strong>
                <p>{selectedShow.theatre}</p>
                <small>
                  {selectedShow.city} · {selectedShow.date} ·{" "}
                  {selectedShow.time}
                </small>
              </div>
            )}

            {/* Footer */}
            <div className="ns-drawer-footer">
              <button
                type="button"
                disabled={!selectedShow}
                onClick={continueToSeatSelection}
              >
                Continue to Seat Selection →
              </button>
            </div>

          </aside>
        </>
      )}

      <Common_Footer />
    </>
  );
};

export default Customer_Movie_Tickets;
