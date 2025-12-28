/* ============================================
   App.jsx - Main Application Component
============================================ */

import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// Layout Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Register from "./pages/Register";

// Page Components
import Home from "./pages/Home";
import Login from "./pages/Login";
import TrackOrder from "./pages/TrackOrder";

// Customer Pages
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerOrders from "./pages/CustomerOrders";
import CustomerProfile from "./pages/CustomerProfile";
import CustomerSupport from "./pages/CustomerSupport";

// Tailor Pages
import TailorDashboard from "./pages/TailorDashboard";
import TailorOrders from "./pages/TailorOrders";
import TailorProfile from "./pages/TailorProfile";

// Public Components
import Fabrics from "./components/Fabrics";

// Global styles
import "./App.css";

/* ============================================
   Layout Wrapper
============================================ */
function Layout({ children }) {
  return (
    <div className="app">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

/* ============================================
   App Content (Routing Logic)
============================================ */
function AppContent() {
  const location = useLocation();

  // Pages without Navbar & Footer
  const noLayoutPages = ["/login", "/register"];

  const isNoLayout = noLayoutPages.includes(location.pathname);

  // Dashboard pages (own layout)
  const dashboardPages = ["/customer", "/tailor"];
  const isDashboard = dashboardPages.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      {/* =====================
         AUTH PAGES
         ===================== */}
      {isNoLayout && (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>

      )}

      {/* =====================
         DASHBOARD PAGES
         ===================== */}
      {isDashboard && (
        <Routes>
          {/* Redirect base paths */}
          <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />
          <Route path="/tailor" element={<Navigate to="/tailor/dashboard" replace />} />

          {/* Customer */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/orders"
            element={
              <ProtectedRoute>
                <CustomerOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/profile"
            element={
              <ProtectedRoute>
                <CustomerProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/support"
            element={
              <ProtectedRoute>
                <CustomerSupport />
              </ProtectedRoute>
            }
          />

          {/* Tailor */}
          <Route
            path="/tailor/dashboard"
            element={
              <ProtectedRoute>
                <TailorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tailor/orders"
            element={
              <ProtectedRoute>
                <TailorOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tailor/profile"
            element={
              <ProtectedRoute>
                <TailorProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}

      {/* =====================
         PUBLIC WEBSITE PAGES
         ===================== */}
      {!isNoLayout && !isDashboard && (
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/fabrics" element={<Fabrics />} />
            <Route path="/track" element={<TrackOrder />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      )}
    </>
  );
}

/* ============================================
   Root App
============================================ */
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
