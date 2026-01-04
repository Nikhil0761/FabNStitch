import "./Fabrics.css";

function Fabrics() {
  const fabrics = [
    {
      title: "Italian Wool",
      description: "Premium breathable fabric for all-day comfort.",
      price: "Premium",
    },
    {
      title: "English Tweed",
      description: "Classic durability with a refined finish.",
      price: "Classic",
    },
    {
      title: "Luxury Blend",
      description: "Soft texture with elegant drape.",
      price: "Luxury",
    },
    {
      title: "French Linen",
      description: "Lightweight fabric for summer wear.",
      price: "Premium",
    },
    {
      title: "Velvet Touch",
      description: "Rich feel with royal appearance.",
      price: "Luxury",
    },
    {
      title: "Cotton Satin",
      description: "Smooth finish with lasting comfort.",
      price: "Standard",
    },
  ];

  return (
    <section className="fabrics-section" id="fabrics">
      <div className="container">
        <h2 className="section-title">Our Premium Fabrics</h2>

        <div className="fabrics-grid">
          {fabrics.map((fabric, index) => (
            <div className="card" key={index}>
              <div className="card__shine"></div>
              <div className="card__glow"></div>

              <div className="card__content">
                <div className="card__image"></div>

                <div className="card__text">
                  <p className="card__title">{fabric.title}</p>
                  <p className="card__description">
                    {fabric.description}
                  </p>
                </div>

                <div className="card__footer">
                  <div className="card__price">{fabric.price}</div>
                  <div className="card__button">+</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Fabrics;
