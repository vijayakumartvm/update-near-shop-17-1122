
import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import Common_navbar from "../components/Navbar/Common_navbar";
import Common_Footer from "../components/Footer/Common_Footer";

import "./Customer_Movie_Food.css";

// 18 food items with automatic external image URLs
const foodItems = [
  {
    id: 1,
    name: "Classic Popcorn",
    description: "Fresh salted popcorn",
    price: 120,
    category: "Popcorn",
    image: "https://loremflickr.com/600/450/popcorn?lock=1",
    emoji: "🍿",
  },
  {
    id: 2,
    name: "Large Popcorn",
    description: "Large butter popcorn",
    price: 180,
    category: "Popcorn",
    image: "https://loremflickr.com/600/450/butter-popcorn?lock=2",
    emoji: "🍿",
  },
  {
    id: 3,
    name: "Caramel Popcorn",
    description: "Sweet caramel popcorn",
    price: 160,
    category: "Popcorn",
    image: "https://loremflickr.com/600/450/caramel-popcorn?lock=3",
    emoji: "🍿",
  },
  {
    id: 4,
    name: "Coke",
    description: "Chilled soft drink",
    price: 90,
    category: "Drinks",
    image: "https://loremflickr.com/600/450/cola-drink?lock=4",
    emoji: "🥤",
  },
  {
    id: 5,
    name: "Sprite",
    description: "Chilled lemon drink",
    price: 90,
    category: "Drinks",
    image: "https://loremflickr.com/600/450/lemon-soda?lock=5",
    emoji: "🥤",
  },
  {
    id: 6,
    name: "Water Bottle",
    description: "Fresh drinking water",
    price: 40,
    category: "Drinks",
    image: "https://loremflickr.com/600/450/water-bottle?lock=6",
    emoji: "💧",
  },
  {
    id: 7,
    name: "Nachos",
    description: "Crispy nachos with cheese",
    price: 150,
    category: "Snacks",
    image: "https://loremflickr.com/600/450/nachos-cheese?lock=7",
    emoji: "🧀",
  },
  {
    id: 8,
    name: "French Fries",
    description: "Crispy golden fries",
    price: 120,
    category: "Snacks",
    image: "https://loremflickr.com/600/450/french-fries?lock=8",
    emoji: "🍟",
  },
  {
    id: 9,
    name: "Samosa",
    description: "Hot crispy samosa",
    price: 60,
    category: "Snacks",
    image: "https://loremflickr.com/600/450/samosa?lock=9",
    emoji: "🥟",
  },
  {
    id: 10,
    name: "Veg Burger",
    description: "Fresh vegetable burger",
    price: 180,
    category: "Fast Food",
    image: "https://loremflickr.com/600/450/vegetable-burger?lock=10",
    emoji: "🍔",
  },
  {
    id: 11,
    name: "Cheese Pizza",
    description: "Delicious cheese pizza",
    price: 220,
    category: "Fast Food",
    image: "https://loremflickr.com/600/450/cheese-pizza?lock=11",
    emoji: "🍕",
  },
  {
    id: 12,
    name: "Sandwich",
    description: "Fresh grilled sandwich",
    price: 130,
    category: "Fast Food",
    image: "https://loremflickr.com/600/450/grilled-sandwich?lock=12",
    emoji: "🥪",
  },
  {
    id: 13,
    name: "Popcorn & Coke Combo",
    description: "Popcorn with soft drink",
    price: 220,
    category: "Combos",
    image: "https://loremflickr.com/600/450/popcorn-cola?lock=13",
    emoji: "🍿",
  },
  {
    id: 14,
    name: "Family Combo",
    description: "Large popcorn and two drinks",
    price: 350,
    category: "Combos",
    image: "https://loremflickr.com/600/450/fast-food-combo?lock=14",
    emoji: "🍱",
  },
  {
    id: 15,
    name: "Chocolate",
    description: "Delicious chocolate bar",
    price: 100,
    category: "Sweets",
    image: "https://loremflickr.com/600/450/chocolate-bar?lock=15",
    emoji: "🍫",
  },
  {
    id: 16,
    name: "Ice Cream",
    description: "Creamy delicious ice cream",
    price: 120,
    category: "Sweets",
    image: "https://loremflickr.com/600/450/ice-cream?lock=16",
    emoji: "🍨",
  },
  {
    id: 17,
    name: "Brownie",
    description: "Chocolate brownie",
    price: 140,
    category: "Sweets",
    image: "https://loremflickr.com/600/450/chocolate-brownie?lock=17",
    emoji: "🍰",
  },
  {
    id: 18,
    name: "Movie Combo",
    description: "Popcorn, fries and burger",
    price: 399,
    category: "Combos",
    image: "https://loremflickr.com/600/450/burger-fries-popcorn?lock=18",
    emoji: "🍔",
  },
];

const categories = [
  "All",
  "Popcorn",
  "Drinks",
  "Snacks",
  "Fast Food",
  "Combos",
  "Sweets",
];

