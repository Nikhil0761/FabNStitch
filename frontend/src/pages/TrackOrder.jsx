/* ============================================
   Track Order Page (PRODUCTION)
============================================ */

import { useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";
import "./TrackOrder.css";

function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [error, setError] = useState("");

  const statusSteps = [
    { key: "pending", label: "Order Placed", icon: "📋" },
    { key: "confirmed", label: "Confirmed", icon: "✓" },
    { key: "stitching", label: "Stitching", icon: "🧵" },
    { key: "finishing", label: "Finishing", icon: "✨" },
    { key: "quality_check", label: "Quality Check", icon: "🔍" },
    { key: "ready", label: "Ready", icon: "📦" },
    { key: "shipped", label: "Shipped", icon: "🚚" },
    { key: "delivered", label: "Delivered", icon: "🎉" },
  ];

  /* ============================================
     FETCH ORDER
  ============================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!orderId.trim()) {
      setError("Please enter an Order ID");
      return;
    }

    setIsLoading(true);
    setError("");
    setOrder(null);
    setTimeline([]);

    try {
      const response = await fetch(
        `${API_URL}/public/orders/${orderId.trim()}`
      );

      if (response.status === 404) {
        setError("Order not found. Please check your Order ID.");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to fetch order details");
      }

      const data = await response.json();
      setOrder(data.order);
      setTimeline(data.history || []);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentStepIndex = order
    ? statusSteps.findIndex((s) => s.key === order.status)
    : -1;

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "N/A";

  return (
    <div className="track-page">
      {/* HERO */}
      <section className="track-hero">
        <div className="container">
          <h1>Track Your Order</h1>
          <p>Enter your Order ID to check your order status</p>

          <form onSubmit={handleSubmit} className="track-form">
            <div className="search-box">
              <input
                type="text"
                placeholder="Enter Order ID (e.g. FN12345)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="search-input"
              />
              <button className="btn btn-primary" disabled={isLoading}>
                {isLoading ? "Searching..." : "Track"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* RESULTS */}
      <section className="track-results">
        <div className="container">
          {isLoading && (
            <div className="loading-state">
              <div className="loader" />
              <p>Fetching order details...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="error-state">
              <h3>⚠ {error}</h3>
              <Link to="/login" className="btn btn-outline">
                Login for full details
              </Link>
            </div>
          )}

          {order && !isLoading && (
            <div className="order-result">
              {/* SUMMARY */}
              <div className="order-summary">
                <h2>Order ID: {order.order_id}</h2>
                <span className={`status-badge status-${order.status}`}>
                  {statusSteps.find((s) => s.key === order.status)?.label}
                </span>

                <div className="summary-grid">
                  <div>
                    <strong>Style</strong>
                    <p>{order.style}</p>
                  </div>
                  <div>
                    <strong>Fabric</strong>
                    <p>
                      {order.fabric_name} – {order.fabric_color}
                    </p>
                  </div>
                  <div>
                    <strong>Estimated Delivery</strong>
                    <p>{formatDate(order.estimated_delivery)}</p>
                  </div>
                </div>
              </div>

              {/* PROGRESS */}
              <div className="progress-tracker">
                {statusSteps.map((step, index) => (
                  <div
                    key={step.key}
                    className={`progress-step ${
                      index < currentStepIndex
                        ? "completed"
                        : index === currentStepIndex
                        ? "current"
                        : ""
                    }`}
                  >
                    <div className="step-marker">
                      {index < currentStepIndex ? "✓" : step.icon}
                    </div>
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>

              {/* TIMELINE */}
              {timeline.length > 0 && (
                <div className="order-timeline">
                  <h3>Status History</h3>
                  {timeline.map((t, i) => (
                    <div key={i} className="timeline-item">
                      <strong>
                        {
                          statusSteps.find((s) => s.key === t.status)
                            ?.label
                        }
                      </strong>
                      <span>{formatDate(t.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default TrackOrder;
