
import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import {
  Ticket,
  MapPin,
  CalendarDays,
  Clock,
  Armchair,
  IndianRupee,
  CircleAlert,
  Eye,
  Film,
  ArrowLeft,
  Clapperboard,
  X,
} from "lucide-react";

import Common_navbar from "../components/Navbar/Common_navbar";
import Common_Footer from "../components/Footer/Common_Footer";
import "./Customer_My_Tickets.css";

const STORAGE_KEY = "nearshopMovieTickets";

function readTickets() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  // Avoid timezone shifting for YYYY-MM-DD values.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getMovieName(ticket) {
  return (
    ticket.movieTitle ||
    ticket.title ||
    ticket.movieName ||
    ticket.movie?.title ||
    "Movie Booking"
  );
}

function getPoster(ticket) {
  const poster =
    ticket.poster ||
    ticket.posterUrl ||
    ticket.poster_path ||
    ticket.moviePoster ||
    ticket.movie?.poster_path ||
    "";

  if (!poster) return "";

  if (poster.startsWith("http")) return poster;

  return `https://image.tmdb.org/t/p/w500${poster}`;
}

function getSeats(ticket) {
  if (Array.isArray(ticket.seats)) {
    return ticket.seats.join(", ");
  }

  return ticket.seats || ticket.selectedSeats || "Not available";
}

function getAmount(ticket) {
  return Number(
    ticket.totalAmount ??
    ticket.ticketTotal ??
    ticket.total ??
    0
  );
}

