"use client";
import React, { useState } from "react";
import Image from "next/image";
import "../../styles/header.css";

const navItems = ["Home", "About", "Services", "Lab", "Work", "Contact"];

const Header = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="nav-container">
      <div className={`nav ${expanded ? "nav-expanded" : ""}`}>
        <div className="nav-bar">
          <h2>logo</h2>
          <button
            className="nav-toggle"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? "Close" : "Menu"}
          </button>
        </div>

        <div className="nav-dropdown">
          <div className="nav-dropdown-image">
            <Image src="/img1.jpg" alt="" fill className="nav-dropdown-img" />
            <span className="nav-dropdown-caption">Highlighted Blogs</span>
          </div>
          <div className="nav-dropdown-links">
            {navItems.map((item, i) => (
              <a key={item} href="#" className={i === 0 ? "active" : ""}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
