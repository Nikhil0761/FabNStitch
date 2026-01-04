import "./OurStory.css";
import womenTailor from "../assets/womenTailor.png";
import blazermanufacturing from "../assets/blazermanufacturing.png";
import shirtmanufacturing from "../assets/shirtmanufacturing.png";
import introVideo from "../assets/video.mp4";

export default function OurStory() {
  return (
    <section className="ourstory">
      <div className="ourstory-container">

        {/* LEFT */}
        <div className="ourstory-left">
          

          <h1 className="ourstory-title">
            Crafted by experts and delivered at scale,
            backed by <span>IIT Alumni</span> and engineered for excellence.
          </h1>


          <div className="ourstory-image">
            <img src={womenTailor} alt="Women Tailor" />
          </div>
        </div>

        {/* RIGHT */}
        <div className="ourstory-right">

          {/* TOP CARDS */}
          <div className="ourstory-cards">
            <div className="story-card">
              <img src={blazermanufacturing} alt="Blazer Manufacturing" />
            </div>

            <div className="story-card">
              <img src={shirtmanufacturing} alt="Shirt Manufacturing" />
            </div>
          </div>

          {/* INLINE VIDEO */}
            <div className="ourstory-video" id="our-story-video">
              <video
                src={introVideo}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                
  
              />
            </div>


          {/* DESCRIPTION */}
          {/* QUOTE REQUEST SECTION */}
            {/* SMALL QUOTE REQUEST */}
<div className="ourstory-quote-small">
  <div className="quote-small-text">
    <h4>Request a Quote</h4>
    <p>
      Share your requirements and we’ll get back with a custom quotation.
    </p>
  </div>

  <div className="quote-small-form">
    <textarea
      placeholder="Uniform type, quantity, fabric, timeline..."
    />
  </div>
</div>




        </div>
      </div>
    </section>
  );
}
