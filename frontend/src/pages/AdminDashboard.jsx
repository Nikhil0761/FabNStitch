import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { API_URL } from "../config";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("fabnstitch_token");

  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/admin");
      return;
    }
    fetchDashboardData();
  }, [token, navigate]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("fabnstitch_token");
          navigate("/admin");
          return;
        }
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">
          <div className="loader"></div>
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="error-state">
          <p>{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome back! Here's what's happening with FabNStitch today.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card customers">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats?.customers || 0}</h3>
              <p>Total Customers</p>
            </div>
          </div>

          <div className="stat-card tailors">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats?.tailors || 0}</h3>
              <p>Active Tailors</p>
            </div>
          </div>

          <div className="stat-card orders">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats?.orders || 0}</h3>
              <p>Total Orders</p>
            </div>
          </div>

          <div className="stat-card revenue">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="stat-content">
              <h3>₹{stats?.orderStats?.totalRevenue?.toLocaleString() || 0}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Order Status Overview */}
        <div className="dashboard-row">
          <div className="dashboard-card order-status-card">
            <div className="card-header">
              <h2>Order Status Overview</h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20V10M18 20V4M6 20v-4" />
              </svg>
            </div>
            <div className="order-status-grid">
              <div className="status-item pending">
                <div className="status-number">{stats?.orderStats?.pending || 0}</div>
                <div className="status-label">Pending</div>
              </div>
              <div className="status-item confirmed">
                <div className="status-number">{stats?.orderStats?.confirmed || 0}</div>
                <div className="status-label">Confirmed</div>
              </div>
              <div className="status-item stitching">
                <div className="status-number">{stats?.orderStats?.stitching || 0}</div>
                <div className="status-label">In Production</div>
              </div>
              <div className="status-item delivered">
                <div className="status-number">{stats?.orderStats?.delivered || 0}</div>
                <div className="status-label">Delivered</div>
              </div>
            </div>
          </div>

          <div className="dashboard-card support-card">
            <div className="card-header">
              <h2>Support Tickets</h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="support-stats">
              <div className="support-stat open">
                <div className="support-number">{stats?.openTickets || 0}</div>
                <div className="support-label">Open Tickets</div>
              </div>
              <button 
                className="btn btn-outline"
                onClick={() => navigate("/admin/support")}
              >
                View All Tickets
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card quick-actions-card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-actions-grid">
            <button 
              className="quick-action-btn create-order"
              onClick={() => navigate("/admin/create-order")}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span>Create New Order</span>
            </button>

            <button 
              className="quick-action-btn manage-orders"
              onClick={() => navigate("/admin/orders")}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>Manage Orders</span>
            </button>

            <button 
              className="quick-action-btn manage-customers"
              onClick={() => navigate("/admin/users")}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              <span>View Customers</span>
            </button>

            <button 
              className="quick-action-btn manage-tailors"
              onClick={() => navigate("/admin/tailors")}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
              </svg>
              <span>View Tailors</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
