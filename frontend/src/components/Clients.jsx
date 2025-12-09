/* ============================================
   Clients Component - Our Clients Section
   ============================================ */

import './Clients.css';

function Clients() {
  // Client names - using text placeholders (replace with actual logos later)
  const clients = [
    'Colgate-Palmolive',
    'Jubilant',
    'Themis Medicare',
    'Metro',
    'Britannia',
    'NYK Group',
    'Chanel',
    'Big Bazaar',
    'L&T',
    'Sugar',
    'Akasa Air',
    'Castrol',
    'DHL',
    'Colors TV',
    'Dettol',
  ];

  return (
    <section className="clients section" id="clients">
      <div className="container">
        <div className="clients-header text-center">
          <h2>Our Clients</h2>
        </div>

        <div className="clients-grid">
          {clients.map((client, index) => (
            <div className="client-card" key={index}>
              <span className="client-name">{client}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Clients;

