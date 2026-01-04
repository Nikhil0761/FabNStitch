import "./Clients.css";

import clientLogo1 from "../assets/Client1.png";
import clientLogo2 from "../assets/Client2.png";
import clientLogo3 from "../assets/Client3.jpg";
import clientLogo4 from "../assets/Client4.jpg";
import clientLogo5 from "../assets/Client5.jpg";
import clientLogo6 from "../assets/Client6.png";

function Clients() {
  const logos = [
    clientLogo1,
    clientLogo2,
    clientLogo3,
    clientLogo4,
    clientLogo5,
    clientLogo6,
  ];

  return (
    <section className="clients-section" id="clients">
      <h2 className="clients-title">Our Clients</h2>

      {/* Auto-scroll wrapper */}
      <div className="clients-wrapper">
        <div className="clients-track">
          {/* Duplicate logos for infinite loop */}
          {logos.concat(logos).map((logo, index) => (
            <div className="client-item" key={index}>
              <img src={logo} alt={`Client ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Clients;
