import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import "./Auth.css";

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      console.log("Registration success:", data); // Debugging

      localStorage.setItem("fabnstitch_token", data.token);
      localStorage.setItem("fabnstitch_user", JSON.stringify(data.user));

      if (data.user.role === "tailor") {
        navigate("/tailor/dashboard");
      } else {
        // Default to customer dashboard for safety
        navigate("/customer/dashboard");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Panel: Promo (Reversed for Sign Up) */}
      <div className="auth-panel light">
        <div className="circle-decoration c1"></div>
        <div className="circle-decoration c2"></div>
        <div className="circle-decoration c3"></div>

        <h1 className="auth-title" style={{ fontFamily: 'Playfair Display, serif' }}>Welcome Back!</h1>
        <p className="auth-subtitle">
          Already have an account? Sign in to access your dashboard.
        </p>

        <Link to="/login" className="btn-outline">
          Sign In
        </Link>
      </div>

      {/* Right Panel: Sign Up Form */}
      <div className="auth-panel dark">
        <h1 className="auth-title">Sign Up</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p style={{ color: "#ff6b6b", fontSize: "0.9rem", textAlign: "center", margin: 0 }}>{error}</p>}

          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input className="auth-input" name="name" placeholder="John Doe" required onChange={handleChange} />
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <input className="auth-input" name="email" type="email" placeholder="you@company.com" required onChange={handleChange} />
          </div>

          <div className="input-group">
            <label className="input-label">Phone</label>
            <input className="auth-input" name="phone" placeholder="+1234567890" required onChange={handleChange} />
          </div>

          <div className="input-group">
            <label className="input-label">I am a...</label>
            {/* Custom select styling can be tricky, using basic one for now but styled dark */}
            <select className="auth-input" name="role" value={formData.role} onChange={handleChange} style={{ cursor: 'pointer' }}>
              <option value="customer">Customer</option>
              <option value="tailor">Tailor</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input className="auth-input" name="password" type="password" placeholder="••••••••" required onChange={handleChange} />
          </div>

          <button className="btn-primary" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
            {!loading && <ArrowRight />}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
