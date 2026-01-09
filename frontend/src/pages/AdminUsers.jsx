import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { API_URL } from "../config";
import "./AdminDashboard.css";

function AdminUsers() {
  const navigate = useNavigate();
  const token = localStorage.getItem("fabnstitch_token");

  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/admin");
      return;
    }
    fetchCustomers();
  }, [token, navigate]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch customers");

      const data = await response.json();
      setCustomers(data.customers);
    } catch (err) {
      console.error("Customers error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(search) ||
      customer.email?.toLowerCase().includes(search) ||
      customer.phone?.toLowerCase().includes(search) ||
      customer.city?.toLowerCase().includes(search)
    );
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">
          <div className="loader"></div>
          <p>Loading customers...</p>
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
            <h1>Customer Management</h1>
            <p>View and manage all registered customers</p>
          </div>
          <div className="header-actions">
            <div className="header-stats">
              <div className="stat-badge">
                <span className="stat-number">{customers.length}</span>
                <span className="stat-label">Total Customers</span>
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/admin/create-user?type=customer")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              Add Customer
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

        {/* Customers Grid */}
        <div className="users-grid">
          {filteredCustomers.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h3>No customers found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div key={customer.id} className="user-card">
                <div className="user-card-header">
                  <div className="user-avatar">
                    {customer.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <h3>{customer.name}</h3>
                    <p className="user-email">{customer.email}</p>
                  </div>
                </div>

                <div className="user-card-body">
                  <div className="user-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>{customer.phone || "Not provided"}</span>
                  </div>

                  <div className="user-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{customer.city || "Not provided"}</span>
                  </div>

                  <div className="user-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>
                      Joined {new Date(customer.created_at).toLocaleDateString()}
                    </span>
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

export default AdminUsers;
