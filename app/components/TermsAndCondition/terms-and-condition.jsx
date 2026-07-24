import React from "react";
import "../../styles/privacy-policy.css";

const sections = [
  {
    heading: "Acceptance of These Terms",
    content: (
      <>
        <p>
          By accessing the Vyrl Communications website, submitting an inquiry,
          requesting a quotation, or using our website, you agree to these Terms
          and Conditions.
        </p>

        <p>
          If you do not agree with these Terms, please discontinue your use of
          the website. Project-specific proposals, contracts, and scopes of work
          may contain additional terms. Where there is a conflict, the signed
          project agreement will take priority.
        </p>
      </>
    ),
  },
  {
    heading: "About Vyrl Communications",
    content: (
      <>
        <p>
          Vyrl Communications is a full-service creative and digital agency
          based in Dubai, United Arab Emirates.
        </p>

        <p>
          Our services may include UI/UX design, web development, backend
          development, CGI and 3D production, branding, social media,
          performance marketing, AI automation, strategy, content production,
          and related digital services.
        </p>
      </>
    ),
  },
  {
    heading: "Website Use",
    content: (
      <>
        <p>
          You may use this website only for lawful purposes and in a manner that
          does not damage, disable, disrupt, or interfere with the website or
          another person’s use of it.
        </p>

        <p>You must not:</p>

        <ul>
          <li>Attempt to gain unauthorized access to our systems or accounts.</li>
          <li>Upload or transmit malicious code, viruses, or harmful material.</li>
          <li>Copy, scrape, reproduce, or exploit website content unlawfully.</li>
          <li>
            Use the website to submit misleading, fraudulent, abusive, or
            unlawful information.
          </li>
          <li>Impersonate another person, company, or organization.</li>
        </ul>
      </>
    ),
  },
  {
    heading: "Inquiries and Quotations",
    content: (
      <>
        <p>
          Information submitted through our Contact Us form is used to
          understand your requirements and respond to your inquiry.
        </p>

        <p>
          A quotation, estimate, discussion, presentation, or initial
          recommendation does not create a binding service agreement unless it
          is confirmed through an accepted proposal, contract, statement of
          work, purchase order, or another written agreement.
        </p>

        <p>
          Quotations may be valid only for the period stated in the relevant
          proposal and may change if the project scope, timeline, deliverables,
          or requirements change.
        </p>
      </>
    ),
  },
  {
    heading: "Project Scope and Changes",
    content: (
      <>
        <p>
          The services, deliverables, timeline, revision limits, responsibilities,
          and fees for each project will be described in the applicable
          proposal or agreement.
        </p>

        <p>
          Requests outside the approved scope may require additional time,
          resources, and fees. We will communicate material scope changes before
          proceeding whenever reasonably possible.
        </p>

        <p>
          Project timelines may be adjusted when approvals, content, access,
          feedback, payments, or other required materials are delayed.
        </p>
      </>
    ),
  },
  {
    heading: "Client Responsibilities",
    content: (
      <>
        <p>The client is responsible for:</p>

        <ul>
          <li>
            Providing complete, accurate, and timely project information.
          </li>
          <li>
            Supplying required content, assets, approvals, access, and feedback.
          </li>
          <li>
            Ensuring supplied materials do not violate third-party rights.
          </li>
          <li>
            Reviewing deliverables and reporting errors within the agreed
            review period.
          </li>
          <li>
            Maintaining backups of important files, accounts, and business
            information.
          </li>
          <li>
            Protecting passwords, access credentials, API keys, and account
            information.
          </li>
        </ul>

        <p>
          The client must have the necessary licenses, permissions, and legal
          authority to provide all logos, images, videos, data, fonts, text,
          software, and other materials supplied to Vyrl Communications.
        </p>
      </>
    ),
  },
  {
    heading: "Fees and Payments",
    content: (
      <>
        <p>
          Fees, payment schedules, deposits, retainers, taxes, and billing terms
          will be stated in the relevant proposal, invoice, or service
          agreement.
        </p>

        <p>
          Unless otherwise agreed in writing, work may begin only after the
          required deposit or initial payment has been received.
        </p>

        <p>
          Vyrl Communications may pause services, withhold final deliverables,
          restrict account access, or revise project timelines when an invoice
          remains overdue.
        </p>

        <p>
          Third-party costs such as advertising spend, hosting, domains,
          software subscriptions, stock assets, licenses, printing, production,
          and platform fees may be charged separately.
        </p>
      </>
    ),
  },
  {
    heading: "Cancellations and Refunds",
    content: (
      <>
        <p>
          Cancellation terms will be governed by the relevant proposal or
          service agreement.
        </p>

        <p>
          Payments for completed work, reserved production time, third-party
          expenses, approved milestones, and work already in progress are
          generally non-refundable, except where otherwise agreed or required
          by applicable law.
        </p>

        <p>
          If a project is cancelled, the client remains responsible for all work
          completed and costs incurred up to the cancellation date.
        </p>
      </>
    ),
  },
  {
    heading: "Intellectual Property",
    content: (
      <>
        <p>
          Vyrl Communications retains ownership of its pre-existing materials,
          methods, systems, code libraries, templates, tools, processes,
          concepts, and general agency knowledge.
        </p>

        <p>
          Ownership or licensing of final approved deliverables will be governed
          by the relevant project agreement and may be transferred only after
          all applicable invoices have been paid in full.
        </p>

        <p>
          Rejected concepts, unused drafts, source files, working files, and
          preliminary materials remain the property of Vyrl Communications
          unless otherwise agreed in writing.
        </p>

        <p>
          Third-party materials, software, plugins, fonts, stock media, and
          platform components remain subject to their respective license terms.
        </p>
      </>
    ),
  },
  {
    heading: "Portfolio and Promotional Use",
    content: (
      <>
        <p>
          Unless confidentiality obligations or a written agreement state
          otherwise, Vyrl Communications may display completed public-facing
          work in its portfolio, presentations, social media, award submissions,
          case studies, and promotional materials.
        </p>

        <p>
          We will not intentionally publish confidential business information,
          private credentials, unpublished data, or restricted project
          materials.
        </p>
      </>
    ),
  },
  {
    heading: "Third-Party Platforms",
    content: (
      <>
        <p>
          Our services may rely on third-party platforms such as hosting
          providers, social networks, advertising platforms, analytics tools,
          payment providers, plugins, artificial intelligence tools, and
          software services.
        </p>

        <p>
          Vyrl Communications does not control the availability, policies,
          pricing, functionality, security, or future changes of third-party
          services.
        </p>

        <p>
          The client may be required to accept and comply with the terms,
          privacy policies, and payment requirements of those providers.
        </p>
      </>
    ),
  },
  {
    heading: "AI-Generated and Automated Outputs",
    content: (
      <>
        <p>
          Certain services may involve artificial intelligence, automation, or
          machine-generated content. These systems can produce incomplete,
          inaccurate, inconsistent, or unexpected results.
        </p>

        <p>
          AI-generated outputs should be reviewed and approved before
          publication or business use. The client remains responsible for final
          approval, factual verification, legal compliance, and suitability of
          published materials.
        </p>
      </>
    ),
  },
  {
    heading: "Confidentiality",
    content: (
      <>
        <p>
          Each party should protect confidential information received in
          connection with a project and use it only for the intended business
          purpose.
        </p>

        <p>
          Confidentiality obligations do not apply to information that is
          publicly available, independently developed, lawfully received from
          another source, or required to be disclosed by law.
        </p>

        <p>
          Additional confidentiality requirements may be included in a separate
          nondisclosure agreement or project contract.
        </p>
      </>
    ),
  },
  {
    heading: "Warranties and Results",
    content: (
      <>
        <p>
          We aim to provide services professionally and according to the agreed
          scope. However, the website and general information on it are provided
          on an “as available” basis.
        </p>

        <p>
          Unless expressly stated in writing, Vyrl Communications does not
          guarantee specific sales, leads, rankings, audience growth,
          engagement, advertising performance, platform approvals, revenue, or
          other commercial results.
        </p>

        <p>
          Marketing and digital performance may be affected by market
          conditions, budgets, competition, algorithms, platform policies,
          audience behavior, client decisions, and other factors outside our
          control.
        </p>
      </>
    ),
  },
  {
    heading: "Limitation of Liability",
    content: (
      <>
        <p>
          To the maximum extent permitted by applicable law, Vyrl
          Communications will not be responsible for indirect, incidental,
          special, or consequential losses arising from the use of our website
          or services.
        </p>

        <p>
          This may include loss of revenue, profit, data, business opportunity,
          reputation, advertising spend, or service availability.
        </p>

        <p>
          Any liability arising from a paid project will be subject to the
          limitations stated in the applicable service agreement. Nothing in
          these Terms excludes liability that cannot legally be excluded.
        </p>
      </>
    ),
  },
  {
    heading: "Indemnification",
    content: (
      <p>
        You agree to be responsible for claims, losses, or expenses resulting
        from materials you provide, your unlawful use of our website or
        deliverables, your violation of these Terms, or your infringement of
        another party’s intellectual property, privacy, or legal rights.
      </p>
    ),
  },
  {
    heading: "Suspension or Termination",
    content: (
      <>
        <p>
          We may suspend or terminate access to our website or services where
          reasonably necessary due to non-payment, unlawful conduct, abusive
          behavior, security risks, contractual violations, or misuse of our
          systems.
        </p>

        <p>
          Termination will not remove payment obligations, intellectual
          property provisions, confidentiality requirements, or other terms
          intended to continue after the relationship ends.
        </p>
      </>
    ),
  },
  {
    heading: "Governing Law and Disputes",
    content: (
      <>
        <p>
          These Terms are governed by the applicable laws of the United Arab
          Emirates.
        </p>

        <p>
          Unless a separate written agreement provides otherwise, disputes
          relating to these Terms or our services will be subject to the
          competent courts of Dubai, United Arab Emirates.
        </p>

        <p>
          Before beginning formal proceedings, both parties should attempt to
          resolve the dispute through good-faith discussions.
        </p>
      </>
    ),
  },
  {
    heading: "Changes to These Terms",
    content: (
      <>
        <p>
          We may update these Terms periodically to reflect changes in our
          website, services, business practices, technology, or legal
          obligations.
        </p>

        <p>
          The revised version will be published on this page with an updated
          effective date. Continued use of the website after an update means
          that you accept the revised Terms.
        </p>
      </>
    ),
  },
  {
    heading: "Contact Us",
    content: (
      <>
        <p>
          For questions regarding these Terms and Conditions, please contact
          Vyrl Communications:
        </p>

        <div className="pp-contact-details">
          <p>
            <strong>Vyrl Communications</strong>
          </p>

          <p>
            <strong>Address:</strong>
            <br />
            International Business Tower,
            <br />
            Business Bay,
            <br />
            Dubai, United Arab Emirates
          </p>

          <p>
            <strong>Phone:</strong>
            <br />
            <a href="tel:+971585355134">+971 58 535 5134</a>
            <br />
            <a href="tel:+971585134999">+971 58 513 4999</a>
          </p>

          <p>
            You may also contact us through the Contact Us form available on
            our website.
          </p>
        </div>
      </>
    ),
  },
];

const TermsAndConditions = () => {
  return (
    <main className="pp-wrapper">
      <section className="pp-hero">
        <h1>Terms and Conditions</h1>

        <p>
          These Terms and Conditions govern your use of the Vyrl Communications
          website and your interactions with our creative, technology, and
          digital marketing services.
        </p>

        <p>
          Project-specific services may also be governed by a separate proposal,
          statement of work, invoice, or service agreement accepted by the
          client.
        </p>

        <p className="pp-updated">
          <strong>Last updated:</strong> July 24, 2026
        </p>
      </section>

      <section className="pp-sections" aria-label="Terms and Conditions Sections">
        {sections.map((section, index) => (
          <article key={section.heading} className="pp-row">
            <div className="pp-left">
              <h2>
                <span className="pp-section-number">
                  {String(index + 1).padStart(2, "0")}.
                </span>{" "}
                {section.heading}
              </h2>
            </div>

            <div className="pp-right">{section.content}</div>

            <div className="pp-divider" aria-hidden="true" />
          </article>
        ))}
      </section>
    </main>
  );
};

export default TermsAndConditions;