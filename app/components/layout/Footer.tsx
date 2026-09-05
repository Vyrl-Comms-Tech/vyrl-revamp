"use client";
import { usePathname } from "next/navigation";
import { caseStudies } from "../caseStudy/caseStudiesData";
import FooterContent from "./FooterContent";
import { isKnownRoute } from "./knownRoutes";
import "../../styles/footer.css";
// 
const CASE_STUDY_PATHS = Object.values(caseStudies).map((c) => c.href);
const NO_FOOTER_PATHS = [...CASE_STUDY_PATHS, "/contact-us"];
const STATIC_FOOTER_PATHS = ["/privacy-policy", "/terms-and-condition"];

function Footer() {
  const pathname = usePathname();
  const hideFooter =
    NO_FOOTER_PATHS.includes(pathname) || !isKnownRoute(pathname);
  if (hideFooter) return null;

  return (
    <footer
      className={`footer${pathname === "/projects" ? " footer--no-radius" : ""}${
        STATIC_FOOTER_PATHS.includes(pathname) ? " footer--static" : ""
      }`}
    >
      <FooterContent />
      </footer>
  );
}

export default Footer;
