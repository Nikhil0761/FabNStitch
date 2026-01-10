import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Phone,
  Mail,
  Plus,
  X,
  AlertCircle,
  FileText,
  CheckCircle,
  Clock,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import './CustomerSupport.css';
import { API_URL } from '../config';

function CustomerSupport() {
  const navigate = useNavigate();
  const token = localStorage.getItem('fabnstitch_token');

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
          localStorage.removeItem('fabnstitch_token');
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

  const getStatusConfig = (status) => {
    switch (status) {
      case 'open': return { label: 'Open', icon: <AlertCircle size={14} />, class: 'status-open' };
      case 'in_progress': return { label: 'In Progress', icon: <Clock size={14} />, class: 'status-progress' };
      case 'resolved': return { label: 'Resolved', icon: <CheckCircle size={14} />, class: 'status-resolved' };
      case 'closed': return { label: 'Closed', icon: <X size={14} />, class: 'status-closed' };
      default: return { label: status, icon: <HelpCircle size={14} />, class: 'status-open' };
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'low': return { label: 'Low', class: 'priority-low' };
      case 'medium': return { label: 'Medium', class: 'priority-medium' };
      case 'high': return { label: 'High', class: 'priority-high' };
      case 'urgent': return { label: 'Urgent', class: 'priority-urgent' };
      default: return { label: priority, class: 'priority-medium' };
    }
  };

  return (
    <DashboardLayout role="customer">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Customer Support</h1>
            <p>We're here to help with your orders and inquiries</p>
          </div>
          <button className="primary-btn" onClick={() => setShowNewTicketModal(true)}>
            <Plus size={18} /> New Ticket
          </button>
        </div>

        {message.text && (
          <div className={`message-banner ${message.type}`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        <div className="support-grid">
          {/* Quick Help Section */}
          <div className="quick-help-section">
            <h2 className="section-title">Contact Us Directly</h2>
            <div className="help-cards-grid">
              <a href="tel:+919920077539" className="help-card">
                <div className="icon-wrapper phone">
                  <Phone size={24} />
                </div>
                <div className="help-content">
                  <h3>Call Support</h3>
                  <p>+91 99200 77539</p>
                  <span className="sub-text">Mon-Sat, 10AM-7PM</span>
                </div>
              </a>

              <a href="mailto:support@fabnstitch.com" className="help-card">
                <div className="icon-wrapper mail">
                  <Mail size={24} />
                </div>
                <div className="help-content">
                  <h3>Email Us</h3>
                  <p>support@fabnstitch.com</p>
                  <span className="sub-text">Response within 24hrs</span>
                </div>
              </a>

              <a href="https://wa.me/919920077539" target="_blank" rel="noopener noreferrer" className="help-card">
                <div className="icon-wrapper whatsapp">
                  <MessageSquare size={24} />
                </div>
                <div className="help-content">
                  <h3>WhatsApp</h3>
                  <p>Chat with us</p>
                  <span className="sub-text">Quick responses</span>
                </div>
                <ExternalLink size={16} className="external-icon" />
              </a>
            </div>
          </div>

          {/* Tickets Section */}
          <div className="tickets-section">
            <h2 className="section-title">Your Support Tickets</h2>

            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading your tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="empty-state">
                <FileText size={48} className="empty-icon" />
                <h3>No tickets yet</h3>
                <p>Have a question or issue? Create a new support ticket.</p>
                <button className="secondary-btn" onClick={() => setShowNewTicketModal(true)}>
                  Create Ticket
                </button>
              </div>
            ) : (
              <div className="tickets-list">
                {tickets.map(ticket => {
                  const status = getStatusConfig(ticket.status);
                  const priority = getPriorityConfig(ticket.priority);

                  return (
                    <div
                      key={ticket.id}
                      className="ticket-card"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="ticket-main">
                        <div className="ticket-header-row">
                          <span className="ticket-id">#{ticket.id}</span>
                          <span className={`status-badge ${status.class}`}>
                            {status.icon} {status.label}
                          </span>
                        </div>
                        <h3 className="ticket-subject">{ticket.subject}</h3>
                        <p className="ticket-preview">
                          {ticket.message.length > 80
                            ? ticket.message.substring(0, 80) + '...'
                            : ticket.message}
                        </p>
                      </div>

                      <div className="ticket-meta">
                        <span className={`priority-indicator ${priority.class}`}>
                          {priority.label} Priority
                        </span>
                        <span className="ticket-date">
                          {formatDate(ticket.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* New Ticket Modal */}
        {showNewTicketModal && (
          <div className="modal-overlay">
            <div className="modal-content standard-modal">
              <div className="modal-header">
                <h2>Create Support Ticket</h2>
                <button className="close-btn" onClick={() => setShowNewTicketModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="modal-form">
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
                    className="modern-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <div className="select-wrapper">
                    <select
                      id="priority"
                      name="priority"
                      value={newTicket.priority}
                      onChange={handleNewTicketChange}
                      className="modern-select"
                    >
                      <option value="low">Low - General inquiry</option>
                      <option value="medium">Medium - Need help soon</option>
                      <option value="high">High - Urgent issue</option>
                      <option value="urgent">Urgent - Critical problem</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message Details</label>
                  <textarea
                    id="message"
                    name="message"
                    value={newTicket.message}
                    onChange={handleNewTicketChange}
                    placeholder="Describe your issue in detail..."
                    rows="5"
                    required
                    className="modern-textarea"
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowNewTicketModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <div className="modal-overlay">
            <div className="modal-content detail-modal">
              <div className="modal-header">
                <div className="ticket-title-group">
                  <span className="ticket-id-badge">#{selectedTicket.id}</span>
                  <span className={`status-badge ${getStatusConfig(selectedTicket.status).class}`}>
                    {getStatusConfig(selectedTicket.status).label}
                  </span>
                </div>
                <button className="close-btn" onClick={() => setSelectedTicket(null)}>
                  <X size={24} />
                </button>
              </div>

              <div className="modal-body scrollable">
                <div className="ticket-info-grid">
                  <div className="info-item">
                    <span className="label">Subject</span>
                    <span className="value strong">{selectedTicket.subject}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Priority</span>
                    <span className={`priority-badge ${getPriorityConfig(selectedTicket.priority).class}`}>
                      {getPriorityConfig(selectedTicket.priority).label}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Created On</span>
                    <span className="value">{formatDate(selectedTicket.created_at)}</span>
                  </div>
                </div>

                <div className="ticket-message-box">
                  <label>Description</label>
                  <div className="message-content">
                    {selectedTicket.message}
                  </div>
                </div>

                {selectedTicket.status === 'open' && (
                  <div className="info-banner">
                    <Clock size={18} />
                    <p>Our support team usually responds within 24 hours.</p>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="secondary-btn" onClick={() => setSelectedTicket(null)}>
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

