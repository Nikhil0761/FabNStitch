/* ============================================
   Book Appointment CTA Component
   ============================================ */

import './BookAppointment.css';

function BookAppointment() {
  return (
    <section className="book-appointment section">
      <div className="container">
        <div className="cta-banner">
          <div className="cta-content">
            <h3>Ready to Get Started?</h3>
            <p>Book your appointment today and experience the art of bespoke tailoring.</p>
          </div>
          <a href="#contact" className="btn btn-accent">
            Book Appointment
          </a>
        </div>
      </div>
    </section>
  );
}

export default BookAppointment;

