import React, { useEffect, useState } from 'react';
import { IoSettingsOutline } from "react-icons/io5"
import { Link } from "react-router-dom"
import "../styling/BotTraining.css"
import axios from "../utils/axiosShopify.js"
import directory from '../directory';
import { ToastContainer, toast } from 'react-toastify';
import { handleBilling } from "../utils/billing";
import { fetchWithAuth } from "../utils/initShopifyAppBridge";

const SupportBotCustomization = () => {
  const [responseTone, setResponseTone] = useState('friendly');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [user, setUser] = useState(null)
  const [membership, setMembership] = useState(false)
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState({
    response_delay_ms: 500,
    escalation_threshold: 0.7,
    web_url: user?.shopify_shop_domain,
    business_context: "",
    businessName: "",
    avoid_topics: "",
    question: "",
    answer: "",
    question1: "",
    answer1: "",
    question2: "",
    answer2: "",
    question3: "",
    answer3: "",
    question4: "",
    answer4: "",
    fine_tuning_data: "",
    phoneNum: "",

    order_tracking_url: "",
returns_url: "",
shipping_policy_url: "",
support_email: "",

  });


  const showNotification = (m) => {
    toast.success(m, {
      position: "top-center",
      autoClose: 3000, 
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };
  const showErrorNotification = (m) => {
    toast.error(m ? m : "Something went wrong.Please try again.", {
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

  const [shopifyUser, setShopifyUser] = useState(false)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetchWithAuth("/auth-check"); 
        setUser(res.user);
        if(res.user.shopify_access_token) {
          setShopifyUser(true)
        } else {
          setShopifyUser(false)
        }
      } catch (error) {
        setUser(null);
        showErrorNotification()
      } 
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;
  
    setUserData((prev) => ({
      ...prev,
      web_url: prev.web_url || user.shopify_shop_domain || "",
    }));
  }, [user]);
  
  
  const activatePlan = async () => {
    await handleBilling(user.user_id);
  };

  useEffect(() => {
      if (!user?.username) return;
  
    const fetchUserData = async () => {
      try {
        const response = await fetchWithAuth("/user-training", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: user.username }),
        });
        

        const data = response.config || {};
        const mappedConfig = {
          response_delay_ms: data.response_delay_ms ?? 500,
          escalation_threshold: data.escalation_threshold ?? 0.7,
          web_url: user?.shopify_shop_domain ?? data.webUrl,
          business_context: data.business_context || "",
          businessName: data.businessName || "",
          avoid_topics: data.avoid_topics || "",
          question: data.question || "",
          answer: data.answer || "",


          
          question1: data.question1 || "",
          answer1: data.answer1 || "",

          
          question2: data.question2 || "",
          answer2: data.answer2 || "",

          
          question3: data.question3 || "",
          answer3: data.answer3 || "",

          
          question4: data.question4 || "",
          answer4: data.answer4 || "",


          fine_tuning_data: data.fine_tuning_data || "",
          phoneNum: data.phoneNum || "",
          responseTone: data.response_tone || "friendly",

          
          order_tracking_url: data.order_tracking_url || "",
          returns_url: data.returns_url || "",
          shipping_policy_url: data.shipping_policy_url || "",
          support_email: data.support_email || "",


        };
        setUserData(mappedConfig);
        setResponseTone(mappedConfig.responseTone || '');
        
      } catch (e) {
        console.log(e);
        showErrorNotification()
      }
    };
  
    fetchUserData();
  }, [user]);

  // FETCH MEMBERSHIP
  useEffect(() => {
    const fetchMembership = async () => {
      if (!user) return
      try{
        const userId = user?.user_id;
        const response = await fetchWithAuth(`/get-membership?userId=${userId}`, {
          method: "GET",
        });
        if(response.message.subscription_plan === "Pro") {
          setMembership(true)
        } else {
          setMembership(false)
        }
      } catch(e) {
        console.log("Error occured with retreiveing the membership status",e)
        showErrorNotification()
      }
    }
    fetchMembership()
  }, [user])

