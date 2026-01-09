import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// Layout Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";

// Public Pages
import Home from "./pages/Home";
import TrackOrder from "./pages/TrackOrder";
import Fabrics from "./components/Fabrics";

// Customer Pages
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerOrders from "./pages/CustomerOrders";
import CustomerProfile from "./pages/CustomerProfile";
import CustomerSupport from "./pages/CustomerSupport";

// Tailor Pages
import TailorDashboard from './pages/TailorDashboard';
import TailorOrders from './pages/TailorOrders';
import TailorProfile from './pages/TailorProfile';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminCreateOrder from './pages/AdminCreateOrder';
import AdminUsers from './pages/AdminUsers';
import AdminTailors from './pages/AdminTailors';
import AdminSupport from './pages/AdminSupport';
import AdminCreateUser from './pages/AdminCreateUser';
import AdminLeads from './pages/AdminLeads';

import "./App.css";

/* ================= Layout ================= */

function Layout({ children }) {
  return (
    <div className="app">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

/* ================= App Content ================= */

function AppContent() {
  const location = useLocation();

  // Pages WITHOUT Navbar/Footer
  const noLayoutPages = ["/login", "/register", "/admin"];
  const isNoLayout = noLayoutPages.includes(location.pathname);

  // Dashboard paths
  const isCustomer = location.pathname.startsWith("/customer");
  const isTailor = location.pathname.startsWith("/tailor");
  const isAdmin = location.pathname.startsWith("/admin") && location.pathname !== "/admin";

  return (
    <>
      {/* ========== AUTH PAGES (NO LAYOUT) ========== */}
      {isNoLayout && (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminLogin />} />
        </Routes>
      )}

      {/* ========== ADMIN DASHBOARD ========== */}
      {isAdmin && (
        <Routes>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/create-order"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminCreateOrder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/tailors"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminTailors />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/support"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminSupport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/create-user"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminCreateUser />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/leads"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminLeads />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}

      {/* ========== CUSTOMER DASHBOARD ========== */}
      {isCustomer && (
        <Routes>
          <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />

          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute roles={["customer"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/orders"
            element={
              <ProtectedRoute roles={["customer"]}>
                <CustomerOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/profile"
            element={
              <ProtectedRoute roles={["customer"]}>
                <CustomerProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/support"
            element={
              <ProtectedRoute roles={["customer"]}>
                <CustomerSupport />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}

      {/* ========== TAILOR DASHBOARD ========== */}
      {isTailor && (
        <Routes>
          <Route path="/tailor" element={<Navigate to="/tailor/dashboard" replace />} />

          <Route
            path="/tailor/dashboard"
            element={
              <ProtectedRoute roles={["tailor"]}>
                <TailorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tailor/orders"
            element={
              <ProtectedRoute roles={["tailor"]}>
                <TailorOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tailor/profile"
            element={
              <ProtectedRoute roles={["tailor"]}>
                <TailorProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}

      {/* ========== PUBLIC WEBSITE ========== */}
      {!isNoLayout && !isCustomer && !isTailor && !isAdmin && (
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/fabrics" element={<Fabrics />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      )}
    </>
  );
}

/* ================= Root ================= */

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
