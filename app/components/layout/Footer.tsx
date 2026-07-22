"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { caseStudies } from "../caseStudy/caseStudiesData";
import "../../styles/footer.css";

const CASE_STUDY_PATHS = Object.values(caseStudies).map((c) => c.href);
const NO_FOOTER_PATHS = [...CASE_STUDY_PATHS, "/contact-us"];

function Footer() {
  const pathname = usePathname();
  const hideFooter = NO_FOOTER_PATHS.includes(pathname);

  const [time, setTime] = useState({
    uae: "",
    usa: "",
  });

  useEffect(() => {
    const updateTime = () => {
      const format = (timeZone: string) =>
        new Intl.DateTimeFormat("en-US", {
          timeZone,
          hour: "2-digit",
          minute: "2-digit",
          // second: "2-digit",
        }).format(new Date());

      setTime({
        uae: format("Asia/Dubai"),
        usa: format("America/New_York"),
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (hideFooter) return null;

  return (
    <footer className="footer">
      {/* Row 1 – Logo */}
      <div className="footer-logo-row">
        <img src="/footerimg1.avif" alt="Vyrl" className="footer-logo-img" />
      </div>

      {/* Row 2 – Let's Connect + Nav Links */}
      <div className="footer-connect-row">
        {/* Left */}
        <div className="footer-connect-left">
          <div className="footer-connect-heading">
            <button
              className="footer-arrow-btn footer-arrow-btn--left"
              aria-label="Connect"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 18"
                fill="none"
              >
                <path
                  d="M1.00005 16.9606L13.0528 1.00031M14.9171 11.8065L13.0528 1.00031L2.14891 2.16431"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <h2 className="footer-connect-title">Stay In The Loop</h2>

            <button
              className="footer-arrow-btn footer-arrow-btn--right"
              aria-label="Connect"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 18"
                fill="none"
              >
                <path
                  d="M1.00005 16.9606L13.0528 1.00031M14.9171 11.8065L13.0528 1.00031L2.14891 2.16431"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <p className="footer-connect-subtitle">
            Stay updated with our latest work, insights, case <br /> studies, and
            digital ideas straight from Vyrl
          </p>

          <div className="footer-social">
            <div className="footer-social-btn" aria-label="LinkedIn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="footer-social-icon"
                viewBox="0 0 25 23"
                fill="none"
              >
                <path
                  d="M5.24659 2.55669C5.24624 3.23443 4.96953 3.88427 4.47732 4.36327C3.98511 4.84226 3.31772 5.11117 2.62198 5.11083C1.92624 5.11049 1.25914 4.84093 0.767418 4.36146C0.275701 3.88199 -0.000347542 3.23187 3.28386e-07 2.55414C0.000348199 1.8764 0.277064 1.22655 0.769273 0.74756C1.26148 0.268567 1.92887 -0.000338549 2.62461 3.19889e-07C3.32035 0.000339189 3.98746 0.269894 4.47917 0.749367C4.97089 1.22884 5.24694 1.87895 5.24659 2.55669ZM5.32529 7.00311H0.0786991V23H5.32529V7.00311ZM13.6149 7.00311H8.39454V23H13.5624V14.6055C13.5624 9.92906 19.819 9.49464 19.819 14.6055V23H25V12.8678C25 4.98433 15.7398 5.27821 13.5624 9.14966L13.6149 7.00311Z"
                  fill="#E6E6E6"
                />
              </svg>
            </div>

            <div className="footer-social-btn" aria-label="Facebook">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="footer-social-icon"
                viewBox="0 0 13 25"
                fill="none"
              >
                <path
                  d="M8.66667 14.375H11.7619L13 9.375H8.66667V6.875C8.66667 5.5875 8.66667 4.375 11.1429 4.375H13V0.175C12.5964 0.12125 11.0723 0 9.46276 0C6.10133 0 3.71429 2.07125 3.71429 5.875V9.375H0V14.375H3.71429V25H8.66667V14.375Z"
                  fill="#E6E6E6"
                />
              </svg>
            </div>

            <div className="footer-social-btn" aria-label="Instagram">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="footer-social-icon"
                viewBox="0 0 25 25"
                fill="none"
              >
                <path
                  d="M7.25 0H17.75C21.75 0 25 3.25 25 7.25V17.75C25 19.6728 24.2362 21.5169 22.8765 22.8765C21.5169 24.2362 19.6728 25 17.75 25H7.25C3.25 25 0 21.75 0 17.75V7.25C0 5.32718 0.763837 3.48311 2.12348 2.12348C3.48311 0.763837 5.32718 0 7.25 0ZM7 2.5C5.80653 2.5 4.66193 2.97411 3.81802 3.81802C2.97411 4.66193 2.5 5.80653 2.5 7V18C2.5 20.4875 4.5125 22.5 7 22.5H18C19.1935 22.5 20.3381 22.0259 21.182 21.182C22.0259 20.3381 22.5 19.1935 22.5 18V7C22.5 4.5125 20.4875 2.5 18 2.5H7ZM19.0625 4.375C19.4769 4.375 19.8743 4.53962 20.1674 4.83265C20.4604 5.12567 20.625 5.5231 20.625 5.9375C20.625 6.3519 20.4604 6.74933 20.1674 7.04235C19.8743 7.33538 19.4769 7.5 19.0625 7.5C18.6481 7.5 18.2507 7.33538 17.9576 7.04235C17.6646 6.74933 17.5 6.3519 17.5 5.9375C17.5 5.5231 17.6646 5.12567 17.9576 4.83265C18.2507 4.53962 18.6481 4.375 19.0625 4.375ZM12.5 6.25C14.1576 6.25 15.7473 6.90848 16.9194 8.08058C18.0915 9.25268 18.75 10.8424 18.75 12.5C18.75 14.1576 18.0915 15.7473 16.9194 16.9194C15.7473 18.0915 14.1576 18.75 12.5 18.75C10.8424 18.75 9.25268 18.0915 8.08058 16.9194C6.90848 15.7473 6.25 14.1576 6.25 12.5C6.25 10.8424 6.90848 9.25268 8.08058 8.08058C9.25268 6.90848 10.8424 6.25 12.5 6.25ZM12.5 8.75C11.5054 8.75 10.5516 9.14509 9.84835 9.84835C9.14509 10.5516 8.75 11.5054 8.75 12.5C8.75 13.4946 9.14509 14.4484 9.84835 15.1517C10.5516 15.8549 11.5054 16.25 12.5 16.25C13.4946 16.25 14.4484 15.8549 15.1517 15.1517C15.8549 14.4484 16.25 13.4946 16.25 12.5C16.25 11.5054 15.8549 10.5516 15.1517 9.84835C14.4484 9.14509 13.4946 8.75 12.5 8.75Z"
                  fill="#E6E6E6"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Right – Nav columns */}
        <nav className="footer-nav">
          <div className="footer-inner-link-col">
            <div className="footer-nav-col">
              <h4 className="footer-nav-title">Links</h4>
              <Link href="/" className="footer-nav-link">
                Home
              </Link>
              <Link href="/about" className="footer-nav-link">
                About
              </Link>
              <Link href="/services" className="footer-nav-link">
                Services
              </Link>
              <Link href="/work" className="footer-nav-link">
                Work
              </Link>
              <Link href="/contact-us" className="footer-nav-link">
                Contact
              </Link>
            </div>
            <div className="footer-nav-col">
              <h4 className="footer-nav-title">Other</h4>
              <Link href="/work" className="footer-nav-link">
                Case Studies
              </Link>
              <Link href="/blogs" className="footer-nav-link">
                Blog
              </Link>
              <Link href="/blogs" className="footer-nav-link">
                Careers
              </Link>
            </div>
            <div className="footer-nav-col">
              <h4 className="footer-nav-title">Info</h4>
              <Link href="/privacy" className="footer-nav-link">
                Privacy Policy
              </Link>
              <Link href="/terms" className="footer-nav-link">
                Terms Of Service
              </Link>
            </div>
            <div className="footer-nav-col">
              <h4 className="footer-nav-title">Address</h4>
              <span className="footer-nav-link"> Global / UAE</span>
            </div>
          </div>
        </nav>
      </div>

      {/* Row 3 – Subscribe + Mascot + Info */}

      <div className="footer-bottom-row">
        <div className="footer-subscribe">
          <h3 className="footer-subscribe-title">Stay In The Loop</h3>
          <p className="footer-subscribe-subtitle">
            Stay updated with the latest news, insights, and updates from
            Vyrl—delivered straight to your inbox.
          </p>
          <div className="footer-subscribe-form">
            <input
              type="email"
              placeholder="Subscribe"
              className="footer-subscribe-input"
            />
            <button className="footer-subscribe-btn">Send Now</button>
          </div>
        </div>

        <div className="footer-mascot">
          <video
            className=""
            autoPlay
            muted
            loop
            playsInline
            src="/smiley_compressed.mp4"
          ></video>
        </div>

        <div className="footer-info">
          <div className="footer-time">
            <div className="footer-local-time-container">
              <span className="footer-time-label">Local Time</span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 28 28"
                fill="none"
              >
                <path
                  d="M13.4167 3.5C16.3562 3.5 19.1753 4.6677 21.2538 6.74623C23.3323 8.82476 24.5 11.6439 24.5 14.5833C24.5 17.5228 23.3323 20.3419 21.2538 22.4204C19.1753 24.499 16.3562 25.6667 13.4167 25.6667C10.4772 25.6667 7.65813 24.499 5.57961 22.4204C3.50108 20.3419 2.33337 17.5228 2.33337 14.5833C2.33337 11.6439 3.50108 8.82476 5.57961 6.74623C7.65813 4.6677 10.4772 3.5 13.4167 3.5ZM13.4167 4.66667C10.7866 4.66667 8.2643 5.71146 6.40457 7.57119C4.54483 9.43093 3.50004 11.9533 3.50004 14.5833C3.50004 17.2134 4.54483 19.7357 6.40457 21.5955C8.2643 23.4552 10.7866 24.5 13.4167 24.5C14.719 24.5 16.0085 24.2435 17.2117 23.7451C18.4148 23.2468 19.508 22.5163 20.4289 21.5955C21.3497 20.6746 22.0802 19.5814 22.5785 18.3783C23.0769 17.1751 23.3334 15.8856 23.3334 14.5833C23.3334 11.9533 22.2886 9.43093 20.4289 7.57119C18.5691 5.71146 16.0468 4.66667 13.4167 4.66667ZM12.8334 8.16667H14V14.49L19.4834 17.6517L18.9 18.6667L12.8334 15.1667V8.16667Z"
                  fill="#E6E6E6"
                />
              </svg>
            </div>

            <div className="footer-time-values">
              <span className="footer-time-value">UAE : {time.uae}</span>
              <span className="footer-time-value">USA : {time.usa}</span>
            </div>
          </div>

          <div className="footer-next">
            <h3 className="footer-next-title">Next Page</h3>
            <div className="footer-next-bar">
              <div className="footer-next-line" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="19"
                viewBox="0 0 22 19"
                fill="none"
              >
                <path
                  d="M0 9.54443C0 10.0168 0.187948 10.4699 0.522495 10.804C0.857044 11.138 1.31079 11.3257 1.78391 11.3257L15.9125 11.3257L11.2267 16.0044C10.9116 16.3421 10.7401 16.7887 10.7482 17.2502C10.7564 17.7116 10.9436 18.1519 11.2705 18.4783C11.5973 18.8046 12.0383 18.9916 12.5004 18.9997C12.9626 19.0079 13.4098 18.8366 13.748 18.5219L21.4783 10.8032C21.8124 10.4692 22 10.0165 22 9.54443C22 9.0724 21.8124 8.61967 21.4783 8.28568L13.748 0.566932C13.5847 0.391926 13.3877 0.251558 13.1689 0.154202C12.9501 0.0568466 12.7139 0.00449708 12.4743 0.000277214C12.2348 -0.00394265 11.9969 0.0400531 11.7748 0.12964C11.5526 0.219228 11.3509 0.352571 11.1815 0.521716C11.0121 0.69086 10.8785 0.892341 10.7888 1.11414C10.6991 1.33593 10.655 1.5735 10.6592 1.81267C10.6635 2.05184 10.7159 2.28771 10.8134 2.50621C10.9109 2.72471 11.0515 2.92136 11.2267 3.08443L15.9125 7.76318L1.78391 7.76318C0.799192 7.76318 0 8.56118 0 9.54443Z"
                  fill="#E6E6E6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
