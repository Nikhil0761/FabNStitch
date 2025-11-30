/* ============================================
   App.jsx - Main Application Component
   ============================================
   
   📚 LEARNING: React Router
   
   React Router enables navigation between pages without page reload.
   
   Key components:
   - BrowserRouter: Wraps your app to enable routing
   - Routes: Container for all route definitions
   - Route: Defines which component shows for each URL path
   
   ============================================ */

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Page Components
import Home from './pages/Home';
import Login from './pages/Login';

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
  
  // Pages that don't need the standard layout (no navbar/footer)
  const noLayoutPages = ['/login', '/register'];
  const isNoLayout = noLayoutPages.includes(location.pathname);

  return (
    <>
      {isNoLayout ? (
        // Auth pages without navbar/footer
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} /> */}
        </Routes>
      ) : (
        // Regular pages with navbar/footer
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Add more routes here as we build them:
                <Route path="/track" element={<TrackOrder />} />
                <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            */}
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
