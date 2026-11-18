
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Common_navbar from "../components/Navbar/Common_navbar";
import Common_Footer from "../components/Footer/Common_Footer";
import "./Customer_Reviews.css";

const Customer_Reviews = () => {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState([]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!review.trim()) {
      alert("Please enter your review.");
      return;
    }

    const newReview = {
      id: Date.now(),
      rating,
      message: review.trim(),
      date: new Date().toLocaleDateString("en-IN"),
    };

    setReviews((previous) => [newReview, ...previous]);
    setReview("");
    setRating(5);
  };

  return (
    <>
      <Common_navbar />

      <main className="ns-reviews-page">
        <div className="ns-reviews-header">
          <div>
            <h2>My Reviews</h2>
            <p>Share your shopping experience with NearShop.</p>
          </div>
          <Link to="/customer" className="ns-reviews-shop-btn">
            Continue Shopping
          </Link>
        </div>

        <section className="ns-reviews-summary">
          <div className="ns-reviews-summary-icon">★</div>
          <div>
            <h3>Customer Feedback</h3>
            <p>Your opinions help us improve our products and services.</p>
          </div>
        </section>

        <section className="ns-reviews-form">
          <h3>Write a Review</h3>
          <p>Tell us about your NearShop experience.</p>

          <form onSubmit={handleSubmit}>
            <label>Your Rating</label>

            <div className="ns-reviews-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={star <= rating ? "selected" : ""}
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} stars`}
                >
                  ★
                </button>
              ))}
            </div>

            <label htmlFor="ns-review-message">Your Review</label>

            <textarea
              id="ns-review-message"
              value={review}
              onChange={(event) => setReview(event.target.value)}
              placeholder="Write your shopping experience..."
              rows="5"
              maxLength="500"
            />

            <small>{review.length}/500 characters</small>

            <button type="submit" className="ns-reviews-submit">
              Submit Review
            </button>
          </form>
        </section>

        <section className="ns-reviews-list">
          <h3>Your Reviews</h3>

          {reviews.length === 0 ? (
            <div className="ns-reviews-empty">
              <span>★</span>
              <h3>No Reviews Yet</h3>
              <p>Your submitted reviews will appear here.</p>
            </div>
          ) : (
            reviews.map((item) => (
              <article className="ns-review-item" key={item.id}>
                <div className="ns-review-item-top">
                  <strong>Your Review</strong>
                  <small>{item.date}</small>
                </div>

                <div className="ns-review-item-stars">
                  {"★".repeat(item.rating)}
                  {"☆".repeat(5 - item.rating)}
                </div>

                <p>{item.message}</p>
              </article>
            ))
          )}
        </section>

        <div className="ns-reviews-note">
          <strong>Note:</strong> Reviews are currently stored in page
          memory for preview. Backend storage and product-specific
          reviews will be connected later.
        </div>
      </main>

      <Common_Footer />
    </>
  );
};

export default Customer_Reviews;
