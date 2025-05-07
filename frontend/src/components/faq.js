import React, { useState } from "react";
import "../styling/homepage.css"

const Faq = () => {


    
  const faqs = [
    {
      question: "How does BotAssistAI integrate with my website?",
      answer:
        "Integration is seamless! Use our easy-to-setup API, plugins, and step-by-step guides to get started in minutes.",
    },
    {
      question: "Is customer data secure?",
      answer:
        "Absolutely! We follow industry-leading security protocols, including end-to-end encryption and GDPR compliance, to keep your data safe.",
    },
    {
      question: "Can BotAssistAI handle multiple languages?",
      answer:
        "Yes! BotAssistAI supports over 50 languages, ensuring smooth interactions with customers worldwide.",
    },
    {
      question: "Can the chatbot handle complex customer queries?",
      answer:
        "Absolutely! Our AI chatbot is built to understand context, manage multi-turn conversations, and resolve complex issues without human intervention.",
    },
    {
      question: "Is BotAssistAI available 24/7?",
      answer:
        "Yes! Unlike human agents, our AI chatbot is available 24/7, ensuring your customers always get instant responses.",
    },
    {
      question: "How does BotAssistAI improve customer satisfaction?",
      answer:
        "With instant replies, personalized responses, and data-driven optimizations, your customers get faster and more accurate support, improving their overall experience.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };


    return (

        <section className="faq">
      <h2>Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <h3 onClick={() => toggleFAQ(index)}>
              {faq.question}
              <span className="arrow">{openIndex === index ? "▲" : "▼"}</span>
            </h3>
            {openIndex === index && <p>{faq.answer}</p>}
          </div>
        ))}
      </div>
    </section>
    )
}

export default Faq