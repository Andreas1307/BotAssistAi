import React, {useState, useEffect, use} from "react";
import "../styling/contact.css";
import { 
  FaPlug, FaUserCheck, FaRocket
} from "react-icons/fa";
import Header from "../components/Header";
import Newsletter from "../components/newsletter";
import Footer from "../components/footer";
import Faq from "../components/faq";
import directory from '../directory';
import { fetchWithAuth } from "../utils/initShopifyAppBridge";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ToastContainer, toast } from "react-toastify";

const Contact = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true);
  const [btn, setBtn] = useState(true)
  const [suggest, setSuggest] = useState("")
  const [submited, setSubmited] = useState(false)
  const [form, setForm] = useState(false)
  const [name, setName] = useState("");
  const [email, setEmail] = useState()
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const navigate = useNavigate();
  const location = useLocation()

  let toastId;
  const showNotification = (m) => {
    if (!toast.isActive(toastId)) {
      toastId = toast.success(m, {
        toastId: "unique-notification-id", // Helps prevent duplicates
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };
  const showErrorNotification = () => {
    toast.error("Something went wrong. Please try again.", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        borderRadius: "8px",
        fontSize: "16px",
        backgroundColor: "#330000",
        color: "#fff",
      },
      progressStyle: {
        background: "#ff4d4f",
      },
    });
  };

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
      
      if (location.pathname !== "/contact") {
        navigate("/contact");
    }
  }, [user, loading, navigate, location.pathname]);
  
  if (loading) {
    return null;
  }
  
  if (user) {
    return null;
  }
  
  const handleSuggestion = async (e) => {
    e.preventDefault()
    try {
      await fetchWithAuth(`/send-suggestion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: suggest }),
      });
      setSubmited(true)
      setForm(false)
    } catch(e) {
      console.log("Error with send suggestion", e)
    }
  }
  const handleForm = async (e) => {
    e.preventDefault()
    try {
      await fetchWithAuth(`/send-form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { name, email, phone, message },
      });
      setName("")
      setEmail("")
      setPhone("");
      setMessage("")
      showNotification("Message Sent")
    } catch (e) {
      console.log("An error occured sending the form")
      showErrorNotification()
    }
  }

  return (
    <>
    <Helmet>
  <title>Contact Us - BotAssistAI – AI Support Chatbot for Websites</title>
  <meta name="description" content="Get in touch with BotAssistAI, the leading AI support chatbot for websites. We’re here to answer your questions and help you improve customer engagement." />
  <meta name="keywords" content="AI chatbot, website chatbot, customer support, contact BotAssistAI, live chat, support automation" />
  <link rel="canonical" href="https://www.botassistai.com/contact" />
</Helmet>

{!loading ? (
      user ? (
        navigate(`/${user.username}/dashboard`) || null
      ) : (
        location.pathname !== "/contact" ? (
          navigate("/contact") || null
        ) : (
    <section className="contact-page">
      <Header />
      <div className="features-hero">
        <h1>📩 Let's Connect with BotAssistAI</h1>
        <p>Got a question? Need support? Want to explore AI-powered customer service? We're here to help—let’s talk!</p>
      </div>

      <div className="contact-options">

      <ToastContainer />
      <div className="contact-card">
  <FaPlug className="contact-icon" />
  <h3>Integrate</h3>
  <p>Connect BotAssistAI with your CRM or website — we’ll help you get started fast.</p>
  <Link to={"/sign-up"}>
  <button className="chat-btn">🔌 Help Me Integrate</button>
  </Link>
</div>


<div className="contact-card">
  <FaUserCheck className="contact-icon" />
  <h3>Talk to a Human</h3>
  <p>Our team is here if the bot can’t handle it. We'll step in when needed — fast.</p>
  <a href="mailto:support@botassistai.com">📧 info@botassistai.com</a>
</div>

<div className="contact-card">
  <FaRocket className="contact-icon" />
  <h3>Feature Request</h3>
  <p>Got ideas or missing something? Let us know what you want to see next.</p>
  {btn && ( <button onClick={() =>( setBtn(false), setForm(true))} className="ticket-btn">✨ Suggest a Feature</button>)}
 {form && (
  <form onSubmit={handleSuggestion}>
    <textarea
    placeholder="Tell us what feature you'd love to see..."
    value={suggest}
    onChange={(e) => setSuggest(e.target.value)}
    required
    className="suggestInput"
    ></textarea>
    <button className="suggestBtn" type="submit">Submit</button>
  </form>
 )}
 {submited && (
   <p className="confirmation-msg" style={{marginTop: "10px"}}>✅ Thanks! Your suggestion has been received.</p>
 )}
</div>

</div>



     
      <div className="contact-form-container">
        <div>
          <h3>📨 Send Us a Message</h3>
        <p>Reach out directly by filling out this form. We’ll get back to you ASAP!</p>
        <form onSubmit={handleForm} className="contact-form">
          <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          type="text" placeholder="Your Name" required />
          <input 
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email" placeholder="Your Email" required />
          <input 
          onChange={(e) => setPhone(e.target.value)}
          value={phone}
          type="tel" placeholder="Your Phone (Optional)" />
          <textarea 
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          placeholder="Your Message" required></textarea>
          <button type="submit">🚀 Send Message</button>
        </form>
        </div>
        <img src={`${process.env.PUBLIC_URL}/img/BigLogo.png`} />
      </div>

      

      <Faq />

      <Newsletter />
<Footer />
    </section>
)
)
) : null}

    </>
    
  );
};

export default Contact;
