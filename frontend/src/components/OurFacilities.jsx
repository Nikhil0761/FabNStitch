import "./OurFacilities.css";
import pwbg from "../assets/pwbg.png";
import Cwbg from "../assets/Cwbg.png";
import Mwbg from "../assets/Mwbg.png";
import Cmwbg from "../assets/Cmwbg.png";

const facilitiesData = [
  {
    title: "Placement Excellence Wear",
    image: pwbg,
    tags: ["🧥 Blazer", "👔 Tie", "👕 Shirt", "👖 Trouser"],
    desc: "Confident, sharp, and perfectly tailored for career-defining interviews",
  },
  {
    title: "Institutional Signature Uniform",
    image: Cwbg,
    tags: ["🧥 Blazer", "👔 Tie", "👕 Shirt", "👖 Trouser"],
    desc: "Professional uniforms designed to reflect discipline, identity, and pride",
  },
  {
    title: "Medical Professional Uniform",
    image: Mwbg,
    tags: ["🥼 Lab Coat", "👕 Scrubs & Uniform"],
    desc: "Comfort-driven, functional uniforms crafted for healthcare excellence",
  },
  {
    title: "Corporate Professional Uniform",
    image: Cmwbg,
    tags: ["🦺 Shop Floor Wear", "👕 Shirt", "👖 Trouser"],
    desc: "Refined workwear that elevates comfort, performance, and brand image",
  },
];

export default function OurFacilities() {
  return (
    <section className="facilities-wrapper">
      <div className="facilities-grid">
        {facilitiesData.map((item, index) => (
          <div className="facility-card" key={index}>
            
            {/* Image */}
            <div className="facility-image">
              <img src={item.image} alt={item.title} />
            </div>

            {/* Content */}
            <div className="facility-content">
              <h3 className="facility-title">{item.title}</h3>

              <div className="facility-tags">
                {item.tags.map((tag, i) => (
                  <span className="tag" key={i}>{tag}</span>
                ))}
              </div>

              <p className="facility-desc">{item.desc}</p>

              {/* Buttons */}
              {/* <div className="facility-actions-pill">
                <span className="pill-tag pill-primary">
                  📞 Call
                </span>

                <span className="pill-tag pill-secondary">
                  📄 Documentation
                </span>
              </div> */}

            </div>

          </div>
        ))}
      </div>
    </section>
  );
}
