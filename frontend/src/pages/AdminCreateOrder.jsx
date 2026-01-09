import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { API_URL } from "../config";
import "./AdminDashboard.css";

function AdminCreateOrder() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("fabnstitch_token");

  const [formData, setFormData] = useState({
    customer_id: "",
    style: "",
    fabric_name: "",
    fabric_color: "",
    price: "",
    chest: "",
    waist: "",
    shoulders: "",
    arm_length: "",
    jacket_length: "",
    neck: "",
  });

  /* ================= FETCH CUSTOMERS ================= */

  useEffect(() => {
    fetch(`${API_URL}/admin/customers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setCustomers(data.customers || []))
      .catch(() => setError("Failed to load customers"))
      .finally(() => setLoading(false));
  }, [token]);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/admin/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order creation failed");

      setSuccess("Order created successfully! 🎉");
      setFormData({
        customer_id: "",
        style: "",
        fabric_name: "",
        fabric_color: "",
        price: "",
        chest: "",
        waist: "",
        shoulders: "",
        arm_length: "",
        jacket_length: "",
        neck: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  /* ================= UI ================= */

  return (
    <AdminLayout>
      <div className="admin-create-order">
        <div className="page-header">
          <div>
            <h1>Create Order</h1>
            <p>Create and assign orders for customers</p>
          </div>
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

          {loading ? (
            <div className="loading-state">
              <div className="loader"></div>
              <p>Loading customers...</p>
            </div>
          ) : (
            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Customer Selection</h3>
                <div className="form-group">
                  <label htmlFor="customer_id">Select Customer *</label>
                  <select
                    id="customer_id"
                    name="customer_id"
                    value={formData.customer_id}
                    required
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="">Choose a customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h3>Order Details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="style">Style *</label>
                    <input
                      id="style"
                      name="style"
                      value={formData.style}
                      placeholder="e.g., Blazer, Suit, Shirt"
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="price">Price (₹) *</label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      placeholder="Enter price"
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="fabric_name">Fabric Name *</label>
                    <input
                      id="fabric_name"
                      name="fabric_name"
                      value={formData.fabric_name}
                      placeholder="e.g., Wool, Cotton"
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="fabric_color">Fabric Color *</label>
                    <input
                      id="fabric_color"
                      name="fabric_color"
                      value={formData.fabric_color}
                      placeholder="e.g., Navy Blue"
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Measurements (in inches)</h3>
                <div className="form-grid measurements-grid">
                  <div className="form-group">
                    <label htmlFor="chest">Chest</label>
                    <input
                      id="chest"
                      name="chest"
                      type="number"
                      step="0.1"
                      value={formData.chest}
                      placeholder="38"
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="waist">Waist</label>
                    <input
                      id="waist"
                      name="waist"
                      type="number"
                      step="0.1"
                      value={formData.waist}
                      placeholder="32"
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="shoulders">Shoulders</label>
                    <input
                      id="shoulders"
                      name="shoulders"
                      type="number"
                      step="0.1"
                      value={formData.shoulders}
                      placeholder="16"
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="arm_length">Arm Length</label>
                    <input
                      id="arm_length"
                      name="arm_length"
                      type="number"
                      step="0.1"
                      value={formData.arm_length}
                      placeholder="24"
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="jacket_length">Jacket Length</label>
                    <input
                      id="jacket_length"
                      name="jacket_length"
                      type="number"
                      step="0.1"
                      value={formData.jacket_length}
                      placeholder="30"
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="neck">Neck</label>
                    <input
                      id="neck"
                      name="neck"
                      type="number"
                      step="0.1"
                      value={formData.neck}
                      placeholder="15"
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-lg">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  Create Order
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminCreateOrder;
