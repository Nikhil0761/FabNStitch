/* ============================================
   Customer Profile Page (PRODUCTION FINAL)
============================================ */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Edit2, CheckCircle, AlertCircle, Mail, MapPin, Phone, Save, Lock, Shield, Settings, X } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import "./CustomerProfile.css";
import { API_URL } from "../config";

function CustomerProfile() {
  const navigate = useNavigate();

  // ✅ CORRECT TOKEN
  const token = localStorage.getItem("fabnstitch_token");

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  /* ============================================
     HELPERS
  ============================================ */
  const logout = () => {
    localStorage.removeItem("fabnstitch_token");
    localStorage.removeItem("fabnstitch_user");
    navigate("/login");
  };

  /* ============================================
     LOAD PROFILE
  ============================================ */
  useEffect(() => {
    if (!token) {
      logout();
      return;
    }
    fetchProfile();
    // eslint-disable-next-line
  }, [token]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);

      const res = await fetch(`${API_URL}/customer/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch profile");

      const data = await res.json();

      // ✅ ROLE CHECK
      if (data.user.role !== "customer") {
        logout();
        return;
      }

      setUser(data.user);
      setFormData({
        name: data.user.name || "",
        phone: data.user.phone || "",
        address: data.user.address || "",
        city: data.user.city || "",
      });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load profile" });
    } finally {
      setIsLoading(false);
    }
  };

  /* ============================================
     UPDATE PROFILE
  ============================================ */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API_URL}/customer/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) throw new Error("Update failed");

      const data = await res.json();

      setUser(data.user);
      localStorage.setItem("fabnstitch_user", JSON.stringify(data.user));
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully" });

      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Profile update failed" });
    } finally {
      setIsSaving(false);
    }
  };

  /* ============================================
     CHANGE PASSWORD
  ============================================ */
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((p) => ({ ...p, [name]: value }));
    setPasswordError("");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await fetch(`${API_URL}/auth/password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowPasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage({ type: "success", text: "Password changed successfully" });
    } catch (err) {
      setPasswordError(err.message || "Password update failed");
    } finally {
      setIsChangingPassword(false);
    }
  };

  /* ============================================
     STATES
  ============================================ */
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="profile-loading">
          <div className="loader" />
          <p>Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  /* ============================================
     UI
  ============================================ */
  return (
    <DashboardLayout role="customer">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>My Profile</h1>
            <p>Manage your account settings and preferences</p>
          </div>
        </div>

        {message.text && (
          <div className={`message-banner ${message.type}`}>
            {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        <div className="profile-grid">
          {/* Left Column: Personal Information */}
          <div className="profile-section main-info">
            <div className="section-header">
              <User size={24} className="section-icon" />
              <h2>Personal Information</h2>
              {!isEditing && (
                <button
                  className="icon-btn edit-btn"
                  onClick={() => setIsEditing(true)}
                  title="Edit Profile"
                >
                  <Edit2 size={18} />
                </button>
              )}
            </div>

            <div className="profile-card-content">
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="profile-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <div className="input-wrapper">
                      <User size={18} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your Name"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-wrapper">
                      <Mail size={18} />
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="disabled-input"
                      />
                    </div>
                    <span className="input-hint">Email cannot be changed</span>
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <div className="input-wrapper">
                      <Phone size={18} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone Number"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>City</label>
                    <div className="input-wrapper">
                      <MapPin size={18} />
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                      />
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label>Delivery Address</label>
                    <div className="input-wrapper textarea-wrapper">
                      <MapPin size={18} className="mt-1" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Complete Address"
                        rows="3"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user.name || "",
                          phone: user.phone || "",
                          address: user.address || "",
                          city: user.city || "",
                        });
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="save-btn" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <span className="spinner-small"></span> Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="info-display">
                  <div className="info-row">
                    <span className="label">Full Name</span>
                    <span className="value">{user?.name || "Not set"}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Email</span>
                    <span className="value">{user?.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phone</span>
                    <span className="value">{user?.phone || "Not set"}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">City</span>
                    <span className="value">{user?.city || "Not set"}</span>
                  </div>
                  <div className="info-row full-width">
                    <span className="label">Address</span>
                    <span className="value address-value">{user?.address || "Not set"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Security & Settings */}
          <div className="profile-sidebar">
            <div className="profile-section security-section">
              <div className="section-header">
                <Shield size={24} className="section-icon" />
                <h2>Security</h2>
              </div>
              <div className="profile-card-content">
                <p className="security-desc">
                  Manage your password and account security settings.
                </p>
                <button
                  className="change-password-btn"
                  onClick={() => setShowPasswordModal(true)}
                >
                  <Lock size={18} /> Change Password
                </button>
              </div>
            </div>

            {/* Placeholder for future preferences/notifications */}
            {/* 
            <div className="profile-section preferences-section">
              <div className="section-header">
                <Settings size={24} className="section-icon" />
                <h2>Preferences</h2>
              </div>
              ...
            </div> 
            */}
          </div>
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="modal-overlay">
            <div className="modal-content password-modal">
              <div className="modal-header">
                <h2>Change Password</h2>
                <button onClick={() => setShowPasswordModal(false)} className="close-btn">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label>Current Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="save-btn" disabled={isChangingPassword}>
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CustomerProfile;