export default function Customer_My_Tickets() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const refreshTickets = () => setTickets(readTickets());

    refreshTickets();

    window.addEventListener("storage", refreshTickets);
    window.addEventListener("focus", refreshTickets);

    return () => {
      window.removeEventListener("storage", refreshTickets);
      window.removeEventListener("focus", refreshTickets);
    };
  }, []);

  return (
    <div className="ns-my-tickets-page">
      <Common_navbar />

      <main className="ns-my-tickets-main">
        <section className="ns-tickets-heading">
          <div>
            <span className="ns-tickets-eyebrow">
              <Clapperboard size={16} />
              NEARSHOP ENTERTAINMENT
            </span>

            <h1>My Movie Tickets</h1>

            <p>
              View your movie booking details in one place.
            </p>
          </div>

          <button
            className="ns-tickets-back-btn"
            onClick={() => navigate("/customer/movies")}
          >
            <ArrowLeft size={17} />
            Browse Movies
          </button>
        </section>

        <div className="ns-tickets-summary">
          <div className="ns-tickets-summary-icon">
            <Ticket size={25} />
          </div>

          <div>
            <strong>{tickets.length}</strong>
            <span>
              {tickets.length === 1 ? "Movie Booking" : "Movie Bookings"}
            </span>
          </div>
        </div>

        {tickets.length === 0 ? (
          <section className="ns-tickets-empty">
            <div className="ns-tickets-empty-icon">
              <Film size={45} />
            </div>

            <h2>No movie tickets yet</h2>

            <p>
              Your movie bookings will appear here after you complete
              the booking process.
            </p>

            <button
              onClick={() => navigate("/customer/movies")}
            >
              Explore Movies
            </button>
          </section>
        ) : (
          <section className="ns-tickets-list">
            {tickets.map((ticket, index) => {
              const poster = getPoster(ticket);
              const movieName = getMovieName(ticket);
              const ticketId =
                ticket.ticketId || `movie-ticket-${index}`;

              const amount = getAmount(ticket);
              const seats = getSeats(ticket);

              const isConfirmed =
                ticket.bookingStatus === "Confirmed" &&
                ticket.paymentStatus === "paid";

              return (
                <article
                  className="ns-ticket-card"
                  key={ticketId}
                >
                  <div className="ns-ticket-poster">
                    {poster ? (
                      <img src={poster} alt={movieName} />
                    ) : (
                      <div className="ns-ticket-poster-placeholder">
                        <Film size={40} />
                        <span>NEARSHOP</span>
                      </div>
                    )}
                  </div>

                  <div className="ns-ticket-content">
                    <div className="ns-ticket-top">
                      <div>
                        <span className="ns-ticket-label">
                          MOVIE BOOKING
                        </span>
                        <h2>{movieName}</h2>
                      </div>

                      <span
                        className={
                          isConfirmed
                            ? "ns-ticket-status confirmed"
                            : "ns-ticket-status demo"
                        }
                      >
                        {isConfirmed ? (
                          <Ticket size={15} />
                        ) : (
                          <CircleAlert size={15} />
                        )}

                        {isConfirmed
                          ? "Confirmed"
                          : "Demo - Not Confirmed"}
                      </span>
                    </div>

                    <div className="ns-ticket-details">
                      <div>
                        <MapPin size={18} />
                        <span>
                          {ticket.theatre || ticket.theater || "Theatre unavailable"}
                          {ticket.city ? `, ${ticket.city}` : ""}
                        </span>
                      </div>

                      <div>
                        <CalendarDays size={18} />
                        <span>{formatDate(ticket.date)}</span>
                      </div>

                      <div>
                        <Clock size={18} />
                        <span>{ticket.time || ticket.showtime || "Time unavailable"}</span>
                      </div>

                      <div>
                        <Armchair size={18} />
                        <span>Seats: {seats}</span>
                      </div>

                      <div>
                        <IndianRupee size={18} />
                        <span>Total: ₹{amount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="ns-ticket-bottom">
                      <span className="ns-ticket-booking-id">
                        Booking: {ticket.ticketId || "Demo booking"}
                      </span>

                      <button
                        className="ns-ticket-view-btn"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <Eye size={17} />
                        View Ticket
                      </button>
                    </div>

                    {!isConfirmed && (
                      <div className="ns-ticket-warning">
                        <CircleAlert size={17} />
                        <span>
                          This is a demo booking. Payment was not processed
                          and your movie ticket is not confirmed.
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>

      {selectedTicket && (
        <div
          className="ns-ticket-modal-overlay"
          onClick={() => setSelectedTicket(null)}
        >
          <section
            className="ns-ticket-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="ns-ticket-modal-close"
              onClick={() => setSelectedTicket(null)}
              aria-label="Close ticket"
            >
              <X size={21} />
            </button>

            <div className="ns-ticket-modal-heading">
              <Ticket size={30} />
              <h2>Movie Ticket Details</h2>
              <p>{getMovieName(selectedTicket)}</p>
            </div>

            <div className="ns-ticket-modal-info">
              <div>
                <span>City</span>
                <strong>{selectedTicket.city || "Not available"}</strong>
              </div>

              <div>
                <span>Theatre</span>
                <strong>
                  {selectedTicket.theatre ||
                    selectedTicket.theater ||
                    "Not available"}
                </strong>
              </div>

              <div>
                <span>Date</span>
                <strong>{formatDate(selectedTicket.date)}</strong>
              </div>

              <div>
                <span>Showtime</span>
                <strong>
                  {selectedTicket.time ||
                    selectedTicket.showtime ||
                    "Not available"}
                </strong>
              </div>

              <div>
                <span>Selected Seats</span>
                <strong>{getSeats(selectedTicket)}</strong>
              </div>

              <div>
                <span>Total Amount</span>
                <strong>₹{getAmount(selectedTicket).toFixed(2)}</strong>
              </div>
            </div>

            <div className="ns-ticket-modal-warning">
              <CircleAlert size={19} />
              <span>
                {selectedTicket.bookingStatus === "Confirmed" &&
                selectedTicket.paymentStatus === "paid"
                  ? "Payment verified and booking confirmed."
                  : "Demo only: payment was not processed. This is not a valid cinema entry ticket."}
              </span>
            </div>

            <button
              className="ns-ticket-modal-done"
              onClick={() => setSelectedTicket(null)}
            >
              Close
            </button>
          </section>
        </div>
      )}

      <Common_Footer />
    </div>
  );
}
