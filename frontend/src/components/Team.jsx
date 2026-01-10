import "./Team.css";

const teamMembers = [
  {
    name: "Milla Davis",
    role: "Founder Chairman",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    desc:
      "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin.",
  },
  {
    name: "Tilok Chandra Paul",
    role: "Senior Graphic Designer",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    desc:
      "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin.",
  },
  {
    name: "Charles Cooper",
    role: "Founder CEO",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    desc:
      "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin.",
  },
  {
    name: "Charles Cooper",
    role: "Founder CEO",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    desc:
      "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin.",
  },
];

function Team() {
  return (
    <section className="team-section">
      <div className="team-container">
        {/* Left Content */}
        <div className="team-intro">
          <h2>Meet our<br />Management</h2>
          <p>The core member of the company</p>
          <button className="team-btn">INTRODUCE FULL TEAM</button>
        </div>

        {/* Cards */}
        <div className="team-cards">
          {teamMembers.map((member, index) => (
            <div className="team-card" key={index}>
              <div className="image-wrapper">
                <img src={member.image} alt={member.name} />
              </div>

              <h3>{member.name}</h3>
              <span>{member.role}</span>
              <p>{member.desc}</p>

              <div className="social-icons">
                <i className="fab fa-facebook-f"></i>
                <i className="fab fa-twitter"></i>
                <i className="fab fa-dribbble"></i>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Team;
