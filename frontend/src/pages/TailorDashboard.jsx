import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TailorLayout from "../components/TailorLayout";
import { API_URL } from "../config";

function TailorDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("fabnstitch_token");

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return navigate("/login");

    fetch(`${API_URL}/tailor/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) throw new Error();
        const data = await res.json();

        // Ensure we have valid data
        if (!data.user || data.user.role !== "tailor") throw new Error();

        setUser(data.user);
        setStats(data.stats || {});
        setOrders(data.pendingOrders || []);
      })
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  if (loading) return <TailorLayout>Loading...</TailorLayout>;

  return (
    <TailorLayout>
      <h1>Welcome, {user.name}</h1>

      <div className="stats-grid">
        <div>Confirmed: {stats.confirmed}</div>
        <div>Stitching: {stats.stitching}</div>
        <div>Finishing: {stats.finishing}</div>
        <div>QC: {stats.quality_check}</div>
        <div>Ready: {stats.ready}</div>
      </div>

      <div className="section-header">
        <h2>Active Orders</h2>
        <button className="btn-link" onClick={() => navigate("/tailor/orders")}>View All</button>
      </div>

      <div className="dashboard-order-list">
        {orders.length === 0 ? (
          <p className="no-orders">No active orders</p>
        ) : (
          orders.map((o) => (
            <div
              key={o.order_id}
              className="dashboard-order-card"
              onClick={() => navigate(`/tailor/orders?id=${o.order_id}`)}
            >
              <div className="order-info">
                <strong>{o.order_id}</strong>
                <span>{o.style}</span>
              </div>
              <span className={`status-badge ${o.status}`}>{o.status}</span>
            </div>
          ))
        )}
      </div>
    </TailorLayout>
  );
}

export default TailorDashboard;
