import "./FashionCollage.css";

import QC from "../assets/QC.jpeg";
import MW from "../assets/MW.jpeg";
import PF from "../assets/PF.jpeg";
import PM from "../assets/PM.jpeg";
import S from "../assets/S.jpeg";
import T from "../assets/T.jpeg";
import WT from "../assets/WT.png";

export default function FashionCollage() {
  return (
    <section className="fashion-section">
      {/* Header */}
      <div className="fashion-header">
        <h1>
          Elevate Your Style With <br /> <span>Bold Fashion</span>
        </h1>
        <button className="fashion-btn">Explore Collections →</button>
      </div>

      {/* Image Collage */}
      <div className="fashion-collage">

        <div className="img-wrap center">
          <img src={QC} className="img" alt="Quality Check" />
          <div className="img-overlay">
            <span>Quality Check</span>
          </div>
        </div>

        <div className="img-wrap medium">
          <img src={MW} className="img" alt="Machine Work" />
          <div className="img-overlay">
            <span>Machine Work</span>
          </div>
        </div>

        <div className="img-wrap center">
          <img src={PF} className="img" alt="Premium Fabric" />
          <div className="img-overlay">
            <span>Premium Fabric</span>
          </div>
        </div>

        <div className="img-wrap medium">
          <img src={WT} className="img" alt="Women Tailoring" />
          <div className="img-overlay">
            <span>Women Tailoring</span>
          </div>
        </div>

        <div className="img-wrap center">
          <img src={S} className="img" alt="Precision Stitching" />
          <div className="img-overlay">
            <span>Precision Stitching</span>
          </div>
        </div>

        <div className="img-wrap medium">
          <img src={T} className="img" alt="Expert Tailoring" />
          <div className="img-overlay">
            <span>Expert Tailoring</span>
          </div>
        </div>

      </div>
    </section>
  );
}
