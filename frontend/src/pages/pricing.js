import React, { useState, useEffect } from "react";
import "../styling/Pricing.css"; 
import { Link } from "react-router-dom"
import Header from "../components/Header";
import Newsletter from "../components/newsletter";
import Footer from "../components/footer";
import Faq from "../components/faq"
import directory from '../directory';
import axios from "axios";
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
        const res = await axios.get(`${directory}/auth-check`, { withCredentials: true });
        setUser(res.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);


  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate(`/${user.username}/dashboard`);
      } else if (location.pathname !== "/pricing") {
        navigate("/pricing");
      }
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
            <div className="plan">
              <h2>🚀 Free</h2>
              <p className="price pro">€0<span>/month</span></p>
              <ul>
                <li>✅ Basic AI chatbot</li>
                <li>✅ Up to 30 conversations/day</li>
                <li>❌ No Booking System</li>
                <li>❌ Little configuration</li>
                <li>❌ No analytics or insights</li>
                <li>❌ No access to past conversations</li>
                <li>❌ No sentiment analysis</li>
                <li>❌ No chatbot performance data</li>
                <li>❌ Limited system status visibility</li>
              </ul>
              <Link to={'/sign-up'}><button>Get Started</button></Link>
            </div>
    
            {/* Business Plan */}
            <div className="plan popular">
              <div className="badge">🔥 Most Popular</div>
              <h2>💼 Pro</h2>
              <p className="price pro">€20<span>/month</span></p>
              <ul>
                <li>🤖 24/7 AI chatbot support</li>
                <li>💬 Unlimited conversations</li>
                <li>📅 Booking system</li>
                <li>📈 Real-time chat analytics</li>
                <li>🎛️ Customizable response tone</li>
                <li>🔍 Conversation search & history</li>
                <li>🏷️ Add business name and context</li>
                <li>📁 Upload file-based FAQs or business info</li>
                <li></li>
                <li></li>
              </ul>
              <Link to={"/sign-up"}><button>Start Now</button></Link>
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
