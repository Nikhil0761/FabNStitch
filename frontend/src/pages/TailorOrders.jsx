/* ============================================
   Tailor Orders Page – Kanban + List (FINAL)
============================================ */

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TailorLayout from "../components/TailorLayout";
import "./TailorOrders.css";
import { API_URL } from "../config";

function TailorOrders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ CORRECT TOKEN
  const token = localStorage.getItem("fabnstitch_token");

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("kanban");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateNote, setUpdateNote] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  // Drag & Drop
  const [draggedOrder, setDraggedOrder] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  /* ============================================
     HELPERS
  ============================================ */
  const logout = () => {
    localStorage.removeItem("fabnstitch_token");
    localStorage.removeItem("fabnstitch_user");
    navigate("/login");
  };

  /* ============================================
     KANBAN CONFIG
  ============================================ */
  const kanbanColumns = [
    { key: "confirmed", label: "Confirmed", icon: "✓" },
    { key: "stitching", label: "Stitching", icon: "🧵" },
    { key: "finishing", label: "Finishing", icon: "✨" },
  ];

  const validTransitions = {
    confirmed: ["stitching"],
    stitching: ["confirmed", "finishing"],
    finishing: ["stitching"],
  };

  /* ============================================
     DATA LOAD
  ============================================ */
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await fetch(`${API_URL}/tailor/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      const data = await res.json();

      // ✅ ROLE PROTECTION - Handled by middleware & ProtectedRoute
      // if (data.user?.role !== "tailor") {
      //   logout();
      //   return;
      // }

      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      logout();
      return;
    }

    fetchOrders();

    const orderId = searchParams.get("id");
    if (orderId) fetchOrderDetails(orderId);
  }, [token, fetchOrders]);

  /* ============================================
     ORDER DETAILS
  ============================================ */
  const fetchOrderDetails = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/tailor/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data.order);
        setOrderHistory(data.history || []);
        setShowOrderModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ============================================
     STATUS UPDATE
  ============================================ */
  const handleStatusUpdate = async (orderId, status, note = "") => {
    setIsUpdating(true);

    try {
      const res = await fetch(
        `${API_URL}/tailor/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            notes: note || `Moved to ${formatStatus(status)}`,
          }),
        }
      );

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) throw new Error("Update failed");

      setMessage({ type: "success", text: "Order updated successfully" });
      setUpdateNote("");
      fetchOrders();

      if (selectedOrder?.order_id === orderId) {
        fetchOrderDetails(orderId);
      }

      setTimeout(() => setMessage({ type: "", text: "" }), 2000);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsUpdating(false);
    }
  };

  /* ============================================
     DRAG & DROP
  ============================================ */
  const handleDragStart = (e, order) => {
    e.stopPropagation();
    setDraggedOrder(order);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (
      draggedOrder &&
      validTransitions[draggedOrder.status]?.includes(targetStatus)
    ) {
      await handleStatusUpdate(
        draggedOrder.order_id,
        targetStatus,
        `Dragged to ${formatStatus(targetStatus)}`
      );
    }

    setDraggedOrder(null);
  };

  /* ============================================
     UTILITIES
  ============================================ */
  const formatStatus = (s) =>
    s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN") : "N/A";

  const getUrgency = (d) => {
    if (!d) return "normal";
    const diff =
      (new Date(d).setHours(0, 0, 0, 0) -
        new Date().setHours(0, 0, 0, 0)) /
      86400000;
    if (diff < 0) return "overdue";
    if (diff === 0) return "today";
    if (diff <= 2) return "soon";
    return "normal";
  };

  const ordersByStatus = kanbanColumns.reduce((acc, col) => {
    acc[col.key] = orders.filter((o) => o.status === col.key);
    return acc;
  }, {});

  /* ============================================
     UI
  ============================================ */
  if (isLoading) {
    return (
      <TailorLayout>
        <div className="orders-loading">
          <div className="loader" />
          <p>Loading orders...</p>
        </div>
      </TailorLayout>
    );
  }

  return (
    <TailorLayout>
      <div className="tailor-orders-page">
        {/* HEADER */}
        <div className="page-header">
          <h1>My Orders</h1>
          <div className="view-toggle">
            <button onClick={() => setViewMode("kanban")}>▦ Board</button>
            <button onClick={() => setViewMode("list")}>☰ List</button>
          </div>
        </div>

        {message.text && (
          <div className={`message-banner ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* KANBAN */}
        {viewMode === "kanban" && (
          <div className="kanban-board">
            {kanbanColumns.map((col) => (
              <div
                key={col.key}
                className={`kanban-column ${dragOverColumn === col.key ? "drag-over" : ""
                  }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, col.key)}
              >
                <div className="column-header">
                  {col.icon} {col.label}
                </div>

                {ordersByStatus[col.key]?.map((order) => (
                  <KanbanCard
                    key={order.order_id}
                    order={order}
                    urgency={getUrgency(order.estimated_delivery)}
                    onView={() => fetchOrderDetails(order.order_id)}
                    onDragStart={handleDragStart}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </TailorLayout>
  );
}

/* ============================================
   KANBAN CARD
============================================ */
function KanbanCard({ order, urgency, onView, onDragStart }) {
  return (
    <div
      className={`kanban-card ${urgency}`}
      draggable
      onDragStart={(e) => onDragStart(e, order)}
      onClick={onView}
    >
      <strong>{order.order_id}</strong>
      <p>{order.style}</p>
      <small>
        {order.fabric_name} • {order.fabric_color}
      </small>
    </div>
  );
}

export default TailorOrders;
