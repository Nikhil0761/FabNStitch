import "./Features.css";

// Import images
import step1Img from "../assets/MW.jpeg";
import step2Img from "../assets/WT.png";
import step3Img from "../assets/PF.jpeg";
import step4Img from "../assets/S.jpeg";
import step5Img from "../assets/QC.jpeg";
import step6Img from "../assets/T.jpeg";

function Features() {
  const steps = [
    {
      id: 1,
      icon: "📞",
      title: "Book Appointment",
      description:
        "Arrange an organization visit tailored for your students or professionals.",
      bgImage: step1Img,
    },
    {
      id: 2,
      icon: "📏",
      title: "Get Measured",
      description:
        "Our expert tailor takes precise measurements for the perfect fit.",
      bgImage: step2Img,
    },
    {
      id: 3,
      icon: "🎨",
      title: "Choose Fabric",
      description:
        "Select from our premium collection of luxury fabrics.",
      bgImage: step3Img,
    },
    {
      id: 4,
      icon: "✂️",
      title: "Crafting",
      description:
        "Your uniform is handcrafted with attention to every detail.",
      bgImage: step4Img,
    },
    {
      id: 5,
      icon: "✨",
      title: "Quality Check",
      description:
        "Rigorous inspection ensures consistency and perfection.",
      bgImage: step5Img,
    },
    {
      id: 6,
      icon: "🚚",
      title: "Delivery",
      description:
        "Delivered safely and on time to your institution.",
      bgImage: step6Img,
    },
  ];

  return (
    <section className="features" id="how-it-works">
      <div className="features-container">

        {/* HEADER */}
        <div className="features-header">
          <span className="section-label">Our Process</span>
          <h2>How It Works</h2>
          <p>
            From consultation to delivery, we ensure a seamless uniform experience.
          </p>
        </div>

        {/* GRID */}
        <div className="features-grid">
          {steps.map((step) => (
            <div
              key={step.id}
              className="feature-card"
              style={{ backgroundImage: `url(${step.bgImage})` }}
            >
              <div className="feature-overlay"></div>

              <span className="feature-number">{step.id}</span>
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
