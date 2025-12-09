/* ============================================
   Home Page Component
   ============================================
   
   📚 LEARNING: Page vs Component
   
   - Pages are components that represent entire screens
   - They typically combine multiple smaller components
   - React Router renders pages based on the URL
   
   Section Order:
   1. Hero - Main banner
   2. Features - How It Works
   3. Clients - Our Clients logos
   4. Reviews - Trusted by Teams
   5. GetStarted - Contact form
   6. BookAppointment - CTA before footer
   
   ============================================ */

import Hero from '../components/Hero';
import Features from '../components/Features';
import Clients from '../components/Clients';
import Reviews from '../components/Reviews';
import GetStarted from '../components/GetStarted';
import BookAppointment from '../components/BookAppointment';

function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Clients />
      <Reviews />
      <GetStarted />
      <BookAppointment />
    </>
  );
}

export default Home;
