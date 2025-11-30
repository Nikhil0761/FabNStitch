/* ============================================
   Home Page Component
   ============================================
   
   📚 LEARNING: Page vs Component
   
   - Pages are components that represent entire screens
   - They typically combine multiple smaller components
   - React Router renders pages based on the URL
   
   ============================================ */

import Hero from '../components/Hero';
import Features from '../components/Features';

function Home() {
  return (
    <>
      <Hero />
      <Features />
      {/* Add more sections here as we build them:
          - Fabrics Showcase
          - Customer Reviews
          - Contact Section
      */}
    </>
  );
}

export default Home;