function Customer_Movie_Food() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const booking = location.state || {};

  const [quantities, setQuantities] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [failedImages, setFailedImages] = useState([]);

  const updateQuantity = (itemId, change) => {
    setQuantities((previous) => {
      const nextQuantity = Math.max(
        0,
        (previous[itemId] || 0) + change
      );

      return {
        ...previous,
        [itemId]: nextQuantity,
      };
    });
  };

  const filteredItems =
    selectedCategory === "All"
      ? foodItems
      : foodItems.filter(
          (item) => item.category === selectedCategory
        );

  const selectedFood = foodItems
    .filter((item) => (quantities[item.id] || 0) > 0)
    .map((item) => ({
      ...item,
      quantity: quantities[item.id],
    }));

  const foodTotal = selectedFood.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const itemCount = selectedFood.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const convenienceFee = itemCount > 0 ? 10 : 0;
  const grandTotal = foodTotal + convenienceFee;

  const continueToPayment = () => {
    navigate(`/customer/movie/${id}/payment`, {
      state: {
        ...booking,
        foodItems: selectedFood,
        foodTotal,
        foodConvenienceFee: convenienceFee,
        foodGrandTotal: grandTotal,
      },
    });
  };

  const skipFood = () => {
    navigate(`/customer/movie/${id}/payment`, {
      state: {
        ...booking,
        foodItems: [],
        foodTotal: 0,
        foodConvenienceFee: 0,
        foodGrandTotal: 0,
      },
    });
  };

  const formatDate = (date) => {
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

      <main className="ns-movie-food-page">

        {/* Page heading */}
        <div className="ns-food-heading">
          <div>
            <h1>Food & Beverages</h1>
            <p>Enjoy your favourite snacks during the movie.</p>
          </div>

          <strong>🍿 NearShop Cinema</strong>
        </div>

        {/* Booking details */}
        <section className="ns-food-booking-info">
          <div className="ns-food-booking-title">
            Your Movie Booking
          </div>

          <div className="ns-food-booking-details">
            <p>
              <strong>Movie:</strong>{" "}
              {booking.movieTitle || "Movie"}
            </p>

            <p>
              <strong>Theatre:</strong>{" "}
              {booking.theatre || "Theatre not selected"}
            </p>

            <p>
              <strong>City:</strong>{" "}
              {booking.city || "City not selected"}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {formatDate(booking.date)}
            </p>

            <p>
              <strong>Showtime:</strong>{" "}
              {booking.time || "Time not selected"}
            </p>

            <p>
              <strong>Seats:</strong>{" "}
              {booking.seats?.join(", ") || "Not selected"}
            </p>
          </div>
        </section>

        {/* Main content */}
        <div className="ns-food-content-layout">

          <section className="ns-food-products-section">

            <div className="ns-food-section-title">
              <h2>Choose Your Snacks</h2>
              <p>Add your favourite food to your booking.</p>
            </div>

            {/* Category filters */}
            <div className="ns-food-category-list">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={
                    selectedCategory === category
                      ? "active"
                      : ""
                  }
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Food product cards */}
            <div className="ns-food-grid">
              {filteredItems.map((item) => (
                <article className="ns-food-card" key={item.id}>

                  <div className="ns-food-image">
                    {failedImages.includes(item.id) ? (
                      <span>{item.emoji}</span>
                    ) : (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        onError={() => {
                          setFailedImages((previous) => [
                            ...previous,
                            item.id,
                          ]);
                        }}
                      />
                    )}
                  </div>

                  <div className="ns-food-card-details">
                    <h3>{item.name}</h3>

                    <p>{item.description}</p>

                    <div className="ns-food-card-bottom">
                      <strong>₹{item.price}</strong>

                      <div className="ns-food-quantity">
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          disabled={!quantities[item.id]}
                          onClick={() =>
                            updateQuantity(item.id, -1)
                          }
                        >
                          −
                        </button>

                        <span>
                          {quantities[item.id] || 0}
                        </span>

                        <button
                          type="button"
                          aria-label={`Add ${item.name}`}
                          onClick={() =>
                            updateQuantity(item.id, 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                </article>
              ))}
            </div>
          </section>

          {/* Order summary */}
          <aside className="ns-food-order-summary">

            <div className="ns-food-order-title">
              <h2>Your Order</h2>
              <span>🛒 {itemCount} Items</span>
            </div>

            {selectedFood.length === 0 ? (
              <div className="ns-food-empty">
                <span>🛍️</span>
                <p>No food items selected yet.</p>
                <small>Choose your favourite snacks.</small>
              </div>
            ) : (
              <div className="ns-food-selected-list">
                {selectedFood.map((item) => (
                  <div
                    className="ns-food-selected-item"
                    key={item.id}
                  >
                    <div className="ns-food-selected-image">
                      {failedImages.includes(item.id) ? (
                        <span>{item.emoji}</span>
                      ) : (
                        <img src={item.image} alt={item.name} />
                      )}
                    </div>

                    <div className="ns-food-selected-info">
                      <h4>{item.name}</h4>
                      <strong>₹{item.price * item.quantity}</strong>
                    </div>

                    <div className="ns-food-selected-quantity">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, -1)
                        }
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="ns-food-total-row">
              <span>Items Total</span>
              <strong>₹{foodTotal.toFixed(2)}</strong>
            </div>

            <div className="ns-food-total-row">
              <span>Convenience Fee</span>
              <strong>₹{convenienceFee.toFixed(2)}</strong>
            </div>

            <div className="ns-food-grand-total">
              <strong>Total Amount</strong>
              <strong>₹{grandTotal.toFixed(2)}</strong>
            </div>

            <button
              type="button"
              className="ns-food-payment-button"
              onClick={continueToPayment}
            >
              Continue to Payment →
            </button>

            <button
              type="button"
              className="ns-food-skip-button"
              onClick={skipFood}
            >
              Skip Food
            </button>

            <p className="ns-food-summary-note">
              Your selected food items will be included
              with your movie booking.
            </p>

          </aside>
        </div>

      </main>

      <Common_Footer />
    </>
  );
}

export default Customer_Movie_Food;
