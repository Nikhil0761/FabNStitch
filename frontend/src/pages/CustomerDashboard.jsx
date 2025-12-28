import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { API_URL } from "../config";
import "./CustomerDashboard.css";

function CustomerDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("fabnstitch_token");

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [measurements, setMeasurements] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return navigate("/login");

    Promise.all([
      fetch(`${API_URL}/customer/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_URL}/customer/measurements`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(async ([d, m]) => {
        if (d.status === 401 || d.status === 403) throw new Error();
        const dash = await d.json();
        const meas = await m.json();

        if (dash.user.role !== "customer") throw new Error();

        setUser(dash.user);
        setStats(dash.stats);
        setRecentOrders(dash.recentOrders || []);
        setMeasurements(meas.measurements);
      })
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="dashboard-content-loading">
          <div className="loader"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Welcome back, {user.name.split(" ")[0]}! 👋</h1>
          <p>Here's what's happening with your tailored outfits.</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.totalOrders}</span>
              <span className="stat-label">Total Orders</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.activeOrders}</span>
              <span className="stat-label">In Progress</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-success">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.completedOrders}</span>
              <span className="stat-label">Delivered</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div className="stat-content">
              <span className="stat-number">{measurements ? "On File" : "Missing"}</span>
              <span className="stat-label">Measurements</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="dashboard-grid">
          {/* Recent Orders */}
          <div className="dashboard-card main-card">
            <div className="card-header">
              <h2>Recent Activity</h2>
              <Link to="/customer/orders" className="view-all-link">View All Orders</Link>
            </div>

            <div className="orders-list">
              {recentOrders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <p>You haven't placed any orders yet.</p>
                  <Link to="/fabrics" className="btn btn-primary">Browse Fabrics</Link>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.order_id}
                    className="order-item"
                    onClick={() => navigate(`/customer/orders?id=${order.order_id}`)}
                  >
                    <div className="order-icon-wrapper">
                      <div className={`order-icon-bg ${order.status}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                      </div>
                    </div>
                    <div className="order-info">
                      <span className="order-id">Order #{order.order_id}</span>
                      <span className="order-style">{order.style} • {order.fabric_name}</span>
                    </div>
                    <div className="order-meta">
                      <span className="order-price">₹{order.price}</span>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions / Measurements Preview */}
          <div className="dashboard-sidebar-col">
            <div className="dashboard-card mb-4">
              <div className="card-header">
                <h2>Quick Actions</h2>
              </div>
              <div className="quick-actions">
                <Link to="/fabrics" className="quick-action-btn primary">
                  <span className="icon">✨</span>
                  <span>New Order</span>
                </Link>
                <Link to="/customer/support" className="quick-action-btn">
                  <span className="icon">💬</span>
                  <span>Contact Support</span>
                </Link>
                <Link to="/customer/profile" className="quick-action-btn">
                  <span className="icon">👤</span>
                  <span>Update Profile</span>
                </Link>
              </div>
            </div>

            {measurements && (
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>My Fit</h2>
                  <Link to="/customer/profile" className="view-all-link">Edit</Link>
                </div>
                <div className="measurements-preview">
                  <div className="meas-item">
                    <label>Chest</label>
                    <strong>{measurements.chest}"</strong>
                  </div>
                  <div className="meas-item">
                    <label>Waist</label>
                    <strong>{measurements.waist}"</strong>
                  </div>
                  <div className="meas-item">
                    <label>Height</label>
                    <strong>{measurements.height}"</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CustomerDashboard;
