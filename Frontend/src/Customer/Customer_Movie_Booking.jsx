
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";

import Common_navbar from "../components/Navbar/Common_navbar";
import Common_Footer from "../components/Footer/Common_Footer";

import "./Customer_Movie_Booking.css";

const API_URL = "http://localhost:5000/api/movies";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

const ROWS = "ABCDEFGHIJK".split("");

const SEAT_GROUPS = [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10, 11, 12, 13],
  [14, 15, 16, 17, 18],
];

// Demo booked seats only
const BOOKED_SEATS = [
  "A3", "A4", "A12", "A13",
  "C6", "C7", "C8", "C9", "C10",
  "F8", "F9", "F10", "F11",
  "H3", "H4", "H5",
];

const CONVENIENCE_FEE_PER_SEAT = 20;

const SEAT_CATEGORIES = {
  A: { name: "VIP Sofa", price: 230 },
  B: { name: "Prime", price: 180 },
  C: { name: "Prime", price: 180 },
  D: { name: "Prime", price: 180 },
  E: { name: "Classic", price: 150 },
  F: { name: "Classic", price: 150 },
  G: { name: "Classic", price: 150 },
  H: { name: "Classic", price: 150 },
  I: { name: "Classic", price: 150 },
  J: { name: "Lounger", price: 180 },
  K: { name: "Lounger", price: 180 },
};

const CATEGORY_STARTS = {
  A: "VIP SOFA",
  B: "PRIME",
  E: "CLASSIC",
  J: "LOUNGER",
};

