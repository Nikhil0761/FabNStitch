/* ============================================
   Tailor Profile Page

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
   ============================================ */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TailorLayout from '../components/TailorLayout';
import './TailorProfile.css';

import { API_URL } from '../config';

function TailorProfile() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: ''
  });

  // Password change
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [token, navigate]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/tailor/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setUser(data.tailor);
      setStats(data.stats);
      setFormData({
        name: data.tailor.name || '',
        phone: data.tailor.phone || '',
        address: data.tailor.address || '',
        city: data.tailor.city || ''
      });
    } catch (err) {
      console.error('Profile error:', err);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_URL}/tailor/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setUser(data.tailor);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Update error:', err);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || ''
    });
    setIsEditing(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validation
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    setPasswordError('');

    try {
      const response = await fetch(`${API_URL}/auth/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Password change error:', err);
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <TailorLayout>
        <div className="tailor-profile-loading">
          <div className="loader"></div>
          <p>Loading profile...</p>
        </div>
      </TailorLayout>
    );
  }

  return (
    <TailorLayout>
      <div className="tailor-profile-page">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-text">
            <h1>My Profile</h1>
            <p>Manage your personal information and settings</p>
          </div>
          {!isEditing && (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Profile
            </button>
          )}
        </div>

        {/* Success/Error Message */}
        {message.text && (
          <div className={`message-banner ${message.type}`}>
            {message.type === 'success' ? '✓' : '⚠'} {message.text}
          </div>
        )}

        {/* Profile Content */}
        <div className="profile-content">
          {/* Main Profile Card */}
          <div className="profile-card main-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="profile-intro">
                <h2>{user?.name}</h2>
                <p className="profile-email">{user?.email}</p>
                <div className="profile-badges">
                  <span className="role-badge">Tailor</span>
                  <span className="member-since">Since {formatDate(user?.created_at)}</span>
                </div>
              </div>
            </div>

            {isEditing ? (
              <form className="profile-form" onSubmit={handleSaveProfile}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label htmlFor="address">Address</label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Enter your address"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Mumbai"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      Full Name
                    </span>
                    <span className="detail-value">{user?.name || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      Phone
                    </span>
                    <span className="detail-value">{user?.phone || 'Not provided'}</span>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      Email
                    </span>
                    <span className="detail-value">{user?.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      City
                    </span>
                    <span className="detail-value">{user?.city || 'Not provided'}</span>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-item full-width">
                    <span className="detail-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      Address
                    </span>
                    <span className="detail-value">{user?.address || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="profile-sidebar">
            {/* Performance Stats Card */}
            <div className="profile-card stats-card">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20V10"/>
                  <path d="M18 20V4"/>
                  <path d="M6 20v-4"/>
                </svg>
                Performance
              </h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{stats?.total_completed || 0}</span>
                  <span className="stat-label">Orders Completed</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats?.active_days || 0}</span>
                  <span className="stat-label">Active Days</span>
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="profile-card security-card">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Security
              </h3>
              <p>Keep your account secure by using a strong password.</p>
              
              <button className="btn btn-outline" onClick={() => setShowPasswordModal(true)}>
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <div className="password-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Change Password</h2>
                <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleChangePassword}>
                <div className="modal-body">
                  {passwordError && (
                    <div className="password-error">{passwordError}</div>
                  )}
                  
                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                    />
                    <span className="input-hint">At least 6 characters</span>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setShowPasswordModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isChangingPassword}>
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </TailorLayout>
  );
}

export default TailorProfile;

