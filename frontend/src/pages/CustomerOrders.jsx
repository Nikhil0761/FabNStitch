/* ============================================
   Customer Orders Page (FINAL)
============================================ */

import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import "./CustomerOrders.css";
import { API_URL } from "../config";

function CustomerOrders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = localStorage.getItem("fabnstitch_token");

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);

  /* ============================================
     ACTIONS
  ============================================ */
  const logout = () => {
    localStorage.removeItem("fabnstitch_token");
    localStorage.removeItem("fabnstitch_user");
    navigate("/login");
  };

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/customer/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load orders");
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      logout();
      return;
    }
    fetchOrders();

    const orderId = searchParams.get("id");
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [token, fetchOrders]);

  /* ============================================
     FETCH ORDER DETAILS
  ============================================ */
  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(
        `${API_URL}/customer/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch order details");

      const data = await response.json();
      setSelectedOrder(data.order);
      setOrderHistory(data.history || []);
      setShowOrderModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  /* ============================================
     HELPERS
  ============================================ */
  const formatStatus = (status) =>
    status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const getStatusClass = (status) =>
    `status-${status.replace("_", "-")}`;

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      : "N/A";

  const getStatusIcon = (status) => {
    const icons = {
      pending: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
      confirmed: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>,
      stitching: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>,
      finishing: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
      quality_check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
      ready: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
      shipped: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
      delivered: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>,
      cancelled: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>,
    };
    return icons[status] || icons['pending'];
  };

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter(o => o.status === filter);

  /* ============================================
     UI
  ============================================ */
  return (
    <DashboardLayout>
      <div className="orders-page">
        {/* HEADER */}
        <div className="page-header">
          <div>
            <h1>My Orders</h1>
            <p>Track and manage your tailoring requests</p>
          </div>
          <Link to="/fabrics" className="btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Order
          </Link>
        </div>

        {/* FILTERS */}
        <div className="filter-tabs">
          {[
            "all",
            "pending",
            "confirmed",
            "stitching",
            "finishing",
            "quality_check",
            "ready",
            "shipped",
            "delivered",
          ].map((s) => (
            <button
              key={s}
              className={`filter-tab ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s === "all" ? "All Orders" : formatStatus(s)}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        {isLoading ? (
          <div className="orders-loading">
            <div className="loader" />
          </div>
        ) : error ? (
          <div className="orders-error">
            <p>{error}</p>
            <button onClick={fetchOrders} className="btn btn-primary">
              Retry
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-icon">📦</div>
            <h3>No orders found</h3>
            <p>You don't have any {filter !== 'all' ? filter : ''} orders yet.</p>
            {filter === 'all' && (
              <Link to="/fabrics" className="btn btn-primary">
                Place Your First Order
              </Link>
            )}
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => (
              <div
                key={order.order_id}
                className="order-card"
                onClick={() => fetchOrderDetails(order.order_id)}
              >
                <div className="order-card-header">
                  <span className="order-id">#{order.order_id}</span>
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {formatStatus(order.status)}
                  </span>
                </div>

                <div className="order-card-body">
                  <h3 className="order-style">{order.style}</h3>
                  <div className="order-fabric">
                    <div className="fabric-color" style={{ backgroundColor: order.fabric_color || '#eee' }}></div>
                    <span>{order.fabric_name}</span>
                  </div>
                  <p className="order-material">{order.material_type}</p>
                </div>

                <div className="order-card-footer">
                  <span className="order-price">₹{order.price?.toLocaleString()}</span>
                  <div className="order-dates">
                    <div className="date-item">
                      <span className="date-label">Ordered</span>
                      <span className="date-value">{formatDate(order.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL */}
        {showOrderModal && selectedOrder && (
          <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
            <div className="order-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Order Details</h2>
                <button className="modal-close" onClick={() => setShowOrderModal(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="modal-body">
                <div className="order-summary-header">
                  <span className="modal-order-id">#{selectedOrder.order_id}</span>
                  <span className={`status-badge large ${getStatusClass(selectedOrder.status)}`}>
                    {formatStatus(selectedOrder.status)}
                  </span>
                </div>

                <div className="modal-section">
                  <h3>Style & Fabric</h3>
                  <div className="order-details-grid">
                    <div className="detail-item highlight">
                      <span className="detail-label">Style</span>
                      <span className="detail-value">{selectedOrder.style}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Fabric</span>
                      <span className="detail-value">{selectedOrder.fabric_name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Color</span>
                      <span className="detail-value">{selectedOrder.fabric_color}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Price</span>
                      <span className="detail-value price">₹{selectedOrder.price}</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.measurements && (
                  <div className="modal-section">
                    <h3>Measurements</h3>
                    <div className="measurements-mini-grid">
                      {Object.entries(selectedOrder.measurements).map(([key, val]) => (
                        key !== 'id' && key !== 'user_id' && (
                          <div key={key} className="measure-item">
                            <span>{key}</span>
                            <strong>{val}"</strong>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                <div className="modal-section">
                  <h3>Order Timeline</h3>
                  <div className="order-timeline">
                    {orderHistory.map((h, i) => (
                      <div key={i} className={`timeline-item ${i === 0 ? 'current' : ''}`}>
                        <div className="timeline-dot">{orderHistory.length - i}</div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className="timeline-status">{formatStatus(h.status)}</span>
                            <span className="timeline-date">{new Date(h.changed_at).toLocaleString()}</span>
                          </div>
                          {h.note && <p className="timeline-note">{h.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CustomerOrders;
