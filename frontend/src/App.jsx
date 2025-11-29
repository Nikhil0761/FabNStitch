/* ============================================
   App.jsx - Main Application Component
   ============================================
   
   📚 LEARNING: Component Composition
   
   This is the ROOT component of your React app.
   It imports and combines all other components.
   
   Think of it like assembling LEGO blocks:
   - Each component is a separate block
   - App.jsx puts them together to form the complete page
   
   ============================================ */

// Import our components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';

// Import styles
import './App.css';

function App() {
  return (
    <div className="app">
      {/* Navigation Bar - Fixed at top */}
      <Navbar />
      
      {/* Main Content */}
      <main>
        {/* Hero Section - First thing visitors see */}
        <Hero />
        
        {/* How It Works Section */}
        <Features />
        
        {/* More sections will be added here:
            - Fabrics Showcase
            - Customer Reviews
            - Contact Form
        */}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
