import React, { useEffect, useState } from "react";
import { Calendar } from "react-calendar";
import "../styling/Calendar.css";
import { FaChevronUp, FaChevronDown, FaTrash } from "react-icons/fa";
import axios from "axios";
import directory from "../directory.js";
import { ToastContainer, toast } from "react-toastify";
import { format } from "date-fns";
import { Link } from "react-router-dom"
export default function BookingSettings() {
  const [user, setUser] = useState(null);
  const [bookingEnabled, setBookingEnabled] = useState(false);
  const [settings, setSettings] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [integration, setIntegration] = useState(false);
  const [staffList, setStaffList] = useState([
    { name: "", description: "", unavailableServices: [], saved: false, image: null },
  ]);
  const [selectedTimezone, setSelectedTimezone] = useState("UTC");
  const [blockingDay, setBlockingDay] = useState(null);
  const [showStaff, setShowStaff] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [inteCode, setInteCode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [membership, setMembership] = useState(false)
  const [serviceList, setServiceList] = useState([
    { name: "", description: "", price: "", duration: "", image: null, saved: false },
  ]);
  const [daysOff, setDaysOff] = useState([]);
  const [pendingDaysOff, setPendingDaysOff] = useState([]);
  const [workingHours, setWorkingHours] = useState({
    Monday: { enabled: true, times: ["00:00", "17:00"], blocked: [] },
    Tuesday: { enabled: true, times: ["09:00", "17:00"], blocked: [] },
    Wednesday: { enabled: true, times: ["09:00", "17:00"], blocked: [] },
    Thursday: { enabled: true, times: ["09:00", "17:00"], blocked: [] },
    Friday: { enabled: true, times: ["09:00", "17:00"], blocked: [] },
    Saturday: { enabled: false, times: ["", ""], blocked: [] },
    Sunday: { enabled: false, times: ["", ""], blocked: [] },
  });
  const codeSnippets = [
    {
      proTip: "Add this just before the closing </body> tag of your HTML file for best performance.",
      Html: `
      <style> /* Add in <head> */
        :root {
          --primary-color: #4CAF50;
          --secondary-color: #FF5722;
          --font-color: #fff;
          --today-calendar: #ff56225d;
          --note-color: #fff;
        }
      </style>
      <div id="calendar-widget"></div> <!-- Add inside <body> where you want the booking box to be -->
      <script src="http://botassistai.com/client-calendar-widget.js" api-key="afc350ed-a50b-4ee0-9586-d9a70f6b19e5"></script> <!-- Before </body> -->
      `
    },
    {
      proTip: "Create a new file for this.",
React: `
import { useEffect } from "react";

const BookingCalendar = () => {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = \`
      :root {
        --primary-color: #4CAF50;
        --secondary-color: #FF5722;
        --font-color: #fff;
        --today-calendar: #ff56225d;
        --note-color: #fff;
      }
    \`;
    document.head.appendChild(style);

    const script = document.createElement("script");
    script.src = "http://botassistai.com/client-calendar-widget.js";
    script.setAttribute("api-key", "afc350ed-a50b-4ee0-9586-d9a70f6b19e5");
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div id="calendar-widget" />
   
  );
};

export default BookingCalendar;

// ✅ How to use:
// 1. Import the component where needed:
//    import BookingCalendar from "./BookingCalendar";
// 2. Add <BookingCalendar /> anywhere in your JSX to show the booking widget there.
`

    },
    {
      proTip: "Use this in a component or main layout file (e.g., App.vue).",
Vue: `
<template>
  <div id="calendar-widget"></div> <!-- 👈 This is where the booking box will appear. Move this wherever you want. -->
</template>

<script setup>
import { onMounted } from 'vue'; // 👈 Import at top

onMounted(() => {
  const style = document.createElement('style'); // 👈 Inject global styles
  style.innerHTML = \`
    :root {
      --primary-color: #4CAF50;
      --secondary-color: #FF5722;
      --font-color: #fff;
      --today-calendar: #ff56225d;
      --note-color: #fff;
    }
  \`;
  document.head.appendChild(style);

  const script = document.createElement('script'); // 👈 Load calendar script
  script.src = "http://botassistai.com/client-calendar-widget.js";
  script.setAttribute("api-key", "afc350ed-a50b-4ee0-9586-d9a70f6b19e5");
  script.async = true;
  document.body.appendChild(script);
});
</script>

<!-- ✅ How to use:
1. Save this component (e.g., BookingCalendar.vue)
2. Import and use it wherever needed:
   <BookingCalendar /> in your layout or page
-->
`

    },
    {
      proTip: "Use this in a Django or Flask HTML template.",
      Python: `
      <style> <!-- In <head> -->
        :root {
          --primary-color: #4CAF50;
          --secondary-color: #FF5722;
          --font-color: #fff;
          --today-calendar: #ff56225d;
          --note-color: #fff;
        }
      </style>
      <div id="calendar-widget"></div> <!-- Add inside <body> where you want the booking box to appear -->
      <script src="http://botassistai.com/client-calendar-widget.js" api-key="afc350ed-a50b-4ee0-9586-d9a70f6b19e5"></script> <!-- Before </body> -->
      `
    },
    {
      proTip: "For JSP or Thymeleaf: add this to a layout or page template.",
      Java: `
      <style> <!-- In <head> -->
        :root {
          --primary-color: #4CAF50;
          --secondary-color: #FF5722;
          --font-color: #fff;
          --today-calendar: #ff56225d;
          --note-color: #fff;
        }
      </style>
      <div id="calendar-widget"></div> <!-- Add inside <body> where you want the booking box to be -->
      <script src="http://botassistai.com/client-calendar-widget.js" api-key="afc350ed-a50b-4ee0-9586-d9a70f6b19e5"></script> <!-- Before </body> -->
      `
    },
    {
      proTip: "Add this in your footer.php or using a plugin like 'Insert Headers and Footers'.",
      Php: `
      <?php echo ' 
  <style> <!-- Place this inside the <head> tag -->
    :root {
      --primary-color: #4CAF50;
      --secondary-color: #FF5722;
      --font-color: #fff;
      --today-calendar: #ff56225d;
      --note-color: #fff;
    }
  </style>

  <div id="calendar-widget"></div> <!-- Place this inside <body> where you want the booking calendar to appear -->

  <script src="http://botassistai.com/client-calendar-widget.js" api-key="afc350ed-a50b-4ee0-9586-d9a70f6b19e5"></script> <!-- Add just before </body> -->
'; ?>

<!-- ✅ How to use:
1. If using WordPress, paste this code inside your footer.php file or use a plugin like "Insert Headers and Footers".
2. Move the <div id="calendar-widget"></div> to wherever you'd like the booking widget to appear on your page.
-->
      `
    },
    {
      proTip: "Add this to pages/_app.js or a main layout to include the widget across your app.",
      NextJs: `
     import { useEffect } from "react"; // At top

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const style = document.createElement("style"); // Inject styles
    style.innerHTML = \`
      :root {
        --primary-color: #4CAF50;
        --secondary-color: #FF5722;
        --font-color: #fff;
        --today-calendar: #ff56225d;
        --note-color: #fff;
      }
    \`;
    document.head.appendChild(style);

    const script = document.createElement("script"); // Inject booking widget
    script.src = "http://botassistai.com/client-calendar-widget.js";
    script.setAttribute("api-key", "afc350ed-a50b-4ee0-9586-d9a70f6b19e5");
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <Component {...pageProps} />; // Render page
}

export default MyApp; // Export app

// ✅ How to use:
// 1. Place a <div id="calendar-widget" /> in any page or component where you want the booking calendar to show up.
//    Example: return <div><div id="calendar-widget" /></div>
`
    },
    {
      proTip: "Add this to your theme.liquid right before the closing </body> tag.",
      Shopify: `
      <!-- 🛠️ Add this inside your theme.liquid file -->
      
      <!-- In the <head> section -->
      <style>
        :root {
          --primary-color: #4CAF50;
          --secondary-color: #FF5722;
          --font-color: #fff;
          --today-calendar: #ff56225d;
          --note-color: #fff;
        }
      </style>
      
      <!-- Inside the <body> where you want the booking calendar to appear -->
      <div id="calendar-widget"></div>
      
      <!-- Just before the closing </body> tag -->
      <script src="http://botassistai.com/client-calendar-widget.js" api-key="afc350ed-a50b-4ee0-9586-d9a70f6b19e5"></script>
      
      <!-- ✅ How to use:
      1. Go to Online Store > Themes > Edit Code.
      2. Open layout/theme.liquid.
      3. Paste the <style> in the <head> section.
      4. Place <div id="calendar-widget"></div> wherever you want the calendar to show.
      5. Paste the <script> tag right before </body>.
      -->
      `
    }
  ];
  
  
  
  const [selectedLanguage, setSelectedLanguage] = useState("Html");
const [selectedSnippet, setSelectedSnippet] = useState("");


const integrationSnippets = codeSnippets.map((snippet) => {
  const language = Object.keys(snippet).find(key => key !== "proTip");
  return {
    name: language,
    code: snippet[language],
  };
});
const selectedProTip = codeSnippets.find(
  (snippet) => Object.keys(snippet).includes(selectedLanguage)
)?.proTip;


  const [appointments, setAppointments] = useState({
    "2025-04-20": [
      {
        time: "10:00",
        name: "John Doe",
        email: "john@example.com",
        phone: "123-456-7890",
      },
      {
        time: "14:00",
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "987-654-3210",
      },
    ],
    // Add more as needed
  });
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${directory}/auth-check`, {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

    // FETCH MEMBERSHIP
    useEffect(() => {
      const fetchMembership = async () => {
        if (!user) return
        try{
          const response = await axios.get(`${directory}/get-membership`, {
            params: { userId: user?.user_id}
          })
          if(response.data.message.subscription_plan === "Pro") {
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
  
  const showNotification = (m) => {
    const newToastId = `unique-toast-id-${Date.now()}`; // Ensure a unique ID for each toast
    
    if (!toast.isActive(newToastId)) {
      toast.success(m, {
        toastId: newToastId, // Use unique toastId
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };
  
  const handleHourChange = (day, index, value) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        times: [
          index === 0 ? value : prev[day].times[0],
          index === 1 ? value : prev[day].times[1],
        ],
      },
    }));
  };
  const handleAddBlockedTime = (day) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        blocked: [...(prev[day]?.blocked || []), { start: "", end: "" }],
      },
    }));
  };
  
  const handleBlockedTimeChange = (day, index, field, value) => {
    const updatedBlocked = (workingHours[day].blocked || []).map((range, idx) => {
      if (idx === index) {
        return {
          ...range,
          [field]: value,
        };
      }
      return range;
    });
  
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        blocked: updatedBlocked,
      },
    }));
  };
  
  const handleAddDayOffInput = () => {
    setPendingDaysOff((prev) => [...prev, ""]);
  };
  
  const handlePendingDayOffSelect = (index, value) => {
    if (!value) return; 
  
    if (!daysOff.includes(value)) {
      setDaysOff((prev) => [...prev, value]);
    }
   
    setPendingDaysOff((prev) => prev.filter((_, idx) => idx !== index));
  };
  
  const handleRemoveDayOff = async (index) => {
    const dateToRemove = daysOff[index];
    if(!user) return
      try {
        await axios.get(`${directory}/remove-dayOff`, {
          params: { userId: user.user_id, dateToRemove}
        })
        showNotification("Sucessfully deleted dayOff")
        getWorkingHours()
      } catch (e) {
        console.log("An error occured deleting a day off", e);
        showErrorNotification()
      
    }
  };
  
  const handleRemoveBlockedTime = async (day, index) => {
    const time = workingHours[day].blocked[index];
    if (!user) return;
  
    try {
      // Using POST instead of GET
      await axios.post(`${directory}/remove-blocked-time`, {
        userId: user.user_id,
        time: time, // Send time as an object
      });
  
      showNotification("Successfully deleted blocked time");
  
      // Update the state locally after the successful deletion
      const updated = workingHours[day].blocked.filter((_, i) => i !== index);
      setWorkingHours((prev) => ({
        ...prev,
        [day]: { ...prev[day], blocked: updated },
      }));
    } catch (e) {
      console.log("Error occurred with deleting the blocked time", e);
      showErrorNotification();
    }
  };
   
  const formatDate = (date) => {
    return date.toLocaleDateString("en-CA"); // format: YYYY-MM-DD
  };


  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedSnippet).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };
  useEffect(() => {
    const defaultSnippet = integrationSnippets.find(s => s.name === "Html");
    if (defaultSnippet) {
      setSelectedSnippet(defaultSnippet.code);
    }
  }, []);

  const handleSnippetChange = (e) => {
    const selected = e.target.value;
    setSelectedLanguage(selected);
  
    const match = integrationSnippets.find(s => s.name === selected);
    setSelectedSnippet(match?.code || "");
  };


  const saveServices = async () => {
    if (!user) return;
  
    const formData = new FormData();
    formData.append("userId", user.user_id);
  
    serviceList.forEach((service, index) => {
      formData.append(`services[${index}][name]`, service.name || "");
      formData.append(`services[${index}][description]`, service.description || "");
      formData.append(`services[${index}][price]`, service.price || "");
      formData.append(`services[${index}][duration]`, service.duration || "");
      if (service.image instanceof File) {
        formData.append(`services[${index}][image]`, service.image);
      }
    });

    // Log FormData contents manually
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }

    try {
      await axios.post(`${directory}/save-services`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      showNotification("Successfully saved services");
      fetchServices();
    } catch (e) {
      console.log("Error saving services:", e);
      showErrorNotification();
    }
};

  const fetchServices = async () => {
    if (!user) return;
    try {
      const data = await axios.get(`${directory}/get-services`, {
        params: { userId: user.user_id },
      });
      setServiceList(data.data.rows);
    } catch (e) {
      console.log("Error fetching services data", e);
      showErrorNotification();
    }
  };
  useEffect(() => {
    fetchServices();
  }, [user]);

  const deleteService = async (name) => {
    if (!user) return;
    try {
      await axios.get(`${directory}/delete-service`, {
        params: { userId: user.user_id, name: name },
      });
      showNotification("Deleting service sucessful!");
      fetchServices();
    } catch (e) {
      console.log("Error deleting the service", e);
      showErrorNotification();
    }
  };

  const saveStaff = async () => {
    if (!user || !Array.isArray(staffList)) return;
  
    const formData = new FormData();
    formData.append("userId", user.user_id);
  
    staffList.forEach((staff, index) => {
      formData.append(`staff[${index}][name]`, staff.name || "");
      formData.append(`staff[${index}][description]`, staff.description || "");
  
      // Serialize unavailableServices as JSON string
      formData.append(
        `staff[${index}][unavailableServices]`,
        JSON.stringify(staff.unavailableServices || [])
      );
  
      // Handle image
      if (staff.image instanceof File) {
        formData.append(`staff[${index}][image]`, staff.image);
      }
    });
  
    // Log FormData content for debugging
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
  
    try {
      await axios.post(`${directory}/save-staff`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      showNotification("Successfully saved staff");
      fetchStaff();
    } catch (e) {
      console.log("An error has occurred with saving the staff", e);
      showErrorNotification();
    }
  };
  
  const fetchStaff = async () => {
    if (!user) return;

    try {
      const res = await axios.get(`${directory}/get-staff`, {
        params: { userId: user.user_id },
      });

      const transformed = res.data.staff.map((staff) => ({
        ...staff,
        unavailableServices: staff.no_service
          ? staff.no_service.split(",").map((s) => s.trim())
          : [],
      }));

      setStaffList(transformed);
    } catch (e) {
      console.log("Error fetching the staff occurred", e);
      showErrorNotification();
    }
  };
  useEffect(() => {
    fetchStaff();  
  }, [user]);
  const getBookingActive = async () => {
      if(!user) return
      try {
       const res = await axios.get(`${directory}/booking-enable`, {
          params: { userId: user.user_id}
        })
        if (res.data.booking === 0) {
          setBookingEnabled(false)
        } else {
        setBookingEnabled(true)
        }
      } catch(e) {
        console.log("An error occured fetching the if booking is enabled", e)
        showErrorNotification()
      }
    } 
  useEffect(() => {
  
    getBookingActive()
  }, [user])

  const handleToggleBooking = async () => {
    if (!user) return;
    
    const newBookingStatus = !bookingEnabled;
    setBookingEnabled(newBookingStatus);
  
    try {
      await axios.get(`${directory}/set-booking`, {
        params: { userId: user.user_id, booking: newBookingStatus ? 1 : 0 }
      });
      getBookingActive(); 
    } catch (e) {
      console.log("An error occurred enabling booking", e);
      showErrorNotification();
    }
  };

  const deleteStaff = async (name) => {
    if(!user) return
   try {
    await axios.get(`${directory}/delete-staff`, {
      params: { userId: user.user_id, name: name}
    })
    showNotification(`Sucessfully deleted ${name}`)
    fetchStaff()
   } catch(e) {
    console.log("An error occured with deleting staff", e)
    showErrorNotification()
   }
  } 

  const startTimes = Object.fromEntries(
    Object.entries(workingHours).map(([day, value]) => [day.toLowerCase() + "_start", value.times[0] || null])
  );
  const endTimes = Object.fromEntries(
    Object.entries(workingHours).map(([day, value]) => [
      day.toLowerCase() + "_end", 
      value.times[1] || null
    ])
  );

  
  const saveWorkingHours = async () => {
    if(!user) return
    const blockedTimeEntries = [];

for (const [day, { blocked }] of Object.entries(workingHours)) {
  if (Array.isArray(blocked) && blocked.length > 0) {
    blocked.forEach(({ start, end }) => {
      blockedTimeEntries.push({ day, start, end });
    });
    
  }
}
    try {
      await axios.post(`${directory}/save-working-hours`, { 
        userId: user.user_id, 
        blockedTimeEntries,
        startTimes, 
        endTimes,
        data: workingHours,
        timeZone: selectedTimezone,
        daysOff: daysOff
      }, { withCredentials: true})
      showNotification("Saved working hours")
    } catch(e) {
      console.log("Error saving the working hours", e);
      showErrorNotification()
    }
  }

  const getWorkingHours = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${directory}/get-working-hours`, {
        params: { userId: user.user_id }
      });
  
      const raw = res.data.hours;
      if (!raw) {
        console.warn("No working hours found for user yet.");
        return;
      }

  setSelectedTimezone(raw.timezone)
  setDaysOff(raw.daysOff)
      const formatted = {
        Monday: {
          enabled: !!raw.monday_enabled,
          times: [raw.monday_start.slice(0, 5), raw.monday_end.slice(0, 5)],
          blocked: (raw.blocked_times || []).filter(b => b.day === "Monday")
        },
        Tuesday: {
          enabled: !!raw.tuesday_enabled,
          times: [raw.tuesday_start.slice(0, 5), raw.tuesday_end.slice(0, 5)],
          blocked: (raw.blocked_times || []).filter(b => b.day === "Tuesday")
        },
        Wednesday: {
          enabled: !!raw.wednesday_enabled,
          times: [raw.wednesday_start.slice(0, 5), raw.wednesday_end.slice(0, 5)],
          blocked: (raw.blocked_times || []).filter(b => b.day === "Wednesday")
        },
        Thursday: {
          enabled: !!raw.thursday_enabled,
          times: [raw.thursday_start.slice(0, 5), raw.thursday_end.slice(0, 5)],
          blocked: (raw.blocked_times || []).filter(b => b.day === "Thursday")
        },
        Friday: {
          enabled: !!raw.friday_enabled,
          times: [raw.friday_start.slice(0, 5), raw.friday_end.slice(0, 5)],
          blocked: (raw.blocked_times || []).filter(b => b.day === "Friday")
        },
        Saturday: {
          enabled: !!raw.saturday_enabled,
          times: [raw.saturday_start?.slice(0, 5) || "", raw.saturday_end?.slice(0, 5) || ""],
          blocked: (raw.blocked_times || []).filter(b => b.day === "Saturday")
        },
        Sunday: {
          enabled: !!raw.sunday_enabled,
          times: [raw.sunday_start?.slice(0, 5) || "", raw.sunday_end?.slice(0, 5) || ""],
          blocked: (raw.blocked_times || []).filter(b => b.day === "Sunday")
        },
      };
  
      setWorkingHours(formatted);
    } catch (e) {
      console.log("Error occured fetching the working hours", e);
      showErrorNotification();
    }
  };
  
  useEffect(() => {
    getWorkingHours()
  }, [user])

  function groupAppointmentsByDate(appointmentsArray) {
    const grouped = {};
  
    appointmentsArray.forEach((appt) => {
      const formattedDate = format(new Date(appt.appointment_date), "yyyy-MM-dd");
  
      if (!grouped[formattedDate]) {
        grouped[formattedDate] = [];
      }
      grouped[formattedDate].push(appt);
    });
  
    return grouped;
  }

  const getAppointments = async () => {
    if(!user) return;
    try {
      const res = await axios.get(`${directory}/get-appointments`, {
        params: { userId: user.user_id }
      })
      const data = res.data.appointments
      const grouped = groupAppointmentsByDate(data); 
  setAppointments(grouped);
    } catch(e) {
      console.log("Error occured fetching the appointments", e)
      showErrorNotification()
    }
  }

  useEffect(() => {
    getAppointments()

    const timer = setInterval(getAppointments, 5000);

    return () => clearInterval(timer)
  }, [user])

  const handleBlockTime = (day) => {
    setBlockingDay((prev) => (prev === day ? null : day));
  };
  
  const ConfirmActionToast = ({
    closeToast,
    onConfirm,
    reason = "Are you sure?",
  }) => {
    if (typeof closeToast !== "function") {
      console.log('closeToast is not a function or is undefined');
      return null; // Prevent rendering if closeToast is missing or invalid
    }
  
    return (
      <div>
        <p>⚠️ {reason}</p>
        <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
          <button
            onClick={() => {
              onConfirm();
              try {
                // Safely close the toast after confirmation
                if (typeof closeToast === "function") {
                  closeToast(); // Close the toast immediately after confirmation
                }
              } catch (error) {
                console.log('Error closing toast:', error);
              }
            }}
            style={{
              padding: "9px 18px",
              backgroundColor: "#d9534f",
              border: "none",
              fontWeight: 700,
              color: "white",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Yes
          </button>
          <button
            onClick={() => {
              try {
                // Safely close the toast without confirmation
                if (typeof closeToast === "function") {
                  closeToast(); 
                }
              } catch (error) {
                console.log('Error closing toast:', error);
              }
            }}
            style={{
              padding: "9px 18px",
              fontWeight: 700,
              backgroundColor: "#6c757d",
              border: "none",
              color: "white",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };
  
  const showConfirmToast = (onConfirm, reason = "Are you sure?") => {
    toast.info(
      ({ closeToast }) => {
        if (typeof closeToast !== "function") {
          return null; 
        }
  
        return (
          <ConfirmActionToast
            closeToast={closeToast}
            onConfirm={onConfirm}
            reason={reason}
          />
        );
      },
      {
        position: "top-center",
        autoClose: false, // Disable automatic closing
        closeOnClick: false, // Prevent close on click
        closeButton: false, // Disable close button
        draggable: false, // Disable drag
        toastId: "confirm-toast", // Ensure unique ID to avoid clashes
      }
    );
  };
  

  const handleStaffChange = (event) => {
    setSelectedStaff(event.target.value);
  };

  const filteredAppointments = appointments[formatDate(selectedDate)]?.filter(
    (appt) => selectedStaff === "" || appt.staff_name === selectedStaff
  ) || [];

  const convertToDate = (time) => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const date = new Date(formatDate(selectedDate)); 
    date.setHours(hours, minutes, seconds); 
    return date;
  };

  const sortedAppointments = filteredAppointments.sort((a, b) => {
    const timeA = convertToDate(a.start_time);
    const timeB = convertToDate(b.start_time);
    return timeA - timeB;
  });

  const completeAppt = async (email, startTime, staffName, date) => {
    if(!user) return;
    try {
      await axios.post(`${directory}/complete-appointment`, 
        {
          userId: user.user_id, email, startTime, staffName, date
        }, { withCredentials: true}
      )
      showNotification("Sucessfully completed appointment")
      getAppointments()
    } catch(e) {
      console.log("Error occured while trying to complete the appointment")
      showErrorNotification()
    }
  }


  return (
    <div className={`booking-settings-container`} style={{opacity: membership ? 1 : 0.5}}>
      <div className="booking-heading">
        <h2>📅 Booking Management</h2>
        <button style={{ display: membership ? "block" : "none"}} onClick={handleToggleBooking}>
  {bookingEnabled ? "Disable Booking" : "Enable Booking"}
</button>
<Link to={`/${user?.username}/upgrade-plan`} style={{textDecoration: "none"}}>
<button style={{display: membership ? "none" : "block"}}>
  Upgrade To Bookings
</button>
</Link>


      </div>

      {bookingEnabled && (
        <>
          <div>
            <h3 onClick={() => setSettings(!settings)} className="workingHours">
              🕒 Set Working Hours{" "}
              {settings ? (
                <FaChevronUp className="swh" />
              ) : (
                <FaChevronDown className="swh" />
              )}
            </h3>
            {settings && (
  <div className="working-hours-container">
    {/* Timezone Selector */}
    <div className="timezoneDiv">
      <label>
        <h3>Select Your Timezone</h3>
        <select
          value={selectedTimezone}
          onChange={(e) => setSelectedTimezone(e.target.value)}
          className="timezone-select"
        >
          {Intl.supportedValuesOf('timeZone').map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </label>
    </div>

    {/* Working Hours Section */}
    {Object.entries(workingHours).map(([day, { enabled, times, blocked }]) => (
      <div key={day} className="working-hour-day">
        <label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={() =>
              setWorkingHours((prev) => ({
                ...prev,
                [day]: {
                  ...prev[day],
                  enabled: !prev[day].enabled,
                },
              }))
            }
            style={{ marginRight: "10px" }}
          />
          {day}
        </label>

        {enabled && (
          <div className="working-hour-inputs">
            <div className="inputs">
              <span>
                <h3>Start Time</h3>
                <input
                  type="time"
                  value={times[0]}
                  onChange={(e) =>
                    handleHourChange(day, 0, e.target.value)
                  }
                  className="time-input"
                />
              </span>
              <span>
                <h3>End Time</h3>
                <input
                  type="time"
                  value={times[1]}
                  onChange={(e) =>
                    handleHourChange(day, 1, e.target.value)
                  }
                  className="time-input"
                />
              </span>
            </div>

            {/* Blocked Time Inputs */}
            {blockingDay === day && (
              <div className="blocked-time-section">
                <h4>Blocked Time Ranges</h4>
                {blocked.map((range, idx) => (
                  <div className="blockedInputs" key={idx}>
                    <input
                      type="time"
                      value={range.start}
                      onChange={(e) =>
                        handleBlockedTimeChange(day, idx, "start", e.target.value)
                      }
                    />
                    <input
                      type="time"
                      value={range.end}
                      onChange={(e) =>
                        handleBlockedTimeChange(day, idx, "end", e.target.value)
                      }
                    />
                    <button onClick={() => handleRemoveBlockedTime(day, idx)}>✖</button>
                  </div>
                ))}
                <button onClick={() => handleAddBlockedTime(day)}>
                  ➕ Add Blocked Time
                </button>
              </div>
            )}

            <button
              onClick={() => handleBlockTime(day)}
              className="blockTimeBtn"
            >
              ⛔ {blockingDay === day ? "Cancel Blocking" : "Block Specific Times"}
            </button>
          </div>
        )}
      </div>
    ))}



<div className="days-off-container">
  <h3>Set Days Off</h3>

  {/* Always show Add Day Off button */}
  <button onClick={handleAddDayOffInput} className="add-day-off-btn">
    ➕ Add Day Off
  </button>

  {/* Show all pending date inputs */}
  {pendingDaysOff.map((_, idx) => (
    <div key={`pending-${idx}`} style={{ marginTop: "10px" }}>
      <input
        type="date"
        onChange={(e) => handlePendingDayOffSelect(idx, e.target.value)}
        className="day-off-input"
      />
    </div>
  ))}

  <div className="days-off-list" style={{ marginTop: "15px" }}>
    {daysOff.length > 0 ? (
      daysOff.map((day, idx) => (
        <div key={`confirmed-${idx}`} className="day-off-item" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>{day}</span>
          <button
            onClick={() => handleRemoveDayOff(idx)}
            style={{ background: "red", color: "white", border: "none", borderRadius: "4px", padding: "2px 6px" }}
          >
            ✖
          </button>
        </div>
      ))
    ) : (
      <p>No days off set yet.</p>
    )}
  </div>
</div>



    <button className="saveAppointment" onClick={saveWorkingHours}>
      💾 Save
    </button>
  </div>
)}

          </div>

          <h3
            onClick={() => setShowCalendar(!showCalendar)}
            className="workingHours"
          >
            📌 Show Booked Appointments{" "}
            {showCalendar ? (
              <FaChevronUp className="swh" />
            ) : (
              <FaChevronDown className="swh" />
            )}
          </h3>

          {showCalendar && (
            <div className="calendar-container">
              <Calendar
                onChange={(date) => setSelectedDate(date)}
                value={selectedDate}
                className="react-calendar"
                tileContent={({ date }) => {
                  const formatted = formatDate(date);
                  const count = appointments[formatted]?.length || 0;
                  return <div className="appointment-count">{count}</div>;
                }}
              />

              {/* Show appointments for the selected day */}
              <div className="appointments-list">
      <div className="appointments-header">
        <h4 className="appointments-heading">
          📌 Appointments on {formatDate(selectedDate)}:
        </h4>

        <select className="staff-select" onChange={handleStaffChange}>
          <option value="">All Staff</option>
          {staffList.map((staff, index) => (
            <option key={index} value={staff.name}>
              {staff.name || "Unnamed Staff"}
            </option>
          ))}
        </select>
      </div>

      {sortedAppointments.length ? (
        <ul>
          {sortedAppointments.map((appt, i) => (
            <li key={i} className="appointment-entry">
              <h2>
                <span>💼 Service:</span>{" "}
                <span style={{ color: "#00F5D4", fontWeight: 600 }}>
                  {appt.service_name}
                </span>
              </h2>
              <h2>
                <span>👩‍💼 Staff:</span>{" "}
                <span style={{ color: "#00F5D4", fontWeight: 600 }}>
                  {appt.staff_name}
                </span>
              </h2>
              <p>
                <span>🕒 Time:</span>{" "}
                <span style={{ color: "#00F5D4", fontWeight: 600 }}>
                  {appt.start_time}
                </span>
              </p>
              <p>
                <span>👤 Name:</span> {appt.name}
              </p>
              <p>
                <span>📧 Email:</span> {appt.email}
              </p>
              <p>
                <span>📞 Phone:</span> {appt.phone}
              </p>
              <p>
                <span>📝 Notes:</span> {appt.notes}
              </p>
              <button className="mCompleted" onClick={() => completeAppt(appt.email, appt.start_time, appt.staff_name, formatDate(selectedDate))}>Mark as Completed</button> 
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-appointments">No appointments</p>
      )}
    </div>

            </div>
          )}

          <h3
            onClick={() => setIntegration(!integration)}
            className="workingHours"
          >
            🔧 Set Up and Integrate
            {integration ? (
              <FaChevronUp className="swh" />
            ) : (
              <FaChevronDown className="swh" />
            )}
          </h3>

          {integration && (
            <div className="integration-section">
              <div className="integration-block">
                <div
                  onClick={() => setShowServices(!showServices)}
                  className="integration-label"
                  role="button"
                  tabIndex={0} // This allows the div to be focusable
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    setShowServices(!showServices)
                  }
                >
                  🛠️ Services Offered{" "}
                  {showServices ? (
                    <FaChevronUp className="inteIcon" />
                  ) : (
                    <FaChevronDown className="inteIcon" />
                  )}
                </div>

                {showServices && (
                  <div className="list">
                    {serviceList.map((service, index) => (
                      <div key={index} style={{ marginBottom: "1.5rem" }}>
                        <input
                          type="text"
                          value={service.name}
                          readOnly={service.saved}
                          onChange={(e) => {
                            if (!service.saved) {
                              const updated = [...serviceList];
                              updated[index].name = e.target.value;
                              setServiceList(updated);
                            }
                          }}
                          placeholder="Service Name e.g. Haircut"
                          className="integration-input"
                          style={{ marginBottom: "0.5rem" }}
                          disabled={service.saved}
                        />
                        <input
                          type="text"
                          value={service.description}
                          onChange={(e) => {
                            const updated = [...serviceList];
                            updated[index].description = e.target.value;
                            setServiceList(updated);
                          }}
                          placeholder="Short Description e.g. Professional haircut with wash"
                          className="integration-input"
                          style={{ marginBottom: "0.5rem" }}
                        />
                        <input
                          type="number"
                          value={service.price}
                          onChange={(e) => {
                            const updated = [...serviceList];
                            updated[index].price = e.target.value;
                            setServiceList(updated);
                          }}
                          placeholder="Price (USD) e.g. 40"
                          className="integration-input"
                          style={{ marginBottom: "0.5rem" }}
                        />
                        <input
                          type="number"
                          value={service.duration}
                          onChange={(e) => {
                            const updated = [...serviceList];
                            updated[index].duration = e.target.value;
                            setServiceList(updated);
                          }}
                          placeholder="Duration (minutes) e.g. 30"
                          className="integration-input"
                          style={{ marginBottom: "0.5rem" }}
                        />
                        <h4 className="imgText">Enter Image</h4>
                      <input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const updated = [...serviceList];
    updated[index].image = e.target.files[0];
    setServiceList(updated);
  }}
  className="integration-input"
  placeholder="Enter image"
  style={{ marginBottom: "0.5rem" }}
/>

                        <button
                          onClick={() =>
                            showConfirmToast(() => deleteService(service.name))
                          }
                          className="removeService"
                        >
                          <FaTrash className="trash" /> Delete {service.name}
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        setServiceList([
                          ...serviceList,
                          {
                            name: "",
                            description: "",
                            price: "",
                            duration: "",
                            image: null,
                            saved: false,
                          },
                        ])
                      }
                      className="add-more-btn"
                    >
                      ➕ Add More Services
                    </button>
                    <button className="saveAppointment" onClick={saveServices}>
                      💾 Save Services
                    </button>
                  </div>
                )}
              </div>

              <div className="integration-block">
                <label
                  onClick={() => setShowStaff(!showStaff)}
                  className="integration-label"
                >
                  👤 Staff Members{" "}
                  {showStaff ? (
                    <FaChevronUp className="inteIcon" />
                  ) : (
                    <FaChevronDown className="inteIcon" />
                  )}
                </label>
                {showStaff && (
                  <div className="list">
                    {staffList.map((staff, index) => (
                      <div key={index} style={{ marginBottom: "1rem" }}>
                        {/* Staff name */}
                        <input
                          type="text"
                          value={staff.name}
                          readOnly={staff.saved}
                          onChange={(e) => {
                            const updated = [...staffList];
                            updated[index].name = e.target.value;
                            setStaffList(updated);
                          }}
                          placeholder="Name e.g. John Doe"
                          className="integration-input"
                          style={{ marginBottom: "0.5rem" }}
                        />

                        {/* Staff description */}
                        <input
                          type="text"
                          value={staff.description}
                          onChange={(e) => {
                            const updated = [...staffList];
                            updated[index].description = e.target.value;
                            setStaffList(updated);
                          }}
                          placeholder="Short description (e.g. Senior Stylist)"
                          className="integration-input"
                        />

                        {/* Staff service availability */}
                        <div className="service-availability">
                          <label>Services this staff cannot provide:</label>
                          <div>
                            {serviceList.map((service, serviceIndex) => (
                              <div
                                key={serviceIndex}
                                style={{ marginBottom: "0.5rem" }}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    staff.unavailableServices?.includes(
                                      service.name
                                    ) || false
                                  }
                                  onChange={(e) => {
                                    const updated = [...staffList];
                                    const updatedStaff = updated[index];
                                    if (e.target.checked) {
                                      updatedStaff.unavailableServices = [
                                        ...(updatedStaff.unavailableServices ||
                                          []),
                                        service.name, // ✅ use name instead of ID
                                      ];
                                    } else {
                                      updatedStaff.unavailableServices =
                                        updatedStaff.unavailableServices.filter(
                                          (name) => name !== service.name // ✅ filter by name
                                        );
                                    }
                                    setStaffList(updated);
                                  }}
                                />
                                <label>{service.name}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const updated = [...staffList];
    updated[index].image = e.target.files[0];
    setStaffList(updated);
  }}
  className="integration-input"
  placeholder="Enter image"
  style={{ marginBottom: "0.5rem" }}
/>
                        <button
                          onClick={() =>
                            showConfirmToast(() => deleteStaff(staff.name))
                          }
                          className="removeService"
                        >
                          <FaTrash className="trash" /> Delete {staff.name}
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() =>
                        setStaffList([
                          ...staffList,
                          {
                            name: "",
                            description: "",
                            unavailableServices: [],
                          },
                        ])
                      }
                      className="add-more-btn"
                    >
                      ➕ Add More Staff
                    </button>
                    <button
                      className="saveAppointment"
                      onClick={() => saveStaff()}
                    >
                      💾 Save Staff
                    </button>
                  </div>
                )}
              </div>

              {/* Integration Code Snippet */}
              <div className="integration-block">
      <label
        onClick={() => setInteCode(!inteCode)}
        className="integration-label"
      >
        📦 Integration Code{" "}
        {inteCode ? (
          <FaChevronUp className="inteIcon" />
        ) : (
          <FaChevronDown className="inteIcon" />
        )}
      </label>

   

      {inteCode && (
  <div>
    <select
      style={{ marginTop: "11px" }}
      className="staff-select"
      onChange={handleSnippetChange}
      value={selectedLanguage}
    >
      {integrationSnippets.map((code, index) => (
        <option key={index} value={code.name}>
          {code.name}
        </option>
      ))}
    </select>

    {selectedProTip && (
      <p className="pro-tip">💡 {selectedProTip}</p>
    )}

    <pre
      className="integration-textarea">
      {selectedSnippet}
    </pre>

    <button onClick={handleCopyCode} className="copy-code-btn">
      {copySuccess ? "✅ Copied!" : "📋 Copy Code"}
    </button>
  </div>
)}

    </div>

            </div>
          )}
        </>
      )}
      <div>
        <ToastContainer />
      </div>
    </div>
  );
}
