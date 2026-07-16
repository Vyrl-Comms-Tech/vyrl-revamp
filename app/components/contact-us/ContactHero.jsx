"use client";
import React from "react";

const SERVICE_TAGS = [
  "UIUX",
  "Web Development",
  "CGI 3D",
  "Backend",
  "Other Topic",
];

const SocialIcons = () => (
  <div className="contactHero-social">
    <div className="contactHero-social-btn" aria-label="LinkedIn">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="25"
        height="23"
        viewBox="0 0 25 23"
        fill="none"
      >
        <path
          d="M5.24659 2.55669C5.24624 3.23443 4.96953 3.88427 4.47732 4.36327C3.98511 4.84226 3.31772 5.11117 2.62198 5.11083C1.92624 5.11049 1.25914 4.84093 0.767418 4.36146C0.275701 3.88199 -0.000347542 3.23187 3.28386e-07 2.55414C0.000348199 1.8764 0.277064 1.22655 0.769273 0.74756C1.26148 0.268567 1.92887 -0.000338549 2.62461 3.19889e-07C3.32035 0.000339189 3.98746 0.269894 4.47917 0.749367C4.97089 1.22884 5.24694 1.87895 5.24659 2.55669ZM5.32529 7.00311H0.0786991V23H5.32529V7.00311ZM13.6149 7.00311H8.39454V23H13.5624V14.6055C13.5624 9.92906 19.819 9.49464 19.819 14.6055V23H25V12.8678C25 4.98433 15.7398 5.27821 13.5624 9.14966L13.6149 7.00311Z"
          fill="#F6F6F6"
        />
      </svg>
    </div>
    <div className="contactHero-social-btn" aria-label="Facebook">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="13"
        height="15"
        viewBox="0 0 13 25"
        fill="none"
      >
        <path
          d="M8.66667 14.375H11.7619L13 9.375H8.66667V6.875C8.66667 5.5875 8.66667 4.375 11.1429 4.375H13V0.175C12.5964 0.12125 11.0723 0 9.46276 0C6.10133 0 3.71429 2.07125 3.71429 5.875V9.375H0V14.375H3.71429V25H8.66667V14.375Z"
          fill="#F6F6F6"
        />
      </svg>
    </div>
    <div className="contactHero-social-btn" aria-label="Instagram">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="25"
        height="25"
        viewBox="0 0 25 25"
        fill="none"
      >
        <path
          d="M7.25 0H17.75C21.75 0 25 3.25 25 7.25V17.75C25 19.6728 24.2362 21.5169 22.8765 22.8765C21.5169 24.2362 19.6728 25 17.75 25H7.25C3.25 25 0 21.75 0 17.75V7.25C0 5.32718 0.763837 3.48311 2.12348 2.12348C3.48311 0.763837 5.32718 0 7.25 0ZM7 2.5C5.80653 2.5 4.66193 2.97411 3.81802 3.81802C2.97411 4.66193 2.5 5.80653 2.5 7V18C2.5 20.4875 4.5125 22.5 7 22.5H18C19.1935 22.5 20.3381 22.0259 21.182 21.182C22.0259 20.3381 22.5 19.1935 22.5 18V7C22.5 4.5125 20.4875 2.5 18 2.5H7ZM19.0625 4.375C19.4769 4.375 19.8743 4.53962 20.1674 4.83265C20.4604 5.12567 20.625 5.5231 20.625 5.9375C20.625 6.3519 20.4604 6.74933 20.1674 7.04235C19.8743 7.33538 19.4769 7.5 19.0625 7.5C18.6481 7.5 18.2507 7.33538 17.9576 7.04235C17.6646 6.74933 17.5 6.3519 17.5 5.9375C17.5 5.5231 17.6646 5.12567 17.9576 4.83265C18.2507 4.53962 18.6481 4.375 19.0625 4.375ZM12.5 6.25C14.1576 6.25 15.7473 6.90848 16.9194 8.08058C18.0915 9.25268 18.75 10.8424 18.75 12.5C18.75 14.1576 18.0915 15.7473 16.9194 16.9194C15.7473 18.0915 14.1576 18.75 12.5 18.75C10.8424 18.75 9.25268 18.0915 8.08058 16.9194C6.90848 15.7473 6.25 14.1576 6.25 12.5C6.25 10.8424 6.90848 9.25268 8.08058 8.08058C9.25268 6.90848 10.8424 6.25 12.5 6.25ZM12.5 8.75C11.5054 8.75 10.5516 9.14509 9.84835 9.84835C9.14509 10.5516 8.75 11.5054 8.75 12.5C8.75 13.4946 9.14509 14.4484 9.84835 15.1517C10.5516 15.8549 11.5054 16.25 12.5 16.25C13.4946 16.25 14.4484 15.8549 15.1517 15.1517C15.8549 14.4484 16.25 13.4946 16.25 12.5C16.25 11.5054 15.8549 10.5516 15.1517 9.84835C14.4484 9.14509 13.4946 8.75 12.5 8.75Z"
          fill="#F6F6F6"
        />
      </svg>
    </div>
  </div>
);

