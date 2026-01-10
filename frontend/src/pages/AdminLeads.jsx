import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { API_URL } from '../config';
import './AdminDashboard.css';

function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem('fabnstitch_token');

  const statusOptions = [
    { value: 'all', label: 'All Leads', color: '#6c757d' },
    { value: 'new', label: 'New', color: '#007bff' },
    { value: 'contacted', label: 'Contacted', color: '#ffc107' },
    { value: 'converted', label: 'Converted', color: '#28a745' },
    { value: 'dropped', label: 'Dropped', color: '#dc3545' }
  ];

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/leads`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch leads');

      const data = await response.json();
      setLeads(data.leads || []);
    } catch (err) {
      console.error('Leads error:', err);
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setUpdateStatus(lead.status);
    setUpdateNotes(lead.notes || '');
    setShowModal(true);
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) return;

    try {
      setUpdating(true);
      const response = await fetch(`${API_URL}/admin/leads/${selectedLead.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: updateStatus,
          notes: updateNotes
        })
      });

      if (!response.ok) throw new Error('Failed to update lead');

      await fetchLeads();
      setShowModal(false);
      setSelectedLead(null);
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update lead');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: '#007bff', label: 'New', icon: '🆕' },
      contacted: { color: '#ffc107', label: 'Contacted', icon: '📞' },
      converted: { color: '#28a745', label: 'Converted', icon: '✅' },
      dropped: { color: '#dc3545', label: 'Dropped', icon: '❌' }
    };
    const config = statusConfig[status] || statusConfig.new;
    return (
      <span className="status-badge" style={{ backgroundColor: config.color }}>
        {config.icon} {config.label}
      </span>
    );
  };

  const filteredLeads = filter === 'all' 
    ? leads 
    : leads.filter(lead => lead.status === filter);

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
    dropped: leads.filter(l => l.status === 'dropped').length
  };

  return (
    <AdminLayout>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Leads Management</h1>
            <p>Manage inquiries from the website</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#e3f2fd' }}>📊</div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Leads</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#e3f2fd' }}>🆕</div>
            <div className="stat-content">
              <h3>{stats.new}</h3>
              <p>New</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fff3cd' }}>📞</div>
            <div className="stat-content">
              <h3>{stats.contacted}</h3>
              <p>Contacted</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#d4edda' }}>✅</div>
            <div className="stat-content">
              <h3>{stats.converted}</h3>
              <p>Converted</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#f8d7da' }}>❌</div>
            <div className="stat-content">
              <h3>{stats.dropped}</h3>
              <p>Dropped</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs" style={{ marginTop: '2rem' }}>
          {statusOptions.map(option => (
            <button
              key={option.value}
              className={`filter-tab ${filter === option.value ? 'active' : ''}`}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
              {option.value !== 'all' && ` (${stats[option.value]})`}
            </button>
          ))}
        </div>

        {/* Leads Table */}
        <div className="dashboard-card" style={{ marginTop: '2rem' }}>
          {loading ? (
            <div className="loading-state">
              <div className="loader"></div>
              <p>Loading leads...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchLeads} className="btn btn-primary">Retry</button>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="empty-state">
              <p>No {filter !== 'all' ? filter : ''} leads found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Company</th>
                    <th>Need</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr key={lead.id}>
                      <td>
                        <strong>{lead.name}</strong>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem' }}>
                          {lead.phone}<br />
                          {lead.email && <span style={{ color: '#666' }}>{lead.email}</span>}
                        </div>
                      </td>
                      <td>{lead.company || '—'}</td>
                      <td>
                        <span className="badge-pill">
                          {lead.need}
                        </span>
                      </td>
                      <td>{getStatusBadge(lead.status)}</td>
                      <td style={{ fontSize: '0.85rem', color: '#666' }}>
                        {formatDate(lead.created_at)}
                      </td>
                      <td>
                        <button
                          className="btn-icon"
                          onClick={() => handleViewLead(lead)}
                          title="View & Update"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Update Lead Modal */}
        {showModal && selectedLead && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div className="modal-header">
                <h2>Lead Details</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="lead-details">
                  <div className="detail-row">
                    <strong>Name:</strong>
                    <span>{selectedLead.name}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Phone:</strong>
                    <span>{selectedLead.phone}</span>
                  </div>
                  {selectedLead.email && (
                    <div className="detail-row">
                      <strong>Email:</strong>
                      <span>{selectedLead.email}</span>
                    </div>
                  )}
                  {selectedLead.company && (
                    <div className="detail-row">
                      <strong>Company:</strong>
                      <span>{selectedLead.company}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <strong>Need:</strong>
                    <span className="badge-pill">{selectedLead.need}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Submitted:</strong>
                    <span>{formatDate(selectedLead.created_at)}</span>
                  </div>
                </div>

                <hr style={{ margin: '1.5rem 0' }} />

                <div className="form-group">
                  <label htmlFor="status">Update Status</label>
                  <select
                    id="status"
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="form-control"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                    <option value="dropped">Dropped</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    className="form-control"
                    rows="4"
                    placeholder="Add notes about this lead..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleUpdateLead}
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Lead'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminLeads;
