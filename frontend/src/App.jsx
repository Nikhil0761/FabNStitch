/* ============================================
   App.jsx - Main Application Component
   ============================================ */

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Page Components
import Home from './pages/Home';
import Login from './pages/Login';
import TrackOrder from './pages/TrackOrder';

// Customer Pages
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerOrders from './pages/CustomerOrders';
import CustomerProfile from './pages/CustomerProfile';
import CustomerSupport from './pages/CustomerSupport';

// Tailor Pages
import TailorDashboard from './pages/TailorDashboard';
import TailorOrders from './pages/TailorOrders';
import TailorProfile from './pages/TailorProfile';

// Import styles
import './App.css';

// Layout wrapper - shows Navbar and Footer on most pages
function Layout({ children }) {
  return (
    <div className="app">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

// App Content - Handles routing
function AppContent() {
  const location = useLocation();
  
  // Pages that don't need any layout wrapper
  const noLayoutPages = ['/login', '/register'];
  const isNoLayout = noLayoutPages.includes(location.pathname);
  
  // Dashboard pages - have their own layout (no website navbar/footer)
  const dashboardPages = ['/customer', '/tailor'];
  const isDashboard = dashboardPages.some(path => location.pathname.startsWith(path));

  return (
    <>
      {isNoLayout ? (
        // Auth pages - completely standalone
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      ) : isDashboard ? (
        // Dashboard pages - have their own header/sidebar built-in
        <Routes>
          {/* Customer Dashboard Routes */}
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/orders" element={<CustomerOrders />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />
          <Route path="/customer/support" element={<CustomerSupport />} />
          
          {/* Tailor Dashboard Routes */}
          <Route path="/tailor/dashboard" element={<TailorDashboard />} />
          <Route path="/tailor/orders" element={<TailorOrders />} />
          <Route path="/tailor/profile" element={<TailorProfile />} />
        </Routes>
      ) : (
        // Regular pages with website navbar/footer
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/track" element={<TrackOrder />} />
          </Routes>
        </Layout>
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
