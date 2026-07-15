import React from "react";
import "../../styles/cta.css";

const CtaButton = ({
  label = "SERVICES",
  videoSrc = "/bg-v.mp4",
  href = "#",
  className = "",
}) => {
  return (
    <div className="cta-btn-container">
      <a className={`cta-btn ${className}`.trim()} href={href}>
        <div className="cta-btn-vid">
          <video muted loop autoPlay playsInline>
            <source src={videoSrc} />
          </video>
        </div>
        <div className="cta-arrow-box">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="18"
            viewBox="0 0 15 18"
            fill="none"
          >
            <path
              d="M10.3213 0.000213146L1.27547e-05 4.4884L0.64805 5.937L8.47908 2.53785L2.7051 17.4253L4.19683 18.0038L9.97081 3.11641L13.462 10.9068L14.9174 10.274L10.3213 0.000213146Z"
              fill="white"
            />
          </svg>
        </div>
        <p>{label}</p>
      </a>
    </div>
  );
};

export default CtaButton;
