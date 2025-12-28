import "./AdventureSection.css";

function AdventureSection() {
  return (
    <section className="adventure">
      <div className="adventure-container">
        
        {/* LEFT CONTENT */}
        <div className="adventure-text">
          <h1>
            FIND YOUR <br />
            ADVENTURE
          </h1>

          <span className="subtitle">LET’S GO!</span>

          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit,
            sed diam nonummy nibh euismod tincidunt ut laoreet
            dolore sed diam nonummy nibh euismod tincidunt ut
            laoreet dolore.
          </p>

          <button className="btn">LEARN MORE</button>
        </div>

        {/* RIGHT IMAGE COLLAGE */}
        <div className="adventure-collage">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
            alt="Beach Adventure"
            className="img img-large"
          />

          <img
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1"
            alt="Mountain"
            className="img img-top"
          />

          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
            alt="Hiking"
            className="img img-middle"
          />

          <img
            src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429"
            alt="Cliff"
            className="img img-bottom"
          />
        </div>

      </div>
    </section>
  );
}

export default AdventureSection;
