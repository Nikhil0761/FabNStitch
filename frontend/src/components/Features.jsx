/* ============================================
   Features Component (How It Works)
   ============================================
   
   📚 LEARNING: Arrays & Map in React
   
   Instead of writing repetitive JSX, we can:
   1. Create an array of data
   2. Use .map() to loop through and create elements
   
   This makes code cleaner and easier to maintain!
   
   ============================================ */

import './Features.css';

function Features() {
  // Array of steps - easier to maintain than hardcoding each one
  const steps = [
    {
      id: 1,
      icon: '📞',
      title: 'Book Appointment',
      description: 'Arrange an organization visit - Tailored Solution for your Students/Professors.'
    },
    {
      id: 2,
      icon: '📏',
      title: 'Get Measured',
      description: 'Our expert tailor takes precise measurements for the perfect fit.'
    },
    {
      id: 3,
      icon: '🎨',
      title: 'Choose Fabric',
      description: 'Select from our premium collection of Italian, English, and luxury fabrics.'
    },
    {
      id: 4,
      icon: '✂️',
      title: 'Crafting',
      description: 'Your blazer is handcrafted with attention to every detail.'
    },
    {
      id: 5,
      icon: '✨',
      title: 'Quality Check',
      description: 'Rigorous quality inspection ensures perfection.'
    },
    {
      id: 6,
      icon: '🚚',
      title: 'Delivery',
      description: 'Your bespoke blazer delivered right to your doorstep.'
    }
  ];

  return (
    <section className="features section" id="how-it-works">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center">
          <span className="section-label">Our Process</span>
          <h2>How It Works</h2>
          <br />
          <p className="section-description">
            From your first consultation to the final delivery, 
            we ensure a seamless bespoke tailoring experience.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="features-grid">
          {/* 
            .map() loops through each step and creates JSX
            key={step.id} is required by React for list items
          */}
          {steps.map((step) => (
            <div className="feature-card" key={step.id}>
              <div className="feature-number">{step.id}</div>
              <div className="feature-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;