export default function Customer_Movie_Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Booking details received from the Showtimes page
  const bookingDetails = location.state || {};

  const [movie, setMovie] = useState(bookingDetails.movie || null);
  const [movieLoading, setMovieLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [error, setError] = useState("");

  const selectedCity = bookingDetails.city || "City not selected";
  const selectedTheatre =
    bookingDetails.theatre || "Theatre not selected";
  const selectedAddress = bookingDetails.address || "";
  const selectedDate = bookingDetails.date || "";
  const selectedShowtime = bookingDetails.time || "Time not selected";
  const selectedFormat =
    bookingDetails.format || bookingDetails.cinemaFormat || "2D";
  const selectedLanguage = bookingDetails.language || "Tamil";

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setMovieLoading(true);
        setError("");

        // Use the movie already received from the previous page
        if (bookingDetails.movie) {
          setMovie(bookingDetails.movie);
          return;
        }

        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
          throw new Error("Unable to load movie details");
        }

        const data = await response.json();
        setMovie(data);
      } catch (err) {
        console.error("Movie details error:", err);
        setError("Movie details could not be loaded.");
      } finally {
        setMovieLoading(false);
      }
    };

    if (id) {
      fetchMovie();
    } else {
      setMovieLoading(false);
    }
  }, [id]);

  const getSeatCategory = (seatId) => {
    const row = seatId.charAt(0);
    return SEAT_CATEGORIES[row];
  };

  // Calculate ticket price
  const ticketTotal = selectedSeats.reduce((total, seatId) => {
    return total + getSeatCategory(seatId).price;
  }, 0);

  // Convenience fee
  const convenienceFee =
    selectedSeats.length * CONVENIENCE_FEE_PER_SEAT;

  const totalAmount = ticketTotal + convenienceFee;

  const selectedSeatText = useMemo(
    () => selectedSeats.slice().sort().join(", "),
    [selectedSeats]
  );

  // Select or unselect seats
  const toggleSeat = (seatId) => {
    if (BOOKED_SEATS.includes(seatId)) return;

    setSelectedSeats((current) => {
      if (current.includes(seatId)) {
        return current.filter((seat) => seat !== seatId);
      }

      if (current.length >= 8) {
        alert("You can select a maximum of 8 seats.");
        return current;
      }

      return [...current, seatId];
    });
  };

  // Continue directly to Payment

  const handlePayment = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }

    const booking = {
      ...bookingDetails,

      // Movie details
      movieId: id,
      movie: movie,
      movieTitle:
        movie?.title ||
        bookingDetails.movieTitle ||
        "Movie",
      moviePoster:
        movie?.poster_path ||
        bookingDetails.moviePoster ||
        "",

      // Theatre details
      city: selectedCity,
      theatre: selectedTheatre,
      address: selectedAddress,

      // Showtime details
      date: selectedDate,
      time: selectedShowtime,
      format: selectedFormat,
      language: selectedLanguage,

      // Selected seats
      seats: [...selectedSeats],

      // Payment calculation
      ticketTotal: ticketTotal,
      convenienceFee: convenienceFee,
      totalAmount: totalAmount,
    };

    console.log("Booking details sent to payment:", booking);

    navigate(`/customer/movie/${id}/payment`, {
      state: booking,
    });
  };


  const poster = movie?.poster_path
    ? `${IMAGE_URL}${movie.poster_path}`
    : bookingDetails.moviePoster
      ? `${IMAGE_URL}${bookingDetails.moviePoster}`
      : "";

  const formatBookingDate = (date) => {
    if (!date) return "Date not selected";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <>
      <Common_navbar />

      <main className="ns-seat-booking-page">

        {/* Top navigation */}
        <div className="ns-booking-topbar">
          <Link to="/customer/movies" className="ns-back-movies">
            ← Movie Tickets
          </Link>

          {/* Food step removed */}
          <div className="ns-booking-steps">
            <span className="ns-step active">
              <b>1</b> Select Seats
            </span>

            <span className="ns-step-line" />

            <span className="ns-step">
              <b>2</b> Payment
            </span>
          </div>
        </div>

        {movieLoading ? (
          <div className="ns-booking-message">
            Loading movie details...
          </div>
        ) : error ? (
          <div className="ns-booking-message ns-booking-error">
            {error}
          </div>
        ) : (
          <div className="ns-booking-layout">

            <section className="ns-booking-main">

              {/* Movie and theatre details */}
              <div className="ns-booking-movie-card">

                {poster ? (
                  <img src={poster} alt={movie?.title || "Movie"} />
                ) : (
                  <div className="ns-booking-poster-placeholder">
                    🎬
                  </div>
                )}

                <div className="ns-booking-movie-details">
                  <h1>
                    {movie?.title || bookingDetails.movieTitle || "Movie"}
                  </h1>

                  <p>
                    {selectedLanguage}
                    <span> • </span>
                    {movie?.genres
                      ?.map((genre) => genre.name)
                      .slice(0, 2)
                      .join(" • ") || "Movie"}
                  </p>

                  <div className="ns-booking-meta">
                    <span>📍 {selectedCity}</span>
                    <span>🎬 {selectedTheatre}</span>
                    <span>📅 {formatBookingDate(selectedDate)}</span>
                    <span>🕒 {selectedShowtime}</span>
                    <span>🎞️ {selectedFormat}</span>
                  </div>

                  {selectedAddress && (
                    <p className="ns-booking-address">
                      {selectedAddress}
                    </p>
                  )}
                </div>
              </div>

              {/* Seat selection */}
              <div className="ns-seat-map-card">

                <div className="ns-seat-map-heading">
                  <h2>Select Your Seats</h2>
                  <p>Choose your preferred seats</p>
                </div>

                {/* Category prices */}
                <div className="ns-seat-category-list">

                  <div className="ns-seat-category vip">
                    <strong>VIP SOFA</strong>
                    <span>₹230</span>
                  </div>

                  <div className="ns-seat-category prime">
                    <strong>PRIME</strong>
                    <span>₹180</span>
                  </div>

                  <div className="ns-seat-category classic">
                    <strong>CLASSIC</strong>
                    <span>₹150</span>
                  </div>

                  <div className="ns-seat-category lounger">
                    <strong>LOUNGER</strong>
                    <span>₹180</span>
                  </div>

                </div>

                {/* Screen */}
                <div className="ns-screen">
                  <span>SCREEN THIS WAY</span>
                </div>

                {/* Seat rows */}
                <div className="ns-seat-map">

                  {ROWS.map((row) => (
                    <React.Fragment key={row}>

                      {CATEGORY_STARTS[row] && (
                        <div className="ns-seat-category-heading">
                          <span>{CATEGORY_STARTS[row]}</span>
                          <i />
                        </div>
                      )}

                      <div className="ns-seat-row">

                        <strong className="ns-row-label">
                          {row}
                        </strong>

                        {SEAT_GROUPS.map((group, groupIndex) => (
                          <div
                            className="ns-seat-group"
                            key={groupIndex}
                          >
                            {group.map((number) => {
                              const seatId = `${row}${number}`;
                              const isBooked =
                                BOOKED_SEATS.includes(seatId);
                              const isSelected =
                                selectedSeats.includes(seatId);

                              return (
                                <button
                                  type="button"
                                  key={seatId}
                                  className={[
                                    "ns-seat",
                                    isBooked ? "booked" : "",
                                    isSelected ? "selected" : "",
                                  ].join(" ")}
                                  disabled={isBooked}
                                  aria-label={`Row ${row}, seat ${number}`}
                                  aria-pressed={isSelected}
                                  onClick={() => toggleSeat(seatId)}
                                >
                                  {isBooked ? "×" : number}
                                </button>
                              );
                            })}
                          </div>
                        ))}

                      </div>
                    </React.Fragment>
                  ))}

                </div>

                {/* Screen label */}
                <div className="ns-screen-bottom">
                  SCREEN THIS WAY
                </div>

                {/* Seat legend */}
                <div className="ns-seat-legend">
                  <span>
                    <i className="available" />
                    Available
                  </span>

                  <span>
                    <i className="booked" />
                    Occupied
                  </span>

                  <span>
                    <i className="selected" />
                    Selected
                  </span>
                </div>

                <div className="ns-seat-selection-count">
                  Selected Seats:
                  <strong>{selectedSeats.length}</strong>
                </div>

              </div>
            </section>

            {/* Booking summary */}
            <aside className="ns-booking-summary">

              <h2>Booking Summary</h2>

              <div className="ns-summary-movie">
                {poster ? (
                  <img src={poster} alt={movie?.title || "Movie"} />
                ) : (
                  <div className="ns-summary-poster-placeholder">
                    🎬
                  </div>
                )}

                <div>
                  <h3>
                    {movie?.title || bookingDetails.movieTitle || "Movie"}
                  </h3>
                  <p>{selectedCity}</p>
                  <p>{selectedTheatre}</p>
                  <p>{formatBookingDate(selectedDate)}</p>
                  <p>{selectedShowtime}</p>
                  <p>{selectedLanguage} • {selectedFormat}</p>
                </div>
              </div>

              <div className="ns-summary-section">

                <div className="ns-summary-label">
                  Selected Seats ({selectedSeats.length})
                </div>

                <div className="ns-summary-row">
                  <strong>
                    {selectedSeatText || "No seats selected"}
                  </strong>

                  <strong>₹{ticketTotal.toFixed(2)}</strong>
                </div>

                {selectedSeats.length > 0 && (
                  <div className="ns-selected-seat-prices">
                    {selectedSeats.map((seatId) => (
                      <div key={seatId}>
                        <span>
                          {seatId} - {getSeatCategory(seatId).name}
                        </span>
                        <span>
                          ₹{getSeatCategory(seatId).price}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="ns-summary-row ns-fee-row">
                <span>Convenience Fee</span>
                <span>₹{convenienceFee.toFixed(2)}</span>
              </div>

              <div className="ns-summary-total">
                <strong>Total Amount</strong>
                <strong>₹{totalAmount.toFixed(2)}</strong>
              </div>

              <button
                type="button"
                className="ns-proceed-payment"
                onClick={handlePayment}
              >
                Continue to Payment →
              </button>

              <p className="ns-summary-note">
                Demo seat availability and showtimes.
                Live cinema seat booking is not connected yet.
              </p>

            </aside>
          </div>
        )}

      </main>

      <Common_Footer />
    </>
  );
}
