import React from "react";
import "../styling/homepage.css"


const HowItWorks = () => {
    return (
        
        <section className="how-it-works">
  <h2>How It Works</h2>
  <div className="steps">
    <div className="step">
      <h3>1️⃣ Set Up</h3>
      <p>
        Sign up and train your chatBot with your business details within
        minutes—no coding required.
      </p>
    </div>

    <div className="step">
      <h3>🤖 Automate</h3>
      <p>
        Leverage AI to handle FAQs, process customer requests, and provide
        real-time solutions instantly.
      </p>
    </div>

    <div className="step">
      <h3>📈 Optimize</h3>
      <p>
        Analyze customer interactions, track performance, and continuously
        refine your chatbot’s responses for maximum efficiency.
      </p>
    </div>
  </div>
</section>
    )
}

export default HowItWorks