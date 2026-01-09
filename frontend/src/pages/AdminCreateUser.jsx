import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { API_URL } from "../config";
import "./AdminDashboard.css";

function AdminCreateUser() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userType = searchParams.get("type") || "customer"; // customer or tailor
  const token = localStorage.getItem("fabnstitch_token");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
    city: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const endpoint = userType === "tailor" ? "create-tailor" : "create-customer";
      
      const response = await fetch(`${API_URL}/admin/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `${userType} creation failed`);
      }

      setSuccess(`${userType === "tailor" ? "Tailor" : "Customer"} created successfully!`);
      
      // Reset form
      setFormData({
        email: "",
        password: "",
        name: "",
        phone: "",
        address: "",
        city: "",
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(userType === "tailor" ? "/admin/tailors" : "/admin/users");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-create-user">
        <div className="page-header">
          <div>
            <h1>Create {userType === "tailor" ? "Tailor" : "Customer"}</h1>
            <p>Add a new {userType} to the system</p>
          </div>
          <button
            className="btn btn-outline"
            onClick={() => navigate(userType === "tailor" ? "/admin/tailors" : "/admin/users")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to List
          </button>
        </div>

        <div className="dashboard-card">
          {success && (
            <div className="alert alert-success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {success}
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Account Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@example.com"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className="form-control"
                    required
                    minLength={6}
                  />
                  <small style={{ color: "#718096", fontSize: "0.85rem" }}>
                    Minimum 6 characters
                  </small>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Mumbai"
                    className="form-control"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter full address"
                    className="form-control"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate(userType === "tailor" ? "/admin/tailors" : "/admin/users")}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? (
                  <>
                    <div className="loader-small"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="20" y1="8" x2="20" y2="14" />
                      <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                    Create {userType === "tailor" ? "Tailor" : "Customer"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminCreateUser;