const setFieldValue = (field, value) => {
  setUserData((prevData) => ({
    ...prevData,
    [field]: value,
  }));
};


  const handleSaveSettings = async () => {
    const formData = new FormData();
    formData.append("file", file); // Attach file
    formData.append("responseTone", responseTone);
    formData.append("responseDelay", userData.response_delay_ms ?? 500);
    formData.append("escalationThreshold", userData.escalation_threshold ?? "");
    formData.append("businessContext", userData.business_context ?? "");
    formData.append("businessName", userData.businessName ?? "");
    formData.append("avoidTopics", userData.avoid_topics ?? "");
    formData.append("fineTuningData", userData.fine_tuning_data ?? "");
    formData.append("userName", user.username ?? "");
    formData.append("userId", user.user_id ?? "");
    formData.append("faqQuestion", userData.question ?? "");
    formData.append("faqAnswer", userData.answer ?? "");

    
    formData.append("faqQuestion1", userData.question1 ?? "");
    formData.append("faqAnswer1", userData.answer1 ?? "");

    
    formData.append("faqQuestion2", userData.question2 ?? "");
    formData.append("faqAnswer2", userData.answer2 ?? "");

    
    formData.append("faqQuestion3", userData.question3 ?? "");
    formData.append("faqAnswer3", userData.answer3 ?? "");

    
    formData.append("faqQuestion4", userData.question4 ?? "");
    formData.append("faqAnswer4", userData.answer4 ?? "");


    formData.append("webUrl", userData.web_url ?? "");
    formData.append("phoneNum", userData.phoneNum ?? "");

    formData.append("order_tracking_url", userData.order_tracking_url ?? "");
    formData.append("returns_url", userData.returns_url ?? "");
    formData.append("shipping_policy_url", userData.shipping_policy_url ?? "");
    formData.append("support_email", userData.support_email ?? "");
  
    try {
      const response = await fetchWithAuth(`/update-config`, {
        method: "POST",
        body: formData
            });
      showNotification("Settings updated successfully!");
    } catch (e) {
      showErrorNotification("Something went wrong with saving settings.")
    }
  };


  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadStatus(null); 
  };

  const handleFileUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file first.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await fetchWithAuth("/upload-file", {
        method: "POST",
        body: formData
            });
  
      setUploadStatus("File uploaded successfully!");
    } catch (error) {
      setUploadStatus("Error uploading file. Please try again.");
      console.log("Upload error:", error);
    }
  };



  return (
    <main className="support-bot-customization">
      <h2><IoSettingsOutline className='config-icon' />Customize Your Support Chatbot</h2>

      <div className='config-opt'>
      <div style={{opacity: !membership ? 0.6 : 1}}>
        <label>Response Tone:</label>
        <select 
        value={responseTone} 
        onChange={(e) => setResponseTone(e.target.value)}
        disabled= {!membership ? true : false}
        >
  <option value="" disabled>None Selected</option> 
  <option value="friendly">Friendly (recommended)</option>
  <option value="formal">Formal</option>
  <option value="professional">Professional</option>
  <option value="casual">Casual</option>
</select>
      </div>

      <div style={{opacity: !membership ? 0.6 : 1}}>
      <label>Set Response Delay (ms):</label>
      <input
        type="number"
        value={userData.response_delay_ms}
        onChange={(e) => setFieldValue("response_delay_ms", Number(e.target.value))}
        placeholder="500"
        disabled= {!membership ? true : false}
      />
    </div>

    {/* Escalation Threshold */}
    <div>
      <label>Escalation Threshold (Confidence Score):</label>
      <input
        type="number"
        min="0"
        max="1"
        step="0.1"
        value={userData.escalation_threshold}
        onChange={(e) => setFieldValue("escalation_threshold", Number(e.target.value))}
        placeholder="0.7"
      />
    </div>

    {/* Website URL */}
    <div>
      <label>Website Url:</label>
      <input
        type="text"
        value={userData.web_url || ""}
        onChange={(e) => setFieldValue("web_url", e.target.value)}
        placeholder="Enter your website URL"
      />
    </div>

    {/* Business Context */}
    <div>
      <label>Business Context (Optional):</label>
      <textarea
        value={userData.business_context || ""}
        onChange={(e) => setFieldValue("business_context", e.target.value)}
        placeholder="Provide details about your business"
      />
    </div>

    {/* Business Name */}
    <div>
      <label>Business Name:</label>
      <input
        type="text"
        value={userData.businessName || ""}
        onChange={(e) => setFieldValue("businessName", e.target.value)}
        placeholder="Enter your business name"
      />
    </div>

    {!membership ? (

shopifyUser ? (
  <div onClick={activatePlan} className='upgrade-div'>
    <span>
      Upgrade Plan For More
    </span>
  </div>
) : (
  <div className='upgrade-div'>
    <Link to={`/${user?.username}/upgrade-plan`}>
      Upgrade Plan For More
    </Link>
  </div>
)
    ) : (
      <div className='div'>
    <div>
      <label>Avoid Topics (Optional):</label>
      <textarea
        value={userData.avoid_topics || ""}
        onChange={(e) => setFieldValue("avoid_topics", e.target.value)}
        placeholder="Enter topics the bot should avoid (e.g., pricing)"
      />
    </div>
    <div>
      <label>Support phone number: (Optional)</label>
      <input
        type="text"
        value={userData.phoneNum || ""}
        onChange={(e) => setFieldValue("phoneNum", e.target.value)}
        placeholder="Enter your support num for customers needs"
      />
    </div>

    <div>
    <h3>Orders Policy</h3>

    <div>
        <label>Order Tracking:</label>
        <input
          type="text"
          value={userData.order_tracking_url || ""}
          onChange={(e) => setFieldValue("order_tracking_url", e.target.value)}
           placeholder="Enter your order tracking URL"
        />
      </div>

      <div>
        <label>Returns Url:</label>
        <input
          type="text"
          value={userData.returns_url || ""}
          onChange={(e) => setFieldValue("returns_url", e.target.value)}
          placeholder="Enter your returns policy URL"
        />
      </div>

      <div>
        <label>Shipping Policy:</label>
        <input
          type="text"
          value={userData.shipping_policy_url || ""}
          onChange={(e) => setFieldValue("shipping_policy_url", e.target.value)}
          placeholder="Enter your shipping policy URL"
        />
      </div>

      <div>
        <label>Support Email:</label>
        <input
          type="text"
          value={userData.support_email || ""}
          onChange={(e) => setFieldValue("support_email", e.target.value)}
          placeholder="Enter your support email address"
        />
      </div>


    </div>
  <div>
      <h3>Business FAQs</h3>
      <div>
        <label>Question:</label>
        <input
          type="text"
          value={userData.question || ""}
          onChange={(e) => setFieldValue("question", e.target.value)}
          placeholder="Enter a frequently asked question"
        />
      </div>
      <div>
        <label>Answer:</label>
        <textarea
          value={userData.answer || ""}
          onChange={(e) => setFieldValue("answer", e.target.value)}
          placeholder="Enter the answer"
        />
      </div>

      <div>
        <label>Question2:</label>
        <input
          type="text"
          value={userData.question1 || ""}
          onChange={(e) => setFieldValue("question1", e.target.value)}
          placeholder="Enter a frequently asked question"
        />
      </div>
      <div>
        <label>Answer2:</label>
        <textarea
          value={userData.answer1 || ""}
          onChange={(e) => setFieldValue("answer1", e.target.value)}
          placeholder="Enter the answer"
        />
      </div>



      <div>
        <label>Question3:</label>
        <input
          type="text"
          value={userData.question2 || ""}
          onChange={(e) => setFieldValue("question2", e.target.value)}
          placeholder="Enter a frequently asked question"
        />
      </div>
      <div>
        <label>Answer3:</label>
        <textarea
          value={userData.answer2 || ""}
          onChange={(e) => setFieldValue("answer2", e.target.value)}
          placeholder="Enter the answer"
        />
      </div>

      <div>
        <label>Question4:</label>
        <input
          type="text"
          value={userData.question3 || ""}
          onChange={(e) => setFieldValue("question3", e.target.value)}
          placeholder="Enter a frequently asked question"
        />
      </div>
      <div>
        <label>Answer4:</label>
        <textarea
          value={userData.answer3 || ""}
          onChange={(e) => setFieldValue("answer3", e.target.value)}
          placeholder="Enter the answer"
        />
      </div>

      <div>
        <label>Question5:</label>
        <input
          type="text"
          value={userData.question4 || ""}
          onChange={(e) => setFieldValue("question4", e.target.value)}
          placeholder="Enter a frequently asked question"
        />
      </div>
      <div>
        <label>Answer5:</label>
        <textarea
          value={userData.answer4 || ""}
          onChange={(e) => setFieldValue("answer4", e.target.value)}
          placeholder="Enter the answer"
        />
      </div>
    </div>


    
     


 





    <div>
      <label>Fine-Tuning Data (Optional):</label>
      <textarea
        value={userData.fine_tuning_data || ""}
        onChange={(e) => setFieldValue("fine_tuning_data", e.target.value)}
        placeholder="Enter fine-tuning data for your chatbot (can include business-specific terminology)"
      />
    </div>


      <div>
  <label>Upload a File with Business Information or FAQs:</label>
  <input type="file" accept=".json, .csv, .txt, .docx, .pdf" onChange={handleFileChange} />
  {file && <p>Selected File: {file.name}</p>}
  <button onClick={handleFileUpload}>Upload File</button>
  {uploadStatus && <p>{uploadStatus}</p>}
</div>
      </div>
   

  
    )}
   
      </div>

      <button className='save-btn' onClick={handleSaveSettings}>Save Settings</button>
    </main>
  );
};

export default SupportBotCustomization;
