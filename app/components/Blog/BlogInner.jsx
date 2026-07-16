import React from "react";
import TextAnimation from "../home/TextAnimation";

const biContent = [
  "In a world where attention spans are shrinking and competition is growing by the second, creating meaningful digital experiences is no longer optional—it's essential. Users today are constantly bombarded with content, choices, and interactions, making it increasingly difficult for brands to stand out. This shift has forced businesses to rethink not just how they present themselves online, but how they connect with their audience on a deeper level. A simple presence is no longer enough; what matters is the quality, clarity, and intention behind every interaction.",
  "Modern users don't just interact with websites or products—they engage with stories, emotions, and the intent behind every design decision. Every click, scroll, and transition contributes to a larger narrative that shapes how a brand is perceived. When design is approached thoughtfully, it becomes more than just visuals; it becomes a powerful communication tool that builds trust and creates lasting impressions. This is where the difference lies between something that is merely functional and something that is truly memorable.",
  "A well-crafted digital experience goes far beyond aesthetics. While visual appeal plays an important role, it is the seamless integration of strategy, usability, and innovation that defines success. Design must feel effortless to the user, even when it is backed by complex thinking and careful planning. The best experiences are often the ones that go unnoticed in terms of effort, because everything works exactly as expected—smooth, intuitive, and purposeful.",
  "From the very first scroll to the final interaction, every element must serve a purpose. Typography, spacing, color, motion, and content all need to work in harmony to guide users naturally through the journey. Good design doesn't force users to think—it leads them. It removes friction, simplifies decisions, and ensures that every step feels logical and intentional. At the same time, it reinforces brand identity, ensuring that the experience remains consistent and recognizable throughout.",
  "As technology continues to evolve, so do user expectations. Speed is no longer a luxury; it is expected. Responsiveness is no longer impressive; it is required. Personalization is no longer optional; it is becoming the standard. Users expect digital platforms to adapt to their needs, preferences, and behaviors in real time. This means that businesses must constantly innovate and refine their digital presence to stay relevant in an ever-changing landscape.",
  "The brands that truly stand out are not the ones chasing every new trend, but the ones that understand their audience and focus on creating lasting value. They prioritize clarity over complexity, purpose over decoration, and experience over noise. Thoughtful design combined with clear messaging allows them to communicate effectively while building strong, long-term relationships with their users.",
  "In a world where attention spans are shrinking and competition is growing by the second, creating meaningful digital experiences is no longer optional—it's essential. Users today are constantly bombarded with content, choices, and interactions, making it increasingly difficult for brands to stand out. This shift has forced businesses to rethink not just how they present themselves online, but how they connect with their audience on a deeper level. A simple presence is no longer enough; what matters is the quality, clarity, and intention behind every interaction.",
  "Modern users don't just interact with websites or products—they engage with stories, emotions, and the intent behind every design decision. Every click, scroll, and transition contributes to a larger narrative that shapes how a brand is perceived. When design is approached thoughtfully, it becomes more than just visuals; it becomes a powerful communication tool that builds trust and creates lasting impressions. This is where the difference lies between something that is merely functional and something that is truly memorable.",
  "A well-crafted digital experience goes far beyond aesthetics. While visual appeal plays an important role, it is the seamless integration of strategy, usability, and innovation that defines success. Design must feel effortless to the user, even when it is backed by complex thinking and careful planning. The best experiences are often the ones that go unnoticed in terms of effort, because everything works exactly as expected—smooth, intuitive, and purposeful.",
  "From the very first scroll to the final interaction, every element must serve a purpose. Typography, spacing, color, motion, and content all need to work in harmony to guide users naturally through the journey. Good design doesn't force users to think—it leads them. It removes friction, simplifies decisions, and ensures that every step feels logical and intentional. At the same time, it reinforces brand identity, ensuring that the experience remains consistent and recognizable throughout.",
  "As technology continues to evolve, so do user expectations. Speed is no longer a luxury; it is expected. Responsiveness is no longer impressive; it is required. Personalization is no longer optional; it is becoming the standard. Users expect digital platforms to adapt to their needs, preferences, and behaviors in real time. This means that businesses must constantly innovate and refine their digital presence to stay relevant in an ever-changing landscape.",
  "The brands that truly stand out are not the ones chasing every new trend, but the ones that understand their audience and focus on creating lasting value. They prioritize clarity over complexity, purpose over decoration, and experience over noise. Thoughtful design combined with clear messaging allows them to communicate effectively while building strong, long-term relationships with their users.",
];

const BlogInner = () => {
  return (
    <div className="bi-container">
      <div className="bi-left-image">
        <img src="/blog5.jpg" alt="" />
      </div>
      <div className="bi-right">
                        <TextAnimation animateOnScroll={true} delay={0.3}>
      
          <div className="bi-label">• Digital Campaign</div>
        </TextAnimation>
                        <TextAnimation animateOnScroll={true} delay={0.3}>

          <div className="bi-subtitle">The Future of Digital Experiences:</div>
        </TextAnimation>
                        <TextAnimation animateOnScroll={true} delay={0.3}>

          <h2 className="bi-heading">Designing with Purpose</h2>
        </TextAnimation>
                        <TextAnimation animateOnScroll={true} delay={0.3}>

          <div className="bi-date">April 16, 2026</div>
        </TextAnimation>
        <div className="bi-content">
          {biContent.map((text, i) => (
                            <TextAnimation animateOnScroll={true} delay={0.3}>

              <p key={i}>{text}</p>
            </TextAnimation>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogInner;
