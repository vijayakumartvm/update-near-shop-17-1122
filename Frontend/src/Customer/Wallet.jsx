
import { Link } from "react-router-dom";
import Common_navbar from "../components/Navbar/Common_navbar";
import Common_Footer from "../components/Footer/Common_Footer";
import "./Wallet.css";

export default function Wallet() {
  const walletItems = [
    {
      icon: "₹",
      title: "Available Balance",
      amount: "₹0.00",
      description: "Your current wallet balance",
    },
    {
      icon: "🎁",
      title: "Reward Credits",
      amount: "₹0.00",
      description: "Credits earned from purchases",
    },
    {
      icon: "🎬",
      title: "Movie Ticket Rewards",
      amount: "₹0.00",
      description: "Eligible movie ticket reward value",
    },
    {
      icon: "↩",
      title: "Refund Amount",
      amount: "₹0.00",
      description: "Refunds credited to your wallet",
    },
  ];

  return (
    <div className="ns-wallet-page">
      <Common_navbar />

      <main className="ns-wallet-main">
        <header className="ns-wallet-header">
          <div>
            <span className="ns-wallet-eyebrow">
              YOUR NEARSHOP ACCOUNT
            </span>
            <h1>My Wallet</h1>
            <p>
              Manage your wallet balance, rewards and transactions.
            </p>
          </div>

          <Link to="/customer" className="ns-wallet-shop-link">
            ← Continue Shopping
          </Link>
        </header>

        <div className="ns-wallet-layout">
          {/* LEFT SIDEBAR */}
          <aside className="ns-wallet-sidebar">
            <div className="ns-wallet-user">
              <div className="ns-wallet-avatar">C</div>
              <div>
                <strong>NearShop Customer</strong>
                <span>My Account</span>
              </div>
            </div>

            <nav className="ns-wallet-nav">
              <Link to="/profile" className="ns-wallet-nav-link">
                <span>♙</span> My Profile
              </Link>

              <Link to="/orders" className="ns-wallet-nav-link">
                <span>▤</span> My Orders
              </Link>

              <Link to="/wallet" className="ns-wallet-nav-link active">
                <span>₹</span> My Wallet
              </Link>

              <Link
                to="/wallet/history"
                className="ns-wallet-nav-link"
              >
                <span>↻</span> Transaction History
              </Link>

              <Link to="/customer" className="ns-wallet-nav-link">
                <span>♡</span> Continue Shopping
              </Link>
            </nav>

            <div className="ns-wallet-help-card">
              <span>♧</span>
              <strong>Shop local. Shop fresh.</strong>
              <p>
                Discover groceries and rewards from NearShop.
              </p>
              <Link to="/customer">
                Explore Groceries →
              </Link>
            </div>
          </aside>

          {/* RIGHT WALLET CONTENT */}
          <div className="ns-wallet-content">

            {/* MAIN BALANCE */}
            <section className="ns-wallet-balance-card">
              <div>
                <span className="ns-wallet-balance-label">
                  TOTAL WALLET BALANCE
                </span>
                <h2>₹0.00</h2>
                <p>Wallet balance will appear after backend integration.</p>
              </div>

              <div className="ns-wallet-balance-icon">₹</div>
            </section>

            {/* WALLET SUMMARY */}
            <section className="ns-wallet-summary">
              {walletItems.map((item) => (
                <article
                  className="ns-wallet-stat-card"
                  key={item.title}
                >
                  <div className="ns-wallet-stat-icon">
                    {item.icon}
                  </div>

                  <div>
                    <span>{item.title}</span>
                    <strong>{item.amount}</strong>
                    <small>{item.description}</small>
                  </div>
                </article>
              ))}
            </section>

            {/* WALLET ACTIONS */}
            <section className="ns-wallet-card">
              <div className="ns-wallet-card-heading">
                <div>
                  <h2>Wallet Services</h2>
                  <p>Manage your NearShop wallet.</p>
                </div>
              </div>

              <div className="ns-wallet-actions">
                <div className="ns-wallet-action">
                  <span>＋</span>
                  <strong>Add Money</strong>
                  <small>Wallet top-up integration pending</small>
                </div>

                <div className="ns-wallet-action">
                  <span>↻</span>
                  <strong>Transaction History</strong>
                  <small>View wallet credits and debits</small>
                  <Link to="/wallet/history">
                    View History →
                  </Link>
                </div>

                <div className="ns-wallet-action">
                  <span>🎁</span>
                  <strong>My Rewards</strong>
                  <small>Check your purchase rewards</small>
                  <Link to="/customer/rewards">
                    View Rewards →
                  </Link>
                </div>
              </div>
            </section>

            {/* RECENT TRANSACTIONS */}
            <section className="ns-wallet-card">
              <div className="ns-wallet-card-heading">
                <div>
                  <h2>Recent Transactions</h2>
                  <p>Your latest wallet activity.</p>
                </div>

                <Link to="/wallet/history">
                  View All →
                </Link>
              </div>

              <div className="ns-wallet-empty">
                <div>₹</div>
                <strong>No transactions yet</strong>
                <p>
                  Your wallet credits, refunds and payments
                  will appear here.
                </p>
              </div>
            </section>

            {/* INFORMATION */}
            <section className="ns-wallet-information">
              <span>✓</span>
              <div>
                <strong>NearShop Wallet</strong>
                <p>
                  Your wallet will display verified balances and
                  transactions after secure backend integration.
                  No real payment or wallet transfer is enabled yet.
                </p>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Common_Footer />
    </div>
  );
}