const ContactHero = () => {
  return (
    <div className="contactHero">
      <div className="contactHero-left">
        <button className="contactHero-back" aria-label="Go back">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            stroke="2"
            viewBox="0 0 18 14"
            fill="none"
          >
            <path
              d="M0.469669 6.46967C0.176777 6.76256 0.176777 7.23744 0.469669 7.53033L5.24264 12.3033C5.53553 12.5962 6.01041 12.5962 6.3033 12.3033C6.59619 12.0104 6.59619 11.5355 6.3033 11.2426L2.06066 7L6.3033 2.75736C6.59619 2.46447 6.59619 1.98959 6.3033 1.6967C6.01041 1.40381 5.53553 1.40381 5.24264 1.6967L0.469669 6.46967ZM18 6.25L1 6.25V7.75L18 7.75V6.25Z"
              fill="white"
            />
          </svg>
        </button>

        <div className="contactHero-image">
          <img src="/img1.jpg" alt="" />

          <div className="contactHero-newsletter">
            <h3>Stay In The Loop</h3>
            <p>
              Stay updated with the latest news, insights, and updates from
              Vyrl—delivered straight to your inbox.
            </p>
            <div className="contactHero-newsletter-form">
              <input type="email" placeholder="Subscribe" />
              <button>Send Now</button>
            </div>
          </div>
        </div>
      </div>

      <div className="contactHero-right">
        <h1>Contact us</h1>

        <div className="contactHero-field-group">
          <span className="contactHero-label">Chose services</span>
          <div className="contactHero-tags">
            {SERVICE_TAGS.map((tag) => (
              <button type="button" className="contactHero-tag" key={tag}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="contactHero-field-group">
          <span className="contactHero-label">Your Information</span>
          <form className="contactHero-form">
            <div className="contactHero-form-row">
              <input type="text" placeholder="Full Name" />
              <input type="email" placeholder="Email@" />
            </div>
            <div className="contactHero-form-row">
              <input type="tel" placeholder="Phone Number" />
              <input type="text" placeholder="Country" />
            </div>
            <div className="contactHero-form-row contactHero-form-row--full">
              <input type="text" placeholder="Message" />
            </div>

            <button type="submit" className="contactHero-submit">
              Send Now
              <span className="contactHero-submit-arrow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="18"
                  viewBox="0 0 15 18"
                  fill="none"
                >
                  <path
                    d="M10.3213 0.000213146L1.27547e-05 4.4884L0.64805 5.937L8.47908 2.53785L2.7051 17.4253L4.19683 18.0038L9.97081 3.11641L13.462 10.9068L14.9174 10.274L10.3213 0.000213146Z"
                    fill="#fff"
                  />
                </svg>
              </span>
            </button>
          </form>
        </div>

        <p className="contactHero-blurb">
          Have a project in mind or just want to say <a href="#">hello vyrl?</a>{" "}
          We&apos;d love to hear from you. Whether you&apos;re starting
          something new or looking to elevate your brand, our team is here to
          help bring your ideas to life.
        </p>

        <SocialIcons />
      </div>
    </div>
  );
};

export default ContactHero;
