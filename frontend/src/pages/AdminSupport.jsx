import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { API_URL } from "../config";
import "./AdminDashboard.css";

function AdminSupport() {
  const navigate = useNavigate();
  const token = localStorage.getItem("fabnstitch_token");

  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/admin");
      return;
    }
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/tickets`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch tickets");

      const data = await response.json();
      setTickets(data.tickets);
    } catch (err) {
      console.error("Tickets error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/admin/tickets/${ticketId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update ticket");

      await fetchTickets();
    } catch (err) {
      alert(err.message);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "#10b981",
      medium: "#f59e0b",
      high: "#ef4444",
      urgent: "#dc2626",
    };
    return colors[priority] || "#6b7280";
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "#f59e0b",
      in_progress: "#3b82f6",
      resolved: "#10b981",
      closed: "#6b7280",
    };
    return colors[status] || "#6b7280";
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (filterStatus !== "all" && ticket.status !== filterStatus) return false;
    if (filterPriority !== "all" && ticket.priority !== filterPriority)
      return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        ticket.subject?.toLowerCase().includes(search) ||
        ticket.user_name?.toLowerCase().includes(search) ||
        ticket.message?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">
          <div className="loader"></div>
          <p>Loading support tickets...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-support">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1>Support Tickets</h1>
            <p>Manage and respond to customer support requests</p>
          </div>
          <div className="header-stats">
            <div className="stat-badge open">
              <span className="stat-number">
                {tickets.filter((t) => t.status === "open").length}
              </span>
              <span className="stat-label">Open</span>
            </div>
            <div className="stat-badge">
              <span className="stat-number">{tickets.length}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="support-filters">
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search tickets by subject, user, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Tickets List */}
        <div className="tickets-list">
          {filteredTickets.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <h3>No tickets found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-header">
                  <div className="ticket-title">
                    <h3>{ticket.subject}</h3>
                    <div className="ticket-badges">
                      <span
                        className="priority-badge"
                        style={{
                          backgroundColor: getPriorityColor(ticket.priority),
                        }}
                      >
                        {ticket.priority}
                      </span>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(ticket.status),
                        }}
                      >
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <div className="ticket-meta">
                    <div className="ticket-user">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>{ticket.user_name}</span>
                    </div>
                    <span className="ticket-date">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="ticket-body">
                  <p>{ticket.message}</p>
                </div>

                <div className="ticket-footer">
                  <span className="ticket-email">{ticket.user_email}</span>
                  <div className="ticket-actions">
                    {ticket.status !== "resolved" && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() =>
                          handleUpdateStatus(ticket.id, "resolved")
                        }
                      >
                        Mark Resolved
                      </button>
                    )}
                    {ticket.status === "open" && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() =>
                          handleUpdateStatus(ticket.id, "in_progress")
                        }
                      >
                        Start Progress
                      </button>
                    )}
                    {ticket.status !== "closed" && (
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleUpdateStatus(ticket.id, "closed")}
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminSupport;
