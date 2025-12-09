/* ============================================
   Customer Support Page
   ============================================ */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import './CustomerSupport.css';

const API_URL = 'http://localhost:5000/api';

function CustomerSupport() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // New ticket form
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchTickets();
  }, [token, navigate]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/customer/tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch tickets');
      }

      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error('Tickets error:', err);
      setMessage({ type: 'error', text: 'Failed to load support tickets' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewTicketChange = (e) => {
    const { name, value } = e.target;
    setNewTicket(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/customer/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTicket)
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      const data = await response.json();
      setTickets(prev => [data.ticket, ...prev]);
      setShowNewTicketModal(false);
      setNewTicket({ subject: '', message: '', priority: 'medium' });
      setMessage({ type: 'success', text: 'Support ticket created successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Create ticket error:', err);
      setMessage({ type: 'error', text: 'Failed to create ticket. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    const classes = {
      open: 'status-open',
      in_progress: 'status-progress',
      resolved: 'status-resolved',
      closed: 'status-closed'
    };
    return classes[status] || 'status-open';
  };

  const getStatusLabel = (status) => {
    const labels = {
      open: 'Open',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed'
    };
    return labels[status] || status;
  };

  const getPriorityClass = (priority) => {
    const classes = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high',
      urgent: 'priority-urgent'
    };
    return classes[priority] || 'priority-medium';
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      urgent: '🔴'
    };
    return icons[priority] || '🟡';
  };

  return (
    <DashboardLayout>
      <div className="support-page">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1>Support</h1>
            <p>Get help with your orders and account</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowNewTicketModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Ticket
          </button>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div className={`message-banner ${message.type}`}>
            {message.type === 'success' ? '✓' : '⚠'} {message.text}
          </div>
        )}

        {/* Quick Help Section */}
        <div className="quick-help-section">
          <h2>Quick Help</h2>
          <div className="help-cards">
            <a href="tel:+919920077539" className="help-card">
              <div className="help-icon">📞</div>
              <h3>Call Us</h3>
              <p>+91 99200 77539</p>
              <span>Mon-Sat, 10AM-7PM</span>
            </a>
            <a href="mailto:support@fabnstitch.com" className="help-card">
              <div className="help-icon">✉️</div>
              <h3>Email Us</h3>
              <p>support@fabnstitch.com</p>
              <span>Response within 24hrs</span>
            </a>
            <a href="https://wa.me/919920077539" target="_blank" rel="noopener noreferrer" className="help-card">
              <div className="help-icon">💬</div>
              <h3>WhatsApp</h3>
              <p>Chat with us</p>
              <span>Quick responses</span>
            </a>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="tickets-section">
          <h2>Your Support Tickets</h2>
          
          {isLoading ? (
            <div className="tickets-loading">
              <div className="loader"></div>
              <p>Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="tickets-empty">
              <div className="empty-icon">🎫</div>
              <h3>No support tickets</h3>
              <p>You haven't created any support tickets yet.</p>
              <button className="btn btn-primary" onClick={() => setShowNewTicketModal(true)}>
                Create Your First Ticket
              </button>
            </div>
          ) : (
            <div className="tickets-list">
              {tickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  className="ticket-card"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="ticket-header">
                    <span className="ticket-id">#{ticket.id}</span>
                    <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                  </div>
                  <h3 className="ticket-subject">{ticket.subject}</h3>
                  <p className="ticket-preview">
                    {ticket.message.length > 100 
                      ? ticket.message.substring(0, 100) + '...' 
                      : ticket.message}
                  </p>
                  <div className="ticket-footer">
                    <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
                      {getPriorityIcon(ticket.priority)} {ticket.priority}
                    </span>
                    <span className="ticket-date">{formatDate(ticket.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Ticket Modal */}
        {showNewTicketModal && (
          <div className="modal-overlay" onClick={() => setShowNewTicketModal(false)}>
            <div className="ticket-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Support Ticket</h2>
                <button className="modal-close" onClick={() => setShowNewTicketModal(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleCreateTicket}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={newTicket.subject}
                      onChange={handleNewTicketChange}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="priority">Priority</label>
                    <select
                      id="priority"
                      name="priority"
                      value={newTicket.priority}
                      onChange={handleNewTicketChange}
                    >
                      <option value="low">🟢 Low - General inquiry</option>
                      <option value="medium">🟡 Medium - Need help soon</option>
                      <option value="high">🟠 High - Urgent issue</option>
                      <option value="urgent">🔴 Urgent - Critical problem</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={newTicket.message}
                      onChange={handleNewTicketChange}
                      placeholder="Describe your issue in detail..."
                      rows="5"
                      required
                    />
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setShowNewTicketModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
            <div className="ticket-detail-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="ticket-detail-title">
                  <span className="ticket-id">Ticket #{selectedTicket.id}</span>
                  <span className={`status-badge large ${getStatusClass(selectedTicket.status)}`}>
                    {getStatusLabel(selectedTicket.status)}
                  </span>
                </div>
                <button className="modal-close" onClick={() => setSelectedTicket(null)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              
              <div className="modal-body">
                <div className="ticket-detail-meta">
                  <div className="meta-item">
                    <span className="meta-label">Priority</span>
                    <span className={`priority-badge ${getPriorityClass(selectedTicket.priority)}`}>
                      {getPriorityIcon(selectedTicket.priority)} {selectedTicket.priority}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Created</span>
                    <span className="meta-value">{formatDate(selectedTicket.created_at)}</span>
                  </div>
                  {selectedTicket.updated_at && selectedTicket.updated_at !== selectedTicket.created_at && (
                    <div className="meta-item">
                      <span className="meta-label">Updated</span>
                      <span className="meta-value">{formatDate(selectedTicket.updated_at)}</span>
                    </div>
                  )}
                </div>
                
                <div className="ticket-detail-content">
                  <h3>{selectedTicket.subject}</h3>
                  <p>{selectedTicket.message}</p>
                </div>

                {selectedTicket.status === 'open' && (
                  <div className="ticket-status-note">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <p>Our support team will respond to your ticket within 24 hours.</p>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setSelectedTicket(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CustomerSupport;

