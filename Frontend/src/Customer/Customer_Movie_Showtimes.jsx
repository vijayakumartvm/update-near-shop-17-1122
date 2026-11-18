
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import Common_navbar from "../components/Navbar/Common_navbar";
import Common_Footer from "../components/Footer/Common_Footer";

import "./Customer_Movie_Showtimes.css";

const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w500";

/* =========================================
   DATE AND TIME HELPERS
========================================= */

const getLocalDateString = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const convertTimeToMinutes = (time) => {
  const [clock, period] = time.split(" ");
  let [hours, minutes] = clock.split(":").map(Number);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
};

const formatSelectedDate = (dateString) => {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* =========================================
   SAMPLE THEATRES BY CITY

   These are demonstration schedules.
   They are not live cinema availability.
========================================= */

const THEATRES_BY_CITY = {
  Chennai: [
    {
      name: "PVR Cinemas",
      area: "Velachery",
      address: "Phoenix Marketcity, Velachery Main Road, Chennai",
      shows: [
        { time: "12:20 PM", format: "4K DOLBY ATMOS", price: 180 },
        { time: "03:45 PM", format: "4K DOLBY 7.1", price: 180 },
        { time: "07:45 PM", format: "4K DOLBY ATMOS", price: 200 },
        { time: "10:30 PM", format: "4K DOLBY 7.1", price: 150 },
      ],
    },
    {
      name: "INOX",
      area: "Royapettah",
      address: "Express Avenue Mall, Royapettah, Chennai",
      shows: [
        { time: "12:40 PM", format: "4K DOLBY 7.1", price: 150 },
        { time: "04:00 PM", format: "4K DOLBY ATMOS", price: 200 },
        { time: "07:15 PM", format: "4K DOLBY 7.1", price: 180 },
        { time: "10:15 PM", format: "4K DOLBY 7.1", price: 150 },
      ],
    },
    {
      name: "AGS Cinemas",
      area: "T. Nagar",
      address: "AGS Cinemas, T. Nagar, Chennai",
      shows: [
        { time: "12:35 PM", format: "4K DOLBY 7.1", price: 150 },
        { time: "03:50 PM", format: "4K DOLBY 7.1", price: 180 },
        { time: "06:30 PM", format: "4K DOLBY ATMOS", price: 200 },
        { time: "09:30 PM", format: "4K DOLBY 7.1", price: 180 },
      ],
    },
  ],

  Tiruvannamalai: [
    {
      name: "Apsara Theatre",
      area: "Town Centre",
      address: "Apsara Theatre, Tiruvannamalai",
      shows: [
        { time: "10:00 AM", format: "2D", price: 120 },
        { time: "01:30 PM", format: "2D", price: 150 },
        { time: "04:30 PM", format: "2D", price: 150 },
        { time: "07:30 PM", format: "2D", price: 180 },
        { time: "10:00 PM", format: "2D", price: 120 },
      ],
    },
  ],

  Coimbatore: [
    {
      name: "Broadway Cinemas",
      area: "Peelamedu",
      address: "Broadway Cinemas, Coimbatore",
      shows: [
        { time: "10:00 AM", format: "2D", price: 150 },
        { time: "01:15 PM", format: "2D", price: 180 },
        { time: "04:30 PM", format: "2D", price: 180 },
        { time: "07:45 PM", format: "2D", price: 200 },
      ],
    },
    {
      name: "KG Cinemas",
      area: "Race Course",
      address: "KG Cinemas, Coimbatore",
      shows: [
        { time: "11:00 AM", format: "2D", price: 150 },
        { time: "02:30 PM", format: "2D", price: 180 },
        { time: "06:00 PM", format: "2D", price: 180 },
        { time: "09:30 PM", format: "2D", price: 200 },
      ],
    },
  ],

  Madurai: [
    {
      name: "INOX",
      area: "Vishaal de Mall",
      address: "INOX, Madurai",
      shows: [
        { time: "10:30 AM", format: "2D", price: 130 },
        { time: "01:45 PM", format: "2D", price: 150 },
        { time: "05:00 PM", format: "2D", price: 180 },
        { time: "08:30 PM", format: "2D", price: 180 },
      ],
    },
    {
      name: "Ambiga Cinemas",
      area: "Madurai",
      address: "Ambiga Cinemas, Madurai",
      shows: [
        { time: "11:00 AM", format: "2D", price: 120 },
        { time: "02:15 PM", format: "2D", price: 150 },
        { time: "06:00 PM", format: "2D", price: 150 },
        { time: "09:15 PM", format: "2D", price: 180 },
      ],
    },
  ],

  Tiruchirappalli: [
    {
      name: "LA Cinemas",
      area: "Trichy",
      address: "LA Cinemas, Tiruchirappalli",
      shows: [
        { time: "10:30 AM", format: "2D", price: 130 },
        { time: "01:30 PM", format: "2D", price: 150 },
        { time: "04:30 PM", format: "2D", price: 180 },
        { time: "07:45 PM", format: "2D", price: 180 },
      ],
    },
  ],

  Salem: [
    {
      name: "ARRS Multiplex",
      area: "Salem",
      address: "ARRS Multiplex, Salem",
      shows: [
        { time: "10:00 AM", format: "2D", price: 130 },
        { time: "01:15 PM", format: "2D", price: 150 },
        { time: "04:30 PM", format: "2D", price: 180 },
        { time: "07:45 PM", format: "2D", price: 180 },
      ],
    },
  ],
};

/* =========================================
   MAIN SHOWTIMES COMPONENT
========================================= */

const Customer_Movie_Showtimes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const booking = location.state || {};
  const movie = booking.movie || {};

  const movieTitle =
    booking.movieTitle || movie.title || "Selected Movie";

  const moviePoster =
    booking.moviePoster || movie.poster_path || "";

  const movieRuntime =
    booking.runtime || movie.runtime || null;

  /* Selected city from previous page */

  const city =
    String(
      booking.city ||
      booking.selectedCity ||
      "Chennai"
    ).trim();

  /* Match city without case sensitivity */

  const matchedCity = Object.keys(THEATRES_BY_CITY).find(
    (cityName) =>
      cityName.toLowerCase() === city.toLowerCase()
  );

  const cityTheatres = matchedCity
    ? THEATRES_BY_CITY[matchedCity]
    : [];

  const [selectedDate, setSelectedDate] = useState(
    booking.date || getLocalDateString()
  );

  const [language, setLanguage] = useState("Tamil");
  const [screenFormat, setScreenFormat] = useState("2D");
  const [sortBy, setSortBy] = useState("popular");
  const [priceRange, setPriceRange] = useState("all");
  const [selectedShow, setSelectedShow] = useState(null);

  /* =========================================
     NEXT 7 DAYS
  ========================================= */

  const dates = useMemo(() => {
    const today = new Date();

    today.setHours(12, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);

      date.setDate(today.getDate() + index);

      const value = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      return {
        value,

        weekday: date.toLocaleDateString("en-IN", {
          weekday: "short",
        }),

        day: date.getDate(),

        month: date.toLocaleDateString("en-IN", {
          month: "short",
        }),
      };
    });
  }, []);

  /* =========================================
     FILTER SHOWTIMES
  ========================================= */

  const filteredTheatres = useMemo(() => {
    const today = getLocalDateString();

    const now = new Date();

    const currentMinutes =
      now.getHours() * 60 + now.getMinutes();

    return cityTheatres.map((theatre) => {
      let shows = theatre.shows.filter((show) => {
        /* Hide passed shows only for today */

        if (selectedDate === today) {
          if (
            convertTimeToMinutes(show.time) <= currentMinutes
          ) {
            return false;
          }
        }

        /* Price filtering */

        if (priceRange === "100") {
          return show.price <= 100;
        }

        if (priceRange === "200") {
          return show.price > 100 && show.price <= 200;
        }

        if (priceRange === "300") {
          return show.price > 200 && show.price <= 300;
        }

        return true;
      });

      /* Sort by price */

      if (sortBy === "price-low") {
        shows = [...shows].sort(
          (a, b) => a.price - b.price
        );
      }

      if (sortBy === "price-high") {
        shows = [...shows].sort(
          (a, b) => b.price - a.price
        );
      }

      return {
        ...theatre,
        shows,
      };
    });
  }, [cityTheatres, selectedDate, priceRange, sortBy]);

  /* =========================================
     CLEAR FILTERS
  ========================================= */

  const clearFilters = () => {
    setLanguage("Tamil");
    setScreenFormat("2D");
    setSortBy("popular");
    setPriceRange("all");
    setSelectedShow(null);
  };

  /* =========================================
     SELECT SHOWTIME
  ========================================= */

  const selectShowtime = (theatre, show) => {
    setSelectedShow({
      movieId: id,

      movie,
      movieTitle,
      moviePoster,

      city,

      theatre: theatre.name,
      area: theatre.area,
      address: theatre.address,

      date: selectedDate,
      formattedDate: formatSelectedDate(selectedDate),

      time: show.time,
      price: show.price,

      format: screenFormat,
      language,

      cinemaFormat: show.format,
    });
  };

  /* =========================================
     CONTINUE TO SEAT SELECTION
  ========================================= */

  const continueToSeats = () => {
    if (!selectedShow) {
      alert("Please select a showtime first.");
      return;
    }

    navigate(`/customer/movie/${id}/booking`, {
      state: {
        ...booking,
        ...selectedShow,
      },
    });
  };

  /* =========================================
     BACK TO MOVIES
  ========================================= */

  const goBack = () => {
    navigate("/customer/movies");
  };

  /* =========================================
     POSTER URL
  ========================================= */

  const posterUrl = moviePoster
    ? moviePoster.startsWith("http")
      ? moviePoster
      : `${TMDB_IMAGE_URL}${moviePoster}`
    : "";

  /* =========================================
     UI
  ========================================= */

  return (
    <>
      <Common_navbar />

      <main className="ns-showtimes-page">

        {/* BREADCRUMB */}

        <div className="ns-showtimes-breadcrumb">
          <button type="button" onClick={goBack}>
            Home
          </button>

          <span>›</span>

          <button type="button" onClick={goBack}>
            Movies
          </button>

          <span>›</span>

          <strong>{movieTitle}</strong>

          <span>›</span>

          <strong>Showtimes</strong>
        </div>

        {/* MAIN LAYOUT */}

        <section className="ns-showtimes-layout">

          {/* LEFT MOVIE POSTER */}

          <aside className="ns-showtimes-poster">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={movieTitle}
              />
            ) : (
              <div className="ns-showtimes-no-poster">
                🎬
              </div>
            )}
          </aside>

          {/* RIGHT CONTENT */}

          <div className="ns-showtimes-content">

            {/* MOVIE HEADER */}

            <div className="ns-showtimes-movie-header">

              <div>
                <h1>{movieTitle}</h1>

                <p>
                  {language} &nbsp;•&nbsp;
                  {screenFormat} &nbsp;•&nbsp;

                  {movieRuntime
                    ? `${Math.floor(movieRuntime / 60)}h ${
                        movieRuntime % 60
                      }m`
                    : "Movie runtime"}
                </p>

                <p>
                  <strong>Selected City:</strong> {city}
                </p>
              </div>

              <span className="ns-showtimes-rating">
                ⭐ {(movie.vote_average || 0).toFixed(1)}/10
              </span>

            </div>

            {/* DATE SELECTION */}

            <div className="ns-showtimes-date-list">

              {dates.map((date) => (
                <button
                  type="button"
                  key={date.value}
                  className={
                    selectedDate === date.value
                      ? "active"
                      : ""
                  }
                  onClick={() => {
                    setSelectedDate(date.value);
                    setSelectedShow(null);
                  }}
                >
                  <span>{date.weekday}</span>

                  <strong>{date.day}</strong>

                  <small>{date.month}</small>
                </button>
              ))}

            </div>

            {/* FILTERS */}

            <div className="ns-showtimes-filters">

              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  setSelectedShow(null);
                }}
              >
                <option value="Tamil">Tamil</option>
                <option value="English">English</option>
                <option value="Telugu">Telugu</option>
                <option value="Hindi">Hindi</option>
              </select>

              <select
                value={screenFormat}
                onChange={(e) => {
                  setScreenFormat(e.target.value);
                  setSelectedShow(null);
                }}
              >
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="IMAX">IMAX</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                }}
              >
                <option value="popular">
                  Sort by: Popularity
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>
              </select>

              <button
                type="button"
                className={
                  priceRange === "100" ? "active" : ""
                }
                onClick={() => {
                  setPriceRange(
                    priceRange === "100" ? "all" : "100"
                  );
                  setSelectedShow(null);
                }}
              >
                ₹0 – ₹100
              </button>

              <button
                type="button"
                className={
                  priceRange === "200" ? "active" : ""
                }
                onClick={() => {
                  setPriceRange(
                    priceRange === "200" ? "all" : "200"
                  );
                  setSelectedShow(null);
                }}
              >
                ₹101 – ₹200
              </button>

              <button
                type="button"
                className={
                  priceRange === "300" ? "active" : ""
                }
                onClick={() => {
                  setPriceRange(
                    priceRange === "300" ? "all" : "300"
                  );
                  setSelectedShow(null);
                }}
              >
                ₹201 – ₹300
              </button>

              <button
                type="button"
                className="ns-showtimes-clear"
                onClick={clearFilters}
              >
                Clear Filters
              </button>

            </div>

            {/* THEATRE LIST */}

            <div className="ns-showtimes-theatre-list">

              {filteredTheatres.length === 0 ? (

                <div className="ns-showtimes-empty">
                  <h3>No sample theatres available</h3>

                  <p>
                    Theatre information is not available for {city} yet.
                  </p>
                </div>

              ) : (

                filteredTheatres.map((theatre) => (

                  <article
                    className="ns-showtimes-theatre"
                    key={theatre.name}
                  >

                    {/* THEATRE INFORMATION */}

                    <div className="ns-showtimes-theatre-info">

                      <h3>{theatre.name}</h3>

                      <strong>{theatre.area}</strong>

                      <p>
                        📍 {theatre.address}
                      </p>

                    </div>

                    {/* SHOWTIME BUTTONS */}

                    <div className="ns-showtimes-slots">

                      {theatre.shows.length === 0 ? (

                        <p className="ns-showtimes-empty">

                          {selectedDate === getLocalDateString()
                            ? "No upcoming showtimes available today."
                            : "No showtimes available in this price range."}

                        </p>

                      ) : (

                        theatre.shows.map((show) => (

                          <button
                            type="button"
                            key={`${theatre.name}-${show.time}`}
                            className={
                              selectedShow?.theatre === theatre.name &&
                              selectedShow?.time === show.time &&
                              selectedShow?.date === selectedDate
                                ? "selected"
                                : ""
                            }
                            onClick={() =>
                              selectShowtime(theatre, show)
                            }
                          >

                            <strong>{show.time}</strong>

                            <small>{show.format}</small>

                            <small>₹{show.price}</small>

                          </button>

                        ))

                      )}

                    </div>

                  </article>

                ))

              )}

            </div>

            {/* SELECTED SHOWTIME */}

            {selectedShow && (

              <div className="ns-showtimes-selected">

                <div>

                  <strong>Selected Showtime</strong>

                  <p>
                    {selectedShow.theatre} · {selectedShow.time}
                  </p>

                  <small>
                    {selectedShow.city} ·{" "}
                    {selectedShow.formattedDate}
                  </small>

                  <p>
                    Ticket Price: ₹{selectedShow.price}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={continueToSeats}
                >
                  Continue to Seat Selection →
                </button>

              </div>

            )}

          </div>

        </section>

        {/* DEMO INFORMATION */}

        <p className="ns-showtimes-demo-note">
          Sample theatre and showtime data is displayed for
          demonstration. Live cinema availability is not connected.
        </p>

      </main>

      <Common_Footer />
    </>
  );
};

export default Customer_Movie_Showtimes;
