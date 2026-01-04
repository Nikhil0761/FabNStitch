import "./Hero.css";
import blazerImage from "../assets/blazer_collection1.png";
export default function Hero() {
  return (
            <section className="hero">
              <div className="hero-container">

        <div className="hero-left">
         
                    <h1>
           Professional Uniforms Designed for Future <span className="highlight">  Leaders  </span>
           
            
          </h1>


          <p>
            Expertly tailored uniforms for colleges, corporates, and institutions—crafted with premium fabrics, precision stitching, and detailed quality reports.
          </p>

          {/* CTA BUTTONS */}
           <div className="hero-actions">
  <div className="hero-email-box">
    <input
      type="email"
      placeholder="Work email address"
    />
    <button className="hero-primary-btn">
      Submit
    </button>
  </div>

<button
  className="hero-secondary-btn"
  onClick={() => {
    const target = document.getElementById("our-story-video");
    const navbarHeight = 90; // adjust if your navbar height is different

    const y =
      target.getBoundingClientRect().top +
      window.pageYOffset -
      navbarHeight;

    window.scrollTo({ top: y, behavior: "smooth" });

    setTimeout(() => {
      target.querySelector("video")?.play();
    }, 600);
  }}
>
  Watch Video
</button>


</div>

                      {/* RATING CARDS */}
            <div className="hero-review-cards">
  <div className="review-card green-stars">
    <div className="review-stars">★★★★★</div>
    <div className="review-score">
      <strong>4.9/5</strong>
      <span>(100+ Institutions)</span>
    </div>
    <div className="review-label">Trusted Colleges</div>
  </div>

  <div className="review-card yellow-stars">
    <div className="review-stars">★★★★★</div>
    <div className="review-score">
      <strong>4.8/5</strong>
      <span>(Corporate Clients)</span>
    </div>
    <div className="review-label">Industry Partners</div>
  </div>
</div>


        </div>


        {/* RIGHT SIDE – VISUAL */}
        <div className="hero-visual">

          <div className="hero-image-wrapper">
            <img
              src={blazerImage}
              alt="Premium Blazer Collection"
              className="hero-image"
            />
          </div>

          {/* Floating Cards */}
          <div className="floating-card card-1">
            <span className="card-icon">📏</span>
            <span>Perfect Fit</span>
          </div>

          <div className="floating-card card-2">
            <span className="card-icon">🧵</span>
            <span>Quality Stitched</span>
          </div>

          <div className="floating-card card-3">
            <span className="card-icon">🧶</span>
            <span>Premium Fabric</span>
          </div>

          {/* <div className="floating-card card-4">
            <span className="card-icon">🏫</span>
            <span>College Ready</span>
          </div> */}

          <div className="floating-card card-5">
            <span className="card-icon">📦</span>
            <span>Bulk Orders</span>
          </div>
          

        </div>

      </div>
    </section>
  );
}
