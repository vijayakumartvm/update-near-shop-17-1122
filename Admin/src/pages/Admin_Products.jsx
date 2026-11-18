
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Package,
  Clock3,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  Check,
  X,
} from "lucide-react";

import "./Admin_Products.css";

const API_URL = "http://localhost:5000/api";
const BACKEND_URL = "http://localhost:5000";

function Admin_Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("nearshopAdminToken");

      if (!token) {
        throw new Error("Admin login expired. Please login again.");
      }

      const response = await fetch(
        `${API_URL}/products/admin/all?limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load products.");
      }

      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const counts = useMemo(() => ({
    total: products.length,
    pending: products.filter((p) => p.status === "pending").length,
    approved: products.filter((p) => p.status === "approved").length,
    rejected: products.filter((p) => p.status === "rejected").length,
  }), [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch = [
        product.name,
        product.category?.name,
        product.seller?.storeName,
      ].join(" ").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || product.status === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  const reviewProduct = async (product, status) => {
    if (
      !window.confirm(
        `${status === "approved" ? "Approve" : "Reject"} ${product.name}?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("nearshopAdminToken");

      const body = { status };

      if (status === "rejected") {
        const reason = window.prompt("Enter the rejection reason:");

        if (!reason?.trim()) {
          return;
        }

        body.rejectionReason = reason.trim();
      }

      const response = await fetch(
        `${API_URL}/products/admin/${product._id}/review`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update product.");
      }

      setProducts((previous) =>
        previous.map((item) =>
          item._id === product._id
            ? { ...item, status: data.product.status }
            : item
        )
      );

      setSelectedProduct(null);
      setNotice(data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  const getProductImage = (product) => {
    const image = product.images?.[0];

    if (!image) return "";

    return image.startsWith("http")
      ? image
      : `${BACKEND_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  return (
    <section className="aprod-page">
      <div className="aprod-heading">
        <div>
          <p className="aprod-eyebrow">CATALOG MANAGEMENT</p>
          <h1>Products</h1>
          <p className="aprod-subtitle">
            Review and manage grocery products submitted by sellers.
          </p>
        </div>

        <button
          className="aprod-refresh-btn"
          type="button"
          onClick={fetchProducts}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {notice && (
        <div className="aprod-notice">
          <CheckCircle2 size={17} />
          {notice}
          <button onClick={() => setNotice("")} type="button">
            <X size={16} />
          </button>
        </div>
      )}

      {error && <p className="aprod-error">{error}</p>}

      <div className="aprod-stats">
        <article className="aprod-stat-card">
          <Package size={22} />
          <div>
            <p>Total Products</p>
            <h2>{counts.total}</h2>
          </div>
        </article>

        <article className="aprod-stat-card">
          <Clock3 size={22} />
          <div>
            <p>Pending</p>
            <h2>{counts.pending}</h2>
          </div>
        </article>

        <article className="aprod-stat-card">
          <CheckCircle2 size={22} />
          <div>
            <p>Approved</p>
            <h2>{counts.approved}</h2>
          </div>
        </article>

        <article className="aprod-stat-card">
          <XCircle size={22} />
          <div>
            <p>Rejected</p>
            <h2>{counts.rejected}</h2>
          </div>
        </article>
      </div>

      <div className="aprod-panel">
        <div className="aprod-panel-heading">
          <div>
            <h2>All Products</h2>
            <p>Review products before they appear in the marketplace.</p>
          </div>
          <span>{filteredProducts.length} products</span>
        </div>

        <div className="aprod-toolbar">
          <label className="aprod-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search product, category or seller..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <select
            className="aprod-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <p className="aprod-message">Loading products...</p>
        ) : (
          <div className="aprod-table-scroll">
            <table className="aprod-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>CATEGORY</th>
                  <th>SELLER</th>
                  <th>PRICE</th>
                  <th>STOCK</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="aprod-product-cell">
                        {getProductImage(product) ? (
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                          />
                        ) : (
                          <span className="aprod-image-fallback">
                            <Package size={20} />
                          </span>
                        )}
                        <strong>{product.name}</strong>
                      </div>
                    </td>

                    <td>{product.category?.name || "—"}</td>
                    <td>{product.seller?.storeName || "—"}</td>
                    <td>₹{Number(product.price || 0).toFixed(2)}</td>
                    <td>{product.stock} {product.unit || ""}</td>

                    <td>
                      <span className={`aprod-status ${product.status}`}>
                        {product.status}
                      </span>
                    </td>

                    <td>
                      <div className="aprod-actions">
                        <button
                          type="button"
                          title="View product"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <Eye size={16} />
                        </button>

                        {product.status === "pending" && (
                          <>
                            <button
                              type="button"
                              title="Approve product"
                              onClick={() => reviewProduct(product, "approved")}
                            >
                              <Check size={16} />
                            </button>

                            <button
                              type="button"
                              title="Reject product"
                              onClick={() => reviewProduct(product, "rejected")}
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="aprod-empty">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="aprod-footer">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {selectedProduct && (
        <div
          className="aprod-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedProduct(null);
            }
          }}
        >
          <section className="aprod-modal">
            <button
              type="button"
              className="aprod-modal-close"
              onClick={() => setSelectedProduct(null)}
            >
              <X size={19} />
            </button>

            <h2>{selectedProduct.name}</h2>

            {getProductImage(selectedProduct) && (
              <img
                className="aprod-modal-image"
                src={getProductImage(selectedProduct)}
                alt={selectedProduct.name}
              />
            )}

            <p>{selectedProduct.description || "No description available."}</p>
            <p>Category: {selectedProduct.category?.name || "—"}</p>
            <p>Seller: {selectedProduct.seller?.storeName || "—"}</p>
            <p>Price: ₹{selectedProduct.price}</p>
            <p>Stock: {selectedProduct.stock} {selectedProduct.unit}</p>
            <p>Status: {selectedProduct.status}</p>

            {selectedProduct.status === "pending" && (
              <div className="aprod-modal-actions">
                <button
                  type="button"
                  onClick={() => reviewProduct(selectedProduct, "rejected")}
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => reviewProduct(selectedProduct, "approved")}
                >
                  Approve
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

export default Admin_Products;
