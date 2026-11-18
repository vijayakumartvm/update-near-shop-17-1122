
import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Smartphone,
  CreditCard,
  Building2,
  Wallet,
  ShieldCheck,
  MapPin,
  CalendarDays,
  Clock3,
  Ticket,
  LockKeyhole,
  CheckCircle2,
  Banknote,
  Info,
  Home,
  Film,
  QrCode,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

import Common_navbar from "../components/Navbar/Common_navbar";
import Common_Footer from "../components/Footer/Common_Footer";
import "./Customer_Movie_Payment.css";

const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w500";

const PAYMENT_METHODS = [
  {
    id: "upi",
    icon: Smartphone,
    title: "UPI",
    subtitle: "Pay with any UPI app",
  },
  {
    id: "card",
    icon: CreditCard,
    title: "Debit / Credit Card",
    subtitle: "Visa, Mastercard, RuPay",
  },
  {
    id: "netbanking",
    icon: Building2,
    title: "Net Banking",
    subtitle: "All major banks",
  },
  {
    id: "wallet",
    icon: Wallet,
    title: "Wallet",
    subtitle: "Paytm, PhonePe & more",
  },
];

export default function Customer_Movie_Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const booking = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");

  // Movie details
  const movieTitle =
    booking.movieTitle || booking.movie?.title || "Selected Movie";

  const posterPath =
    booking.moviePoster || booking.movie?.poster_path || "";

  const poster = posterPath
    ? posterPath.startsWith("http")
      ? posterPath
      : `${TMDB_IMAGE_URL}${posterPath}`
    : "";

  const city = booking.city || "Not selected";
  const theatre = booking.theatre || "Not selected";
  const address = booking.address || "";
  const date = booking.date || "";
  const time = booking.time || "Not selected";
  const language = booking.language || "Tamil";
  const format = booking.format || booking.cinemaFormat || "2D";

  // Selected seats
  const seats = Array.isArray(booking.seats)
    ? booking.seats
    : booking.seats
      ? [booking.seats]
      : [];

  // --------------------------------
  // PAYMENT CALCULATION
  // --------------------------------

  const ticketTotal = Number(booking.ticketTotal || 0);
  const convenienceFee = Number(booking.convenienceFee || 0);

  // GST rate based on average ticket price per seat
  const averageTicketPrice =
    seats.length > 0 ? ticketTotal / seats.length : 0;

  const gstRate = averageTicketPrice > 100 ? 18 : 5;

  // GST calculated on ticket amount
  const gstAmount = Number(
    ((ticketTotal * gstRate) / 100).toFixed(2)
  );

  // Final amount = Ticket + Convenience Fee + GST
  const totalAmount = Number(
    (ticketTotal + convenienceFee + gstAmount).toFixed(2)
  );

  // --------------------------------
  // DATE FORMAT
  // --------------------------------

  const formattedDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not selected";

  // --------------------------------
  // BACK TO SEAT SELECTION
  // --------------------------------

  const goBackToSeats = () => {
    const movieId = id || booking.movieId;

    if (!movieId) {
      navigate("/customer/movies");
      return;
    }

    navigate(`/customer/movie/${movieId}/booking`, {
      state: booking,
    });
  };

  // --------------------------------
  // DEMO PAYMENT
  // --------------------------------

  const handlePayNow = () => {
    if (!seats.length || totalAmount <= 0) {
      alert(
        "Booking details are missing. Please select your seats again."
      );
      return;
    }

    if (paymentMethod === "upi") {
      const upiPattern = /^[\w.-]+@[\w.-]+$/;

      if (!upiPattern.test(upiId.trim())) {
        alert(
          "Please enter a valid UPI ID, for example name@upi."
        );
        return;
      }
    }

    const movieId = id || booking.movieId;

    if (!movieId) {
      alert(
        "Movie details are missing. Please select your movie again."
      );
      return;
    }

    // This is a demo result, NOT a real payment.
    navigate(`/customer/movie/${movieId}/confirmation`, {
      state: {
        ...booking,
        paymentMethod,
        paymentStatus: "demo",
        paymentMessage:
          "Demo payment only. No money was charged. Ticket not confirmed.",
        ticketTotal,
        convenienceFee,
        gstRate,
        gstAmount,
        totalAmount,
      },
    });
  };

  // --------------------------------
  // BOOKING DETAILS NOT FOUND
  // --------------------------------

  if (!location.state) {
    return (
      <>
        <Common_navbar />

        <main className="ns-new-payment-page">
          <div className="ns-payment-empty">
            <Ticket size={48} color="#07843d" />

            <h2>Booking Details Not Found</h2>

            <p>
              Please select your movie, showtime and seats before payment.
            </p>

            <button
              type="button"
              onClick={() => navigate("/customer/movies")}
            >
              Browse Movies
            </button>
          </div>
        </main>

        <Common_Footer />
      </>
    );
  }

  // --------------------------------
  // MAIN PAYMENT PAGE
  // --------------------------------

  return (
    <>
      <Common_navbar />

      <main className="ns-new-payment-page">
        <div className="ns-new-payment-container">

          {/* Breadcrumb */}

          <div className="ns-payment-breadcrumb">
            <button
              type="button"
              onClick={() => navigate("/customer/movies")}
            >
              <Home size={14} /> Home
            </button>

            <ChevronRight size={14} />

            <button
              type="button"
              onClick={() => navigate("/customer/movies")}
            >
              <Film size={14} /> Movies
            </button>

            <ChevronRight size={14} />

            <span>{movieTitle}</span>

            <ChevronRight size={14} />

            <strong>Payment</strong>
          </div>

          {/* Heading */}

          <div className="ns-new-payment-heading">
            <div className="ns-payment-heading-title">
              <div className="ns-payment-heading-icon">
                <CreditCard size={32} />
              </div>

              <div>
                <h1>Complete Your Payment</h1>
                <p>
                  Secure & quick payment for your movie tickets.
                </p>
              </div>
            </div>

            {/* Progress */}

            <div className="ns-new-payment-progress">
              <div className="ns-progress-step done">
                <span>
                  <CheckCircle2 size={20} />
                </span>
                <strong>Select Movie</strong>
              </div>

              <i />

              <div className="ns-progress-step done">
                <span>
                  <CheckCircle2 size={20} />
                </span>
                <strong>Select Seats</strong>
              </div>

              <i />

              <div className="ns-progress-step current">
                <span>3</span>
                <strong>Payment</strong>
              </div>

              <i />

              <div className="ns-progress-step">
                <span>4</span>
                <strong>Result</strong>
              </div>
            </div>
          </div>

          {/* Payment Layout */}

          <div className="ns-new-payment-layout">

            <section className="ns-payment-workspace">

              {/* Payment Method Sidebar */}

              <div className="ns-payment-method-sidebar">
                {PAYMENT_METHODS.map((method) => {
                  const MethodIcon = method.icon;

                  return (
                    <button
                      type="button"
                      key={method.id}
                      className={
                        paymentMethod === method.id ? "active" : ""
                      }
                      onClick={() =>
                        setPaymentMethod(method.id)
                      }
                    >
                      <span className="ns-method-icon">
                        <MethodIcon size={28} />
                      </span>

                      <span className="ns-method-copy">
                        <strong>{method.title}</strong>
                        <small>{method.subtitle}</small>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Payment Content */}

              <div className="ns-payment-method-content">

                {/* UPI */}

                {paymentMethod === "upi" && (
                  <div className="ns-new-upi-content">
                    <h2>Pay using UPI</h2>

                    <p className="ns-payment-content-subtitle">
                      Enter your UPI ID to continue with the demo.
                    </p>

                    <div className="ns-upi-demo-area">

                      <div className="ns-upi-qr-placeholder">
                        <div className="ns-qr-placeholder-icon">
                          <QrCode size={100} />
                        </div>

                        <strong>UPI QR Code</strong>

                        <small>
                          A real payment QR will appear after gateway
                          integration.
                        </small>

                        <div className="ns-qr-security">
                          <ShieldCheck size={19} />
                          <span>Scan & Pay</span>
                        </div>
                      </div>

                      <div className="ns-upi-or">
                        <span>OR</span>
                      </div>

                      <div className="ns-upi-entry">
                        <label htmlFor="new-upi-id">
                          Enter UPI ID
                        </label>

                        <div className="ns-upi-input-wrap">
                          <Smartphone size={21} />

                          <input
                            id="new-upi-id"
                            type="text"
                            placeholder="example@upi"
                            value={upiId}
                            onChange={(e) =>
                              setUpiId(e.target.value)
                            }
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handlePayNow}
                          disabled={!upiId.trim()}
                        >
                          Continue ₹{totalAmount.toFixed(2)}
                          <ArrowRight size={19} />
                        </button>
                      </div>
                    </div>

                    {/* UPI Apps */}

                    <div className="ns-upi-app-section">
                      <h3>Pay with UPI Apps</h3>

                      <div className="ns-upi-apps">
                        <div className="ns-upi-app-card">
                          <span className="ns-app-logo ns-gpay-logo">
                            G
                          </span>
                          <strong>Google Pay</strong>
                        </div>

                        <div className="ns-upi-app-card">
                          <span className="ns-app-logo ns-phonepe-logo">
                            पे
                          </span>
                          <strong>PhonePe</strong>
                        </div>

                        <div className="ns-upi-app-card">
                          <span className="ns-app-logo ns-paytm-logo">
                            Paytm
                          </span>
                          <strong>Paytm</strong>
                        </div>

                        <div className="ns-upi-app-card">
                          <span className="ns-app-logo ns-bhim-logo">
                            BHIM
                          </span>
                          <strong>BHIM UPI</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Debit / Credit Card */}

                {paymentMethod === "card" && (
                  <div className="ns-new-other-method">
                    <div className="ns-other-method-icon">
                      <CreditCard size={38} />
                    </div>

                    <h2>Debit / Credit Card</h2>

                    <p>
                      Visa, Mastercard and RuPay payment option.
                    </p>

                    <div className="ns-card-brands">
                      <span className="ns-visa-brand">VISA</span>
                      <span className="ns-mastercard-brand">
                        <i />
                        <i />
                      </span>
                      <span className="ns-rupay-brand">RuPay</span>
                    </div>

                    <div className="ns-gateway-placeholder">
                      <ShieldCheck size={30} />

                      <strong>Secure card payment</strong>

                      <span>
                        Card entry will be provided by a real payment
                        gateway. Do not enter card details on this demo
                        page.
                      </span>
                    </div>
                  </div>
                )}

                {/* Net Banking */}

                {paymentMethod === "netbanking" && (
                  <div className="ns-new-other-method">
                    <div className="ns-other-method-icon">
                      <Building2 size={38} />
                    </div>

                    <h2>Net Banking</h2>

                    <p>
                      Choose your bank through a secure payment gateway.
                    </p>

                    <div className="ns-bank-options">
                      <div><Building2 size={25} /> SBI</div>
                      <div><Building2 size={25} /> HDFC</div>
                      <div><Building2 size={25} /> ICICI</div>
                      <div><Building2 size={25} /> Axis Bank</div>
                    </div>

                    <div className="ns-gateway-placeholder">
                      <LockKeyhole size={28} />

                      <strong>Secure bank selection</strong>

                      <span>
                        Bank login is not connected in this demo.
                      </span>
                    </div>
                  </div>
                )}

                {/* Wallet */}

                {paymentMethod === "wallet" && (
                  <div className="ns-new-other-method">
                    <div className="ns-other-method-icon">
                      <Wallet size={38} />
                    </div>

                    <h2>Wallet Payment</h2>

                    <p>
                      Paytm, PhonePe and other wallet options.
                    </p>

                    <div className="ns-wallet-options">
                      <div>
                        <Wallet size={25} />
                        <strong>Paytm</strong>
                      </div>

                      <div>
                        <Wallet size={25} />
                        <strong>PhonePe</strong>
                      </div>

                      <div>
                        <Wallet size={25} />
                        <strong>Other Wallets</strong>
                      </div>
                    </div>

                    <div className="ns-gateway-placeholder">
                      <ShieldCheck size={28} />

                      <strong>Secure wallet payment</strong>

                      <span>
                        Wallet payment is not connected in this demo.
                      </span>
                    </div>
                  </div>
                )}

                {/* Continue Button for other methods */}

                {paymentMethod !== "upi" && (
                  <button
                    type="button"
                    className="ns-new-summary-pay"
                    onClick={handlePayNow}
                  >
                    Continue to Demo Result ₹
                    {totalAmount.toFixed(2)}
                    <ArrowRight size={20} />
                  </button>
                )}
              </div>
            </section>

            {/* Booking Summary */}

            <aside className="ns-new-booking-summary">

              <div className="ns-summary-title">
                <Ticket size={25} />
                <h2>Booking Summary</h2>
              </div>

              {/* Movie */}

              <div className="ns-new-summary-movie">
                {poster ? (
                  <img src={poster} alt={movieTitle} />
                ) : (
                  <div className="ns-new-summary-no-poster">
                    <Film size={35} />
                  </div>
                )}

                <div>
                  <h3>{movieTitle}</h3>

                  <p>{language} · {format}</p>

                  <span className="ns-summary-seat-tag">
                    {seats.length}{" "}
                    {seats.length === 1 ? "Seat" : "Seats"}
                  </span>
                </div>
              </div>

              {/* Booking Details */}

              <div className="ns-new-summary-details">
                <div>
                  <span>
                    <MapPin size={16} /> Theatre
                  </span>
                  <strong>{theatre}, {city}</strong>
                </div>

                <div>
                  <span>
                    <CalendarDays size={16} /> Date
                  </span>
                  <strong>{formattedDate}</strong>
                </div>

                <div>
                  <span>
                    <Clock3 size={16} /> Showtime
                  </span>
                  <strong>{time}</strong>
                </div>

                <div>
                  <span>
                    <Ticket size={16} /> Seats
                  </span>
                  <strong>
                    {seats.join(", ") || "Not selected"}
                  </strong>
                </div>

                {address && (
                  <div className="ns-summary-address">
                    <span>
                      <MapPin size={16} /> Address
                    </span>
                    <strong>{address}</strong>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}

              <div className="ns-new-summary-prices">
                <div>
                  <span>
                    Ticket Amount ({seats.length} ticket)
                  </span>
                  <strong>₹{ticketTotal.toFixed(2)}</strong>
                </div>

                <div>
                  <span>Convenience Fee</span>
                  <strong>
                    ₹{convenienceFee.toFixed(2)}
                  </strong>
                </div>

                <div className="ns-summary-gst">
                  <span>GST ({gstRate}%)</span>
                  <strong>₹{gstAmount.toFixed(2)}</strong>
                </div>
              </div>

              {/* Final Total */}

              <div className="ns-new-summary-total">
                <strong>Total Amount</strong>
                <strong>₹{totalAmount.toFixed(2)}</strong>
              </div>

              {/* Pay Button */}

              <button
                type="button"
                className="ns-new-summary-pay"
                onClick={handlePayNow}
                disabled={
                  paymentMethod === "upi" && !upiId.trim()
                }
              >
                Continue ₹{totalAmount.toFixed(2)}
                <ArrowRight size={20} />
              </button>

              <p className="ns-new-summary-disclaimer">
                <Info size={14} />
                Demo only. No money will be charged and tickets are not
                confirmed.
              </p>
            </aside>
          </div>

          {/* Security Information */}

          <div className="ns-new-payment-security">
            <div>
              <ShieldCheck size={25} />
              <strong>Safe & Secure Payments</strong>
            </div>

            <i />

            <div>
              <LockKeyhole size={24} />
              <span>Secure payment processing</span>
            </div>

            <i />

            <div>
              <CheckCircle2 size={24} />
              <span>Protected payment details</span>
            </div>

            <i />

            <div>
              <Banknote size={24} />
              <span>No card details stored by NearShop</span>
            </div>
          </div>

          {/* Back Button */}

          <button
            type="button"
            className="ns-new-payment-back"
            onClick={goBackToSeats}
          >
            ← Back to Seat Selection
          </button>

        </div>
      </main>

      <Common_Footer />
    </>
  );
}
