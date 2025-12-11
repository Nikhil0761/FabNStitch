/* ============================================
   Reviews Component
   ============================================
   
   📚 LEARNING: Mapping Data to UI
   
   We store review data in an array and use .map() 
   to create identical card structures for each review.
   This is cleaner than writing repetitive HTML.
   
   ============================================ */

import './Reviews.css';

function Reviews() {
  // Review data - easy to add/edit reviews
  const reviews = [
    {
      id: 1,
      rating: 5,
      quote: "Finally, uniforms that don't look like sacks. The fit is incredible and they're so comfortable.",
      author: "Priya M.",
      title: "College Student"
    },
    {
      id: 2,
      rating: 5,
      quote: "Ordered for our 200-person team. Customer service was amazing, delivery was on time, and employees actually look professional.",
      author: "Rajesh K.",
      title: "Company Manager"
    },
    {
      id: 3,
      rating: 5,
      quote: "The process was so easy. The free alteration service saved us money, and the fabric quality is unmatched.",
      author: "Anaya S.",
      title: "Hotel Manager"
    }
  ];

  // Helper function to render stars
  const renderStars = (count) => {
    return Array(count).fill('★').map((star, index) => (
      <span key={index} className="star">★</span>
    ));
  };

  return (
    <section className="reviews section" id="reviews">
      <div className="container">
        {/* Section Header */}
        <div className="reviews-header text-center">
          <h2>Trusted by Teams</h2>
          <p className="reviews-subtitle">
            5000+ students have upgraded their uniforms
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="reviews-grid">
          {reviews.map((review) => (
            <div className="review-card" key={review.id}>
              <div className="review-stars">
                {renderStars(review.rating)}
              </div>
              <blockquote className="review-quote">
                "{review.quote}"
              </blockquote>
              <div className="review-author">
                — {review.author}, {review.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Reviews;

