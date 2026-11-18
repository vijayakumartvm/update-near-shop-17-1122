
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Common_navbar from "../components/Navbar/Common_navbar";
import Common_Footer from "../components/Footer/Common_Footer";
import "./Customer_Rewards.css";

const Customer_Rewards = () => {
  const [activeTab, setActiveTab] = useState("all");

  // Sample data for frontend preview
  const rewardHistory = [
    {
      id: 1,
      title: "Order Reward",
      date: "06 Nov 2026",
      points: "+150",
      type: "earned",
    },
    {
      id: 2,
      title: "Product Purchase Reward",
      date: "04 Nov 2026",
      points: "+100",
      type: "earned",
    },
    {
      id: 3,
      title: "Reward Redemption",
      date: "01 Nov 2026",
      points: "-500",
      type: "redeemed",
    },
  ];

  const filteredHistory =
    activeTab === "all"
      ? rewardHistory
      : rewardHistory.filter((item) => item.type === activeTab);

  return (
    <>
      <Common_navbar />

      <main className="ns-rewards-page">
        <div className="ns-rewards-header">
          <div>
            <h2>My Rewards</h2>
            <p>Earn points with every purchase and enjoy exciting rewards.</p>
          </div>
          <Link to="/customer" className="ns-rewards-shop-btn">
            Continue Shopping
          </Link>
        </div>

        {/* Reward Balance */}
        <section className="ns-rewards-balance">
          <div className="ns-rewards-trophy">🏆</div>
          <div>
            <span>Your Reward Points</span>
            <h1>1,250 Points</h1>
            <p>Keep shopping to earn more points!</p>
          </div>
        </section>

        {/* Reward Actions */}
        <section className="ns-rewards-actions">
          <Link to="/customer" className="ns-reward-action-card">
            <span>★</span>
            <strong>Earn Points</strong>
            <small>Shop and collect points</small>
          </Link>

          <button
            type="button"
            className="ns-reward-action-card"
            onClick={() => alert("Reward redemption will be connected later.")}
          >
            <span>🎁</span>
            <strong>Redeem Rewards</strong>
            <small>Use your reward points</small>
          </button>

          <button
            type="button"
            className="ns-reward-action-card"
            onClick={() =>
              alert("Reward rules will be available soon.")
            }
          >
            <span>ⓘ</span>
            <strong>How It Works</strong>
            <small>Learn about reward points</small>
          </button>
        </section>

        {/* Reward History */}
        <section className="ns-rewards-history">
          <div className="ns-rewards-history-heading">
            <div>
              <h3>Reward History</h3>
              <p>Track your earned and redeemed points.</p>
            </div>

            <div className="ns-rewards-filters">
              <button
                type="button"
                className={activeTab === "all" ? "active" : ""}
                onClick={() => setActiveTab("all")}
              >
                All
              </button>
              <button
                type="button"
                className={activeTab === "earned" ? "active" : ""}
                onClick={() => setActiveTab("earned")}
              >
                Earned
              </button>
              <button
                type="button"
                className={activeTab === "redeemed" ? "active" : ""}
                onClick={() => setActiveTab("redeemed")}
              >
                Redeemed
              </button>
            </div>
          </div>

          <div className="ns-rewards-history-list">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <div className="ns-rewards-history-item" key={item.id}>
                  <div className="ns-rewards-history-icon">
                    {item.type === "earned" ? "★" : "🎁"}
                  </div>

                  <div className="ns-rewards-history-info">
                    <strong>{item.title}</strong>
                    <small>{item.date}</small>
                  </div>

                  <strong
                    className={
                      item.type === "earned"
                        ? "ns-rewards-earned"
                        : "ns-rewards-redeemed"
                    }
                  >
                    {item.points} Points
                  </strong>
                </div>
              ))
            ) : (
              <div className="ns-rewards-empty">
                No reward transactions found.
              </div>
            )}
          </div>
        </section>

        <div className="ns-rewards-note">
          <strong>Note:</strong> These are sample reward points for the
          frontend preview. Real reward balances and transactions will
          be connected to your backend later.
        </div>
      </main>

      <Common_Footer />
    </>
  );
};

export default Customer_Rewards;
