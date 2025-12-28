/* ============================================
   Tailor Profile Page
============================================ */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TailorLayout from "../components/TailorLayout";
// Assuming we recycle the CSS or create a new one. Let's reuse CustomerProfile.css for now if it's generic enough,
// or just inline styles/create a specific css. Given instructions, let's make it work nicely.
// If CustomerProfile.css is generic to .profile-page, it might just work.
import "./CustomerProfile.css";
import { API_URL } from "../config";

function TailorProfile() {
    const navigate = useNavigate();
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

            const res = await fetch(`${API_URL}/tailor/profile`, {
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

            if (data.user.role !== "tailor") {
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
            const res = await fetch(`${API_URL}/tailor/profile`, {
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

    if (isLoading) {
        return (
            <TailorLayout>
                <div className="profile-loading" style={{ padding: '40px', textAlign: 'center' }}>
                    <div className="loader" />
                    <p>Loading profile...</p>
                </div>
            </TailorLayout>
        );
    }

    return (
        <TailorLayout>
            <div className="profile-page">
                <div className="page-header">
                    <div>
                        <h1>Tailor Profile</h1>
                        <p>Manage your account settings</p>
                    </div>
                    {!isEditing && (
                        <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </button>
                    )}
                </div>

                {message.text && (
                    <div className={`message-banner ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="profile-content">
                    <div className="profile-card main-card">
                        <h2>{user.name}</h2>
                        <p>{user.email}</p>
                        <span className="role-badge">Tailor</span>

                        {isEditing && (
                            <form onSubmit={handleSaveProfile} style={{ marginTop: '20px' }}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label>Full Name</label>
                                    <input className="auth-input" name="name" value={formData.name} onChange={handleInputChange} />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label>Phone</label>
                                    <input className="auth-input" name="phone" value={formData.phone} onChange={handleInputChange} />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label>City</label>
                                    <input className="auth-input" name="city" value={formData.city} onChange={handleInputChange} />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label>Shop Address</label>
                                    <textarea className="auth-input" name="address" value={formData.address} onChange={handleInputChange} rows={3} />
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="btn btn-primary" disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</button>
                                    <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
                                </div>
                            </form>
                        )}

                        {!isEditing && (
                            <div className="profile-details" style={{ marginTop: '20px', lineHeight: '1.6' }}>
                                <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                                <p><strong>City:</strong> {user.city || 'N/A'}</p>
                                <p><strong>Address:</strong> {user.address || 'N/A'}</p>
                            </div>
                        )}

                    </div>

                    <div className="profile-card security-card">
                        <h3>Security</h3>
                        <button className="btn btn-outline" onClick={() => setShowPasswordModal(true)}>Change Password</button>
                    </div>
                </div>

                {showPasswordModal && (
                    <div className="modal-overlay">
                        <form className="password-modal" onSubmit={handleChangePassword}>
                            <h3>Change Password</h3>
                            {passwordError && <p className="password-error">{passwordError}</p>}

                            <div style={{ marginBottom: '10px' }}>
                                <label>Current Password</label>
                                <input className="auth-input" name="currentPassword" type="password" onChange={handlePasswordChange} required />
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <label>New Password</label>
                                <input className="auth-input" name="newPassword" type="password" onChange={handlePasswordChange} required />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label>Confirm Password</label>
                                <input className="auth-input" name="confirmPassword" type="password" onChange={handlePasswordChange} required />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                                <button className="btn btn-primary" disabled={isChangingPassword}>
                                    {isChangingPassword ? "Changing..." : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </TailorLayout>
    );
}

export default TailorProfile;
