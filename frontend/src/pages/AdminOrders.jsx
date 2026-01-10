import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { API_URL } from "../config";
import "./AdminDashboard.css";

function AdminOrders() {
  const navigate = useNavigate();
  const token = localStorage.getItem("fabnstitch_token");

  const [orders, setOrders] = useState([]);
  const [tailors, setTailors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedTailor, setSelectedTailor] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/admin");
      return;
    }
    
    const loadData = async () => {
      await fetchOrders();
      await fetchTailors();
    };
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch orders");

      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      console.error("Orders error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTailors = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/tailors`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch tailors");

      const data = await response.json();
      setTailors(data.tailors);
    } catch (err) {
      console.error("Tailors error:", err);
    }
  };

  const handleAssignTailor = async () => {
    if (!selectedTailor) return;

    setActionLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/admin/orders/${selectedOrder.order_id}/assign-tailor`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tailorId: selectedTailor }),
        }
      );

      if (!response.ok) throw new Error("Failed to assign tailor");

      await fetchOrders();
      setShowAssignModal(false);
      setSelectedOrder(null);
      setSelectedTailor("");
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return;

    setActionLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/admin/orders/${selectedOrder.order_id}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: selectedStatus, notes: statusNotes }),
        }
      );

      if (!response.ok) throw new Error("Failed to update status");

      await fetchOrders();
      setShowStatusModal(false);
      setSelectedOrder(null);
      setSelectedStatus("");
      setStatusNotes("");
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      confirmed: "#3b82f6",
      stitching: "#8b5cf6",
      finishing: "#ec4899",
      quality_check: "#14b8a6",
      ready: "#10b981",
      shipped: "#06b6d4",
      delivered: "#22c55e",
      cancelled: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  const filteredOrders = orders
    .filter((order) => {
      if (filterStatus !== "all" && order.status !== filterStatus) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          order.order_id.toLowerCase().includes(search) ||
          order.customer_name?.toLowerCase().includes(search) ||
          order.style?.toLowerCase().includes(search)
        );
      }
      return true;
    });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">
          <div className="loader"></div>
          <p>Loading orders...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-orders">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1>All Orders</h1>
            <p>Manage and track all customer orders</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => navigate("/admin/create-order")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Create Order
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px', padding: '15px', background: '#fee', border: '1px solid #fcc', borderRadius: '5px', color: '#c00' }}>
            <strong>⚠️  Error:</strong> {error}
            <button onClick={() => setError('')} style={{ marginLeft: '15px', padding: '5px 10px', cursor: 'pointer' }}>
              Dismiss
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="orders-filters">
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by Order ID, Customer, or Style..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="stitching">Stitching</option>
            <option value="finishing">Finishing</option>
            <option value="quality_check">Quality Check</option>
            <option value="ready">Ready</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="dashboard-card">
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Style</th>
                  <th>Tailor</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <span className="order-id">{order.order_id}</span>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <strong>{order.customer_name}</strong>
                          <span className="email-small">{order.customer_email}</span>
                        </div>
                      </td>
                      <td>{order.style || "-"}</td>
                      <td>
                        {order.tailor_name ? (
                          <span className="tailor-assigned">{order.tailor_name}</span>
                        ) : (
                          <button
                            className="btn-link"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowAssignModal(true);
                            }}
                          >
                            Assign Tailor
                          </button>
                        )}
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {order.status.replace("_", " ")}
                        </span>
                      </td>
                      <td>₹{order.price?.toLocaleString() || 0}</td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn-icon"
                          onClick={() => {
                            setSelectedOrder(order);
                            setSelectedStatus(order.status);
                            setShowStatusModal(true);
                          }}
                          title="Update Status"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assign Tailor Modal */}
        {showAssignModal && (
          <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Assign Tailor to Order</h2>
                <button className="modal-close" onClick={() => setShowAssignModal(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="modal-body">
                <p><strong>Order ID:</strong> {selectedOrder?.order_id}</p>
                <p><strong>Customer:</strong> {selectedOrder?.customer_name}</p>
                <p><strong>Style:</strong> {selectedOrder?.style}</p>
                
                <div className="form-group">
                  <label>Select Tailor</label>
                  <select
                    value={selectedTailor}
                    onChange={(e) => setSelectedTailor(e.target.value)}
                    className="form-control"
                  >
                    <option value="">Choose a tailor</option>
                    {tailors.map((tailor) => (
                      <option key={tailor.id} value={tailor.id}>
                        {tailor.name} ({tailor.total_orders} orders)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAssignTailor}
                  disabled={!selectedTailor || actionLoading}
                >
                  {actionLoading ? "Assigning..." : "Assign Tailor"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update Status Modal */}
        {showStatusModal && (
          <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Update Order Status</h2>
                <button className="modal-close" onClick={() => setShowStatusModal(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="modal-body">
                <p><strong>Order ID:</strong> {selectedOrder?.order_id}</p>
                <p><strong>Customer:</strong> {selectedOrder?.customer_name}</p>
                
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="form-control"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="stitching">Stitching</option>
                    <option value="finishing">Finishing</option>
                    <option value="quality_check">Quality Check</option>
                    <option value="ready">Ready</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Notes (Optional)</label>
                  <textarea
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="Add a note about this status change..."
                    rows="3"
                    className="form-control"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setShowStatusModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleUpdateStatus}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminOrders;
