import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    CheckCircle2,
    CircleAlert,
    MapPin,
    CalendarDays,
    Clock,
    Armchair,
    Ticket,
    Download,
    Home,
    Film,
} from "lucide-react";

import Common_navbar from "../components/Navbar/Common_navbar";
import Common_Footer from "../components/Footer/Common_Footer";
import "./Customer_Movie_Confirmation.css";

export default function Customer_Movie_Confirmation() {
    const location = useLocation();
    const navigate = useNavigate();

    const booking = location.state || {};

    useEffect(() => {
        if (!location.state) return;

        try {
            const savedTickets = JSON.parse(
                localStorage.getItem("nearShopMovieTickets") || "[]"
            );

            const seats = Array.isArray(booking.seats)
                ? booking.seats
                : [booking.seats || ""];

            const ticketId = [
                booking.movieId || booking.id || booking.movieTitle,
                booking.date,
                booking.time || booking.showtime,
                ...seats,
            ].join("-");

            const alreadySaved = savedTickets.some(
                (ticket) => ticket.ticketId === ticketId
            );

            if (!alreadySaved) {
                localStorage.setItem(
                    "nearShopMovieTickets",
                    JSON.stringify([
                        ...savedTickets,
                        {
                            ...booking,
                            ticketId,
                            bookingDate: new Date().toISOString(),
                            bookingStatus: "Demo - Not Confirmed",
                        },
                    ])
                );
            }
        } catch (error) {
            console.error("Unable to save movie booking:", error);
        }
    }, [location.state]);

    const movieName =
        booking.movieTitle ||
        booking.title ||
        booking.movieName ||
        "Movie Booking";

    const posterValue =
        booking.poster ||
        booking.posterUrl ||
        booking.poster_path ||
        booking.moviePoster ||
        "";

    const poster = posterValue
        ? posterValue.startsWith("http")
            ? posterValue
            : `https://image.tmdb.org/t/p/w500${posterValue}`
        : "";

    const seats = Array.isArray(booking.seats)
        ? booking.seats.join(", ")
        : booking.seats || "Not available";

    const ticketTotal = Number(booking.ticketTotal || 0);
    const convenienceFee = Number(booking.convenienceFee || 0);
    const gstAmount = Number(booking.gstAmount || 0);

    const totalAmount = Number(
        booking.totalAmount ||
        ticketTotal + convenienceFee + gstAmount
    );

    // Only backend-verified payment should produce a confirmed ticket.
    const isConfirmed =
        booking.paymentStatus === "paid" &&
        booking.bookingStatus === "Confirmed";

    const bookingId =
        booking.bookingId ||
        booking.ticketId ||
        "DEMO-BOOKING";

    function formatDate(value) {
        if (!value) return "Not available";

        const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
            ? new Date(`${value}T00:00:00`)
            : new Date(value);

        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    }

    function downloadTicket() {
        const ticketText = [
            "NEARSHOP MOVIE TICKET",
            "================================",
            `Movie: ${movieName}`,
            `City: ${booking.city || "Not available"}`,
            `Theatre: ${booking.theatre || booking.theater || "Not available"}`,
            `Date: ${formatDate(booking.date)}`,
            `Showtime: ${booking.time || booking.showtime || "Not available"}`,
            `Seats: ${seats}`,
            `Booking ID: ${bookingId}`,
            `Total: Rs. ${totalAmount.toFixed(2)}`,
            `Status: ${isConfirmed ? "Confirmed" : "DEMO - NOT CONFIRMED"}`,
            "",
            isConfirmed
                ? "Payment verified."
                : "Demo only. Payment was not processed. This is not a valid cinema entry ticket.",
        ].join("\n");

        const file = new Blob([ticketText], {
            type: "text/plain;charset=utf-8",
        });

        const url = URL.createObjectURL(file);
        const link = document.createElement("a");

        link.href = url;
        link.download = `NearShop-Movie-Ticket-${bookingId}.txt`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    }

    return (
        <div className="ns-confirm-ticket-page">
            <Common_navbar />

            <main className="ns-confirm-ticket-main">
                <div className="ns-confirm-ticket-watermark">
                    {isConfirmed ? "CONFIRMED TICKET" : "DEMO TICKET"}
                </div>

                <section className="ns-confirm-ticket-header">
                    <span className="ns-confirm-ticket-eyebrow">
                        <Ticket size={17} />
                        NEARSHOP MOVIE BOOKING
                    </span>

                    <h1>
                        {isConfirmed ? "Confirmed Ticket" : "Movie Booking Result"}
                    </h1>

                    <p>
                        {isConfirmed
                            ? "Your movie booking has been confirmed."
                            : "Your demo booking details are shown below."}
                    </p>
                </section>

                <section className="ns-confirm-ticket-card">
                    <div className="ns-confirm-ticket-left">
                        <div
                            className={
                                isConfirmed
                                    ? "ns-confirm-ticket-symbol success"
                                    : "ns-confirm-ticket-symbol demo"
                            }
                        >
                            {isConfirmed ? (
                                <CheckCircle2 size={86} strokeWidth={2.5} />
                            ) : (
                                <CircleAlert size={86} strokeWidth={2.2} />
                            )}
                        </div>

                        <h2>
                            {isConfirmed
                                ? "Your Booking Is Confirmed!"
                                : "Demo Booking Created"}
                        </h2>

                        <p>
                            {isConfirmed
                                ? "Your payment has been verified. Keep your ticket details ready at the theatre."
                                : "Payment has NOT been processed. No money was charged and your movie ticket is not confirmed."}
                        </p>

                        <span
                            className={
                                isConfirmed
                                    ? "ns-confirm-ticket-status success"
                                    : "ns-confirm-ticket-status demo"
                            }
                        >
                            {isConfirmed ? "PAYMENT VERIFIED" : "DEMO - NOT CONFIRMED"}
                        </span>
                    </div>

                    <div className="ns-confirm-ticket-divider" />

                    <div className="ns-confirm-ticket-right">
                        <div className="ns-confirm-ticket-movie">
                            <div className="ns-confirm-ticket-poster">
                                {poster ? (
                                    <img src={poster} alt={movieName} />
                                ) : (
                                    <div>
                                        <Film size={38} />
                                        <span>NEARSHOP</span>
                                    </div>
                                )}
                            </div>

                            <div className="ns-confirm-ticket-movie-info">
                                <span className="ns-confirm-ticket-small-label">
                                    MOVIE DETAILS
                                </span>

                                <h3>{movieName}</h3>

                                <p>
                                    {booking.language || "Tamil"}{" "}
                                    {booking.screenFormat
                                        ? `• ${booking.screenFormat}`
                                        : ""}
                                </p>

                                <p>
                                    <MapPin size={14} />
                                    {booking.theatre ||
                                        booking.theater ||
                                        "Theatre unavailable"}
                                    {booking.city ? `, ${booking.city}` : ""}
                                </p>

                                <p>
                                    <CalendarDays size={14} />
                                    {formatDate(booking.date)}
                                </p>

                                <p>
                                    <Clock size={14} />
                                    {booking.time || booking.showtime || "Time unavailable"}
                                </p>

                                <p>
                                    <Armchair size={14} />
                                    Seats: {seats}
                                </p>
                            </div>
                        </div>

                        <div className="ns-confirm-ticket-qr-area">
                            <div className="ns-confirm-ticket-qr-placeholder">
                                {isConfirmed ? (
                                    <div className="ns-confirm-ticket-qr-pending">
                                        <Ticket size={45} />
                                        <span>Verified ticket QR will appear here</span>
                                    </div>
                                ) : (
                                    <div className="ns-confirm-ticket-qr-pending">
                                        <CircleAlert size={45} />
                                        <span>No valid entry QR for demo bookings</span>
                                    </div>
                                )}
                            </div>

                            <span className="ns-confirm-ticket-qr-caption">
                                {isConfirmed
                                    ? "Ticket verification"
                                    : "QR code unavailable for demo"}
                            </span>
                        </div>

                        <div className="ns-confirm-ticket-reference">
                            <span>BOOKING REFERENCE</span>
                            <strong>{bookingId}</strong>
                        </div>

                        <div className="ns-confirm-ticket-total">
                            <span>Total Amount</span>
                            <strong>₹{totalAmount.toFixed(2)}</strong>
                        </div>
                    </div>
                </section>

                <div className="ns-confirm-ticket-actions">
                    <button
                        className="ns-confirm-ticket-download"
                        onClick={downloadTicket}
                    >
                        <Download size={18} />
                        Download Ticket Details
                    </button>

                    <button
                        className="ns-confirm-ticket-my-tickets"
                        onClick={() => navigate("/customer/my-tickets")}
                    >
                        <Ticket size={18} />
                        My Tickets
                    </button>

                    <button
                        className="ns-confirm-ticket-home"
                        onClick={() => navigate("/customer/movies")}
                    >
                        <Home size={18} />
                        Browse Movies
                    </button>
                </div>
            </main>

            <Common_Footer />
        </div>
    );
}
