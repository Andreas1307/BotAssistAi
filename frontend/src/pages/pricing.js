import React, { useState, useEffect } from "react";
import "../styling/Pricing.css"; 
import { Link } from "react-router-dom"
import Header from "../components/Header";
import Newsletter from "../components/newsletter";
import Footer from "../components/footer";
import Faq from "../components/faq"
import directory from '../directory';
import { fetchWithAuth } from "../utils/initShopifyAppBridge";
import { FaStar, FaUsers } from "react-icons/fa";
import { Helmet } from "react-helmet";
import { useNavigate, useLocation } from "react-router-dom";
const Pricing = () => {
  const [messages, setMessages] = useState(1000);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 
  const location = useLocation();
  const costWithoutBot = messages * 0.10;
  const botCost = messages > 1000 ? 20 : 0; 


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await fetchWithAuth("/auth-check");        
        setUser(data.user);
      } catch (error) {
        console.error("❌ Auth check error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUser();
  }, []);


  useEffect(() => {
    if (loading) return
      
    if (user?.shopify_access_token) {
      navigate("/shopify/dashboard");
      return;
    }
  
      if (user) {
        navigate(`/${user.username}/dashboard`);
        return 
      }
       if (location.pathname !== "/pricing") {
        navigate("/pricing");
      }
    
  }, [user, loading, navigate, location.pathname]);
  
  if (loading) {
    return null;
  }
  
  if (user) {
    return null;
  }

  return (
    <>
  <Helmet>
    <title>Pricing - BotAssistAI AI Chatbot Support for Websites</title>
    <meta name="description" content="Explore BotAssistAI's flexible pricing plans for AI-powered chatbot support. Choose the right plan to boost customer service on your website." />
    <meta name="keywords" content="BotAssistAI pricing, AI chatbot cost, website chatbot plans, AI customer support, chatbot subscription" />
    <link rel="canonical" href="https://www.botassistai.com/pricing" />
  </Helmet>


  {!loading ? (
      user ? (
        navigate(`/${user.username}/dashboard`) || null
      ) : (
        location.pathname !== "/pricing" ? (
          navigate("/pricing") || null
        ) : (
          <section className="pricingDiv">
          <Header />
          <div className="features-hero">
            <h1>💰 Flexible Pricing for Every Business</h1>
            <p>Choose a plan that fits your needs and start automating customer support today.</p>
          </div>
    
          <div className="pricing-plans">
            {/* Free Plan */}
            
    
            {/* Business Plan */}
            <div className="plan popular">
            <img
                  src={`${process.env.PUBLIC_URL}/img/BigLogo.png`}
                  alt="Benefit Image from Ai"
                />
              <span>
                 <div className="badge">🔥 Most Popular</div>
              <h2>BotAssistAi: The 24/7 AI Support</h2>
              <div className="reviews-price">
                <span>
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar className="hero-icon"/>
                  5.0 reviews
                </span>
                <span>
                  <FaUsers className="hero-icon"/>
                  100+ customers
                </span>
              </div>
              <h3>Plan, launch & automate customer support like a pro — 24/7.</h3>
              <h3>Get 5-tools-in-1 with BotAssistAi for just €20/mo (replaces €500+ in manual support costs).</h3>
              <h4>
              ✅ Limited-time: Start for €0 today & become an Early Partner (offer ends soon)
              </h4>
              <p className="price pro">€20<span>/month</span></p>
              <Link to={"/sign-up"}><button>Start Now</button></Link>
              <Link to={""}><button className="see">See Demo</button></Link>
              <h2 className="included">
              Included in Your Plan:
              </h2>
              <ul>
                <li>
                  <h5>🤖 24/7 AI chatbot support</h5>
                  <p>
                  Your AI assistant answers common questions instantly: shipping, returns, sizing, product info, availability, and more — giving your visitors the confidence to buy.
                  </p>
                  </li>
                <li>
                <h5>💬 Unlimited conversations</h5>
                <p>
                Whether you get 10 visitors or 10,000, your chatbot handles them all. No usage caps, hidden charges, or per-conversation fees.
                  </p>
                </li>
                <li>
                <h5>📅 Booking system</h5>
                <p>
                Let customers schedule services straight from the chat.
                Perfect for salons, consultations, events, or any appointment-based business — no extra tool needed.
                  </p>
                </li>
                <li>
                <h5>📈 Real-time chat analytics</h5>
                <p>
                Get clear insights into what questions get asked most, when people drop off, and how chat boosts your conversions — so you can optimize fast.
                  </p>
                </li>
                <li>
                  <h5> 🎛️ Fully Brand Customizable</h5>
                  <p>
                  Customize the bot’s colors, tone, voice, and name to perfectly match your website. No clunky third-party vibe — it feels native.
                    </p>
                </li>
                <li>
                <h5>🔍 Smart FAQ Upload</h5>
                <p>
                Upload your FAQs, shipping policies, return rules, or product docs — the bot uses this info to give smart, accurate replies in real time.
                  </p>
                </li>
                <li>
                <h5>🏷️ Searchable Chat History</h5>
                <p>
                Whether you want to follow up with a customer or track a common issue, it’s all searchable and saved securely.
                  </p>
                </li>
                <li>
                <h5>📁 Upload file-based FAQs or business info</h5>
                <p>
                No developers, no plugins, no complicated steps. You paste a single line on your site, and your bot goes live. Done in under 30 seconds.
                  </p>
                </li>
                <li>
                <h5>✅ Works with All Websites</h5>
                <p>
                No matter where your site lives, the bot fits right in and starts helping visitors right away.
                </p>
                </li>
          
              </ul>
              <h4>
              ✅ Limited-time: Start for €0 today & become an Early Partner (offer ends soon)
              </h4>
              <Link to={"/sign-up"}><button style={{marginTop: "15px"}}>Start Now For Free</button></Link>
              </span>
             
            </div>

<div className="plans">
  <div className="plan free">
              <h2>🚀 Free</h2>
              <p className="price pro">€0<span>/month</span></p>
              <ul>
                <li>✅ Basic AI chatbot</li>
                <li>✅ Unlimited Conversations</li>
                <li>❌ Little configuration</li>
                <li>❌ No analytics or insights</li>
                <li>❌ No access to past conversations</li>
                <li>❌ No sentiment analysis</li>
                <li>❌ No chatbot performance data</li>
                <li>❌ Limited system status visibility</li>
              </ul>
              <Link to={'/sign-up'}><button>Get Started</button></Link>
            </div>


             <div className="savings-calculator">
            <h2>💡 How Much Can You Save?</h2>
            <p>Enter the number of customer inquiries you handle per month:</p>
            <input 
              type="number" 
              value={messages} 
              onChange={(e) => setMessages(e.target.value)} 
              min="100"
            />
            <div className="cost-comparison">
              <p>Traditional Support Cost: <strong>${costWithoutBot.toFixed(2)}/month</strong></p>
              <p>With BotAssistAI: <strong>${botCost}/month</strong></p>
              <p className="savings">🎉 You Save: <strong>${(costWithoutBot - botCost).toFixed(2)}/month</strong></p>
            </div>
          </div>
</div>
            
    
            {/* Enterprise Plan 
            <div className="plan">
              <h2>🏢 Enterprise</h2>
              <p className="price pro">Custom Pricing</p>
              <ul>
                <li>✅ All Pro Plan features</li>
                <li>💸 Pay per conversation</li>
                <li>📈 Scales with usage</li>
                <li>🧾 Transparent usage billing</li>
                <li>🔧 Advanced bot Training</li>
                <li>🧠 Optimized AI performance</li>
                <li>🤖 Suited for any volume level</li>
              </ul>
              <button>Contact Sales</button>
            </div>*/}
          </div>
    
          {/* Savings Calculator */}
         
    
    
          <div className="pricing-comparison">
      <h2>📊 Compare Plans</h2>
      <table>
        <thead>
          <tr>
            <th>Features</th>
            <th>Free</th>
            <th>Pro</th>
            <th>Enterprise</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>AI Chatbot</td>
            <td>✅ Basic</td>
            <td>✅ Advanced</td>
            <td>✅ Advanced</td>
          </tr>
          <tr>
            <td>Integrations</td>
            <td>❌ None</td>
            <td>✅ API</td>
            <td>✅ API</td>
          </tr>
          <tr>
            <td>Analytics</td>
            <td>❌ Limited</td>
            <td>✅ Advanced</td>
            <td>✅ Advanced</td>
          </tr>
        </tbody>
      </table>
    
      {/* Mobile Cards */}
      <div className="mobile-cards">
      <div className="accordion">
        <div className="accordion-item">
          <input type="radio" name="accordion" id="free" defaultChecked />
          <label htmlFor="free">🚀 Free</label>
          <div className="content">
            <ul>
              <li><strong>AI Chatbot:</strong> ✅ Basic</li>
              <li><strong>Integrations:</strong> ❌ None</li>
              <li><strong>Analytics:</strong> ❌ Limited</li>
            </ul>
          </div>
        </div>
    
        <div className="accordion-item">
          <input type="radio" name="accordion" id="business" />
          <label htmlFor="business">💼 Pro</label>
          <div className="content">
            <ul>
              <li><strong>AI Chatbot:</strong> ✅ Advanced</li>
              <li><strong>Integrations:</strong> ✅ CRM, API</li>
              <li><strong>Analytics:</strong> ✅ Advanced</li>
            </ul>
          </div>
        </div>
    
        <div className="accordion-item">
          <input type="radio" name="accordion" id="enterprise" />
          <label htmlFor="enterprise">🏢 Enterprise</label>
          <div className="content">
            <ul>
              <li><strong>AI Chatbot:</strong> ✅ Fully Customizable</li>
              <li><strong>Integrations:</strong> ✅ Custom Integrations</li>
              <li><strong>Analytics:</strong> ✅ Custom Reports</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    
    </div>
    
    
          {/* Feature Highlights */}
          <div className="feature-highlights">
            <h2>🚀 Why Choose BotAssistAI?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3>⚡ Instant Responses</h3>
                <p>Reduce wait times and provide instant support 24/7.</p>
              </div>
              <div className="feature-card">
                <h3>🔗 Easy Integrations</h3>
                <p>Seamlessly connect with your CRM, API, and other tools.</p>
              </div>
              <div className="feature-card">
                <h3>📊 Data Insights</h3>
                <p>Gain insights into customer behavior and optimize support.</p>
              </div>
              <div className="feature-card">
      <h3>💬 Smart Chats</h3>
      <p>Handles customer queries with accurate, AI-powered responses.</p>
    </div>
            </div>
          </div>
    
          
          <Faq />
          <Newsletter />
          {/* Call to Action */}
          <div className="cta-section">
            <h2>🚀 Start Automating Your Support Today!</h2>
            <Link to={"/sign-up"}><button className="cta">Try for Free</button></Link>
          </div>
          <Footer />
        </section>
        )
      )
    ) : null}


   
  
    </>
    
  );
};

export default Pricing;
