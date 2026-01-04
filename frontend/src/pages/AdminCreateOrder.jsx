import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
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
      .then(data => setCustomers(data))
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

      setSuccess("Order created successfully 🎉");
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
    <DashboardLayout>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Create Order (Admin)</h1>
          <p>Create and manage orders for customers</p>
        </div>

        <div className="dashboard-card">
          <h2>Order Details</h2>

          {success && <p className="success-text">{success}</p>}
          {error && <p className="error-text">{error}</p>}

          {loading ? (
            <p>Loading customers...</p>
          ) : (
            <form className="admin-form" onSubmit={handleSubmit}>
              {/* CUSTOMER */}
              <select name="customer_id" required onChange={handleChange}>
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>

              {/* ORDER INFO */}
              <input name="style" placeholder="Style (Blazer, Suit)" onChange={handleChange} required />
              <input name="fabric_name" placeholder="Fabric Name" onChange={handleChange} required />
              <input name="fabric_color" placeholder="Fabric Color" onChange={handleChange} required />
              <input name="price" type="number" placeholder="Price" onChange={handleChange} required />

              {/* MEASUREMENTS */}
              <h3>Measurements (in inches)</h3>

              <input name="chest" placeholder="Chest" onChange={handleChange} />
              <input name="waist" placeholder="Waist" onChange={handleChange} />
              <input name="shoulders" placeholder="Shoulders" onChange={handleChange} />
              <input name="arm_length" placeholder="Arm Length" onChange={handleChange} />
              <input name="jacket_length" placeholder="Jacket Length" onChange={handleChange} />
              <input name="neck" placeholder="Neck" onChange={handleChange} />

              <button className="btn btn-primary">Create Order</button>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminCreateOrder;
