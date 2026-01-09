import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { API_URL } from "../config";
import "./AdminDashboard.css";

function AdminTailors() {
  const navigate = useNavigate();
  const token = localStorage.getItem("fabnstitch_token");

  const [tailors, setTailors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/admin");
      return;
    }
    fetchTailors();
  }, [token, navigate]);

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
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTailors = tailors.filter((tailor) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      tailor.name?.toLowerCase().includes(search) ||
      tailor.email?.toLowerCase().includes(search) ||
      tailor.phone?.toLowerCase().includes(search) ||
      tailor.city?.toLowerCase().includes(search)
    );
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">
          <div className="loader"></div>
          <p>Loading tailors...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-users">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1>Tailor Management</h1>
            <p>View and manage all registered tailors</p>
          </div>
          <div className="header-actions">
            <div className="header-stats">
              <div className="stat-badge">
                <span className="stat-number">{tailors.length}</span>
                <span className="stat-label">Total Tailors</span>
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/admin/create-user?type=tailor")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              Add Tailor
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="search-section">
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, phone, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tailors Grid */}
        <div className="users-grid">
          {filteredTailors.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <h3>No tailors found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredTailors.map((tailor) => (
              <div key={tailor.id} className="user-card tailor-card">
                <div className="user-card-header">
                  <div className="user-avatar tailor-avatar">
                    {tailor.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <h3>{tailor.name}</h3>
                    <p className="user-email">{tailor.email}</p>
                    <span className="role-badge tailor">Tailor</span>
                  </div>
                </div>

                <div className="user-card-body">
                  <div className="user-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>{tailor.phone || "Not provided"}</span>
                  </div>

                  <div className="user-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{tailor.city || "Not provided"}</span>
                  </div>

                  <div className="user-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>
                      Joined {new Date(tailor.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="tailor-stats">
                    <div className="tailor-stat">
                      <span className="stat-value">{tailor.total_orders || 0}</span>
                      <span className="stat-label">Total Orders</span>
                    </div>
                  </div>
                </div>

                <div className="user-card-footer">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => navigate("/admin/orders")}
                  >
                    View Orders
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminTailors;
