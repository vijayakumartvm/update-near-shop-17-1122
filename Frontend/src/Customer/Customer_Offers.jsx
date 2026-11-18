
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Common_navbar from "../components/Navbar/Common_navbar";
import Common_Footer from "../components/Footer/Common_Footer";
import "./Customer_Offers.css";

const Customer_Offers = () => {
  const [activeTab, setActiveTab] = useState("all");

  const offers = [
    {
      id: 1,
      title: "Festival Special Offer",
      description: "Get 10% OFF on your grocery shopping.",
      condition: "On orders above ₹1,000",
      code: "NEAR20",
      discount: "10% OFF",
      type: "all",
    },
    {
      id: 2,
      title: "Fresh Grocery Discount",
      description: "Save more on fresh fruits and vegetables.",
      condition: "On orders above ₹2,000",
      code: "FRESH500",
      discount: "₹200 OFF",
      type: "coupon",
    },
    {
      id: 3,
      title: "Bank Special Offer",
      description: "Enjoy extra savings on selected bank cards.",
      condition: "On eligible card payments",
      code: "BANK10",
      discount: "10% OFF",
      type: "bank",
    },
  ];

  const filteredOffers =
    activeTab === "all"
      ? offers
      : offers.filter((offer) => offer.type === activeTab);

  const copyCoupon = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      alert(`${code} copied successfully!`);
    } catch {
      alert(`Your coupon code is: ${code}`);
    }
  };

  return (
    <>
      <Common_navbar />

      <main className="ns-offers-page">
        <header className="ns-offers-header">
          <div>
            <h2>Offers & Coupons</h2>
            <p>Discover exciting deals and save more with NearShop.</p>
          </div>

          <Link to="/customer" className="ns-offers-shop-btn">
            Continue Shopping
          </Link>
        </header>

        <section className="ns-offers-banner">
          <div>
            <span className="ns-offers-banner-label">
              SPECIAL FESTIVAL OFFER
            </span>
            <h1>Get 10% OFF</h1>
            <p>On orders above ₹1,000</p>
            <Link to="/customer">Shop Now →</Link>
          </div>
          <div className="ns-offers-banner-art">🛒 🥦 🍎</div>
        </section>

        <section className="ns-offers-content">
          <div className="ns-offers-tabs">
            <button
              className={activeTab === "all" ? "active" : ""}
              onClick={() => setActiveTab("all")}
              type="button"
            >
              All Offers
            </button>

            <button
              className={activeTab === "coupon" ? "active" : ""}
              onClick={() => setActiveTab("coupon")}
              type="button"
            >
              Coupons
            </button>

            <button
              className={activeTab === "bank" ? "active" : ""}
              onClick={() => setActiveTab("bank")}
              type="button"
            >
              Bank Offers
            </button>
          </div>

          <div className="ns-offers-grid">
            {filteredOffers.length > 0 ? (
              filteredOffers.map((offer) => (
                <article className="ns-offer-card" key={offer.id}>
                  <div className="ns-offer-card-top">
                    <span>🎁</span>
                    <strong>{offer.discount}</strong>
                  </div>

                  <h3>{offer.title}</h3>
                  <p>{offer.description}</p>

                  <small>{offer.condition}</small>

                  <div className="ns-offer-code">
                    <strong>{offer.code}</strong>

                    <button
                      type="button"
                      onClick={() => copyCoupon(offer.code)}
                    >
                      Copy
                    </button>
                  </div>

                  <Link to="/customer" className="ns-offer-use">
                    Shop Now →
                  </Link>
                </article>
              ))
            ) : (
              <div className="ns-offers-empty">
                No offers available in this category.
              </div>
            )}
          </div>
        </section>

        <div className="ns-offers-note">
          <strong>Note:</strong> These are sample frontend offers.
          Coupon validation and discount calculation will be
          connected to the backend later.
        </div>
      </main>

      <Common_Footer />
    </>
  );
};

export default Customer_Offers;
