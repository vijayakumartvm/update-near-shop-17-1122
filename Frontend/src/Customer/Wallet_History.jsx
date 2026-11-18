
import React from "react";
import { Link } from "react-router-dom";
import Common_navbar from "../components/Navbar/Common_navbar";
import Common_Footer from "../components/Footer/Common_Footer";
import "./Wallet_History.css";

const Wallet_History = () => {
  // Sample transactions for design preview
  const transactions = [];

  return (
    <>
      <Common_navbar />

      <div className="ns-wallet-history">
        <div className="ns-wallet-history-header">
          <h2>Wallet History</h2>
          <p>View your wallet transactions and payment activities.</p>
        </div>

        <div className="ns-wallet-history-layout">

          <aside className="ns-wallet-history-sidebar">
            <h3>My Account</h3>

            <Link to="/profile">My Profile</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/wallet">My Wallet</Link>
            <Link to="/wallet/history" className="active">
              Wallet History
            </Link>
            <Link to="/customer">Continue Shopping</Link>
          </aside>

          <main className="ns-wallet-history-content">

            <div className="ns-wallet-history-title">
              <div>
                <h3>Transaction History</h3>
                <p>All your wallet transactions in one place.</p>
              </div>

              <Link to="/wallet" className="ns-wallet-back">
                Back to Wallet
              </Link>
            </div>

            <div className="ns-wallet-history-summary">
              <div>
                <span>Total Transactions</span>
                <h2>{transactions.length}</h2>
              </div>

              <div>
                <span>Money Added</span>
                <h2>₹0.00</h2>
              </div>

              <div>
                <span>Money Spent</span>
                <h2>₹0.00</h2>
              </div>
            </div>

            <div className="ns-wallet-history-table">
              <h3>Recent Transactions</h3>

              {transactions.length === 0 ? (
                <div className="ns-wallet-history-empty">
                  <div className="ns-wallet-history-icon">₹</div>
                  <h3>No Transactions Yet</h3>
                  <p>
                    Your wallet transaction history will appear here
                    when you add or use wallet money.
                  </p>
                  <Link to="/wallet">Go to My Wallet</Link>
                </div>
              ) : (
                <div className="ns-wallet-history-list">
                  {transactions.map((item) => (
                    <div className="ns-wallet-history-row" key={item.id}>
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.date}</p>
                      </div>
                      <strong>{item.amount}</strong>
                      <span>{item.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="ns-wallet-history-note">
              <strong>Note:</strong> This page currently displays an empty
              preview. Real transaction records will be connected to
              your backend later.
            </div>

          </main>
        </div>
      </div>

      <Common_Footer />
    </>
  );
};

export default Wallet_History;
