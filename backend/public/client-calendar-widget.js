(function () {
  const script = document.createElement('script');
  const currentScript = document.currentScript;
  const apiKey = currentScript?.getAttribute("api-key");  
  const directory = "http://localhost:8090"
    const fontLink = document.createElement('link');
    fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Space+Grotesk:wght@300..700&display=swap";
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    const calendarCSS = document.createElement('link');
    calendarCSS.rel = 'stylesheet';
    calendarCSS.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.css';
    document.head.appendChild(calendarCSS);
  
  
    script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js';
    script.onload = () => {
      renderServiceSelector();
      addCustomStyles();
    };
    document.head.appendChild(script);
  
    const addCustomStyles = () => {
      const style = document.createElement('style');
      style.textContent = `
        body {
          overflow-x: hidden;
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
        }
.fc-scrollgrid-sync-inner {
          background-color: var(--primary-color) !important;
          }
        .fc-dayGrid-week-header {
    font-size: 18px !important;
    font-weight: bold !important;
    color: var(--primary-color) !important;
  }
  .fc-daygrid-day-frame.fc-scrollgrid-sync-inner {
    background-color: var(--secondary-color) !important;
    border-radius: 8px !important;
    padding: 0px !important;
    font-size: 14.5px;
    font-weight: 600;
    text-decoration: none !important;
    cursor: pointer;
  }
  .fc-daygrid-day-number,
  .fc .fc-col-header-cell-cushion {
    text-decoration: none;
    color: var(--font-color) !important;
  }
  .fc .fc-col-header-cell-cushion {
    padding: 4px;
  }
  .fc-day-today {
    background-color: var(--today-calendar) !important;
  }
  .overlay-calendar {
    background: #fff;
    color: #222;
  }
        .fc {
          font-family: 'Space Grotesk', sans-serif !important;
          font-size: 18px !important;
          background-color: #fff !important;
          border-radius: 12px !important;
        }
  
        .fc-toolbar-title {
          font-size: 25px !important;
          font-weight: 600 !important;
        }
          .fc-direction-ltr .fc-button-group > .fc-button:not(:first-child),
          .fc-direction-ltr .fc-button-group > .fc-button:not(:last-child),
          .fc-direction-ltr .fc-toolbar > * > :not(:first-child) {
          background: #000;
          }
          
        .selection-wrapper {
          max-width: 600px;
          margin: 40px auto;
          text-align: center;
          padding: 20px 15px;
          border: 2px solid #ddd;
          border-radius: 12px;
          background-color: var(--primary-color);
        }
  
        .selection-title {
        font-size: 30px;
          margin-bottom: 10px;
          color: var(--secondary-color);
        }
  
        .selectable-item {
          display: flex;
          align-items: center;
          background-color: var(--secondary-color); !important;
          color: #fff;
          padding: 15px 20px;
          margin: 7px 10px;
          border-radius: 13px;
          cursor: pointer;
          transition: 0.3s;
          font-size: 16px;
        }
        .selectable-item:hover {
          scale: 1.01
        }
          .selectable-item div {
          display: flex;
          flex-direction: column;
          align-items: start;
          justify-content: start;
          margin-left: 13px;
          margin-top: 8px;
          }
          .selectable-item img {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          }
          .selectable-item h2 {
          font-size: 17.5px;
          color: #f8f8f8;
          font-weight: 500;
          }
          .selectable-item h3 {
          font-size: 15px;
          font-weight: 400;
          text-decoration: underline;
          }
          .selectable-item button {
          position: relative;
          margin: 0 20px;
          margin-top: -8px;
          font-size: 15px;
          font-weight: 400;
          padding: 0;
          border: 0;
          background: transparent;
          color: #f8f8f8;
          cursor: pointer;
          }
          .selectable-item button::before {
          content: "";
          position: absolute;
          top: 42%;
          left: -20%;
          background: #f8f8f8;
          width: 3.8px;
          height: 3.8px;
          border-radius: 50%;
          }
          .selectable-item button::after {
          content: "";
          position: absolute;
          top: 42%;
          right: -22%;
          background: #f8f8f8;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          }
          .selectable-item span {
          display: flex;
          align-items: center;
          }
        #calendar-widget {
          display: none;
        }
          #staff-list {
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          gap: 17px;
          }
          .selectable-staff {
          width: 160px;
          background: var(--secondary-color);;
          border-radius: 13px;
          padding: 20px 15px;
          }
          .selectable-staff:hover {
          scale: 1.01;
          }
          .selectable-staff img {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          margin-bottom: 8px;
          }
          .selectable-staff h2 {
          font-size: 18px;
          font-weight: 500;
          color: #fff;
          }
          .selectable-staff button {
          padding: 7.5px 17px;
          width: 90%;
          border-radius: 20px;
          border: 0;
          font-weight: 500;
          font-size: 14.5px;
          color: #f8f8f8;
          background: var(--primary-color);
          margin-top: 5px;
          cursor: pointer;
          }
          .overlay-calendar {
           position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            min-height: 100%;
            height: auto;
            z-index: 100;
            border-radius: 10px;
            padding: 20px;
            border: 2px solid #dfdfdf;
          background: var(--primary-color);
          }
         .available-times {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 13px;
  margin-top: 15px;
  width: 100%;
}
  .overlay-title {
  color: var(--secondary-color); 
  }
  .closeBtn {
  background: var(--secondary-color);
  color: var(--font-color);
  }
.time-element {
  padding: 6px 0;
  color: var(--font-color);
  background: var(--secondary-color);
  font-weight: 500;
  border-radius: 13px;
  text-align: center;
  cursor: pointer;
  transition: 0.2s ease;
}

.time-element:hover {
  scale: 1.01
}
  .time-element.selected-time {
  scale: 1.01
  }
  .user-details {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  margin-top: 30px;
  gap: 15px;
  }
  .user-details input,
  .user-details textarea {
  width: 100%;
  max-width: 360px;
  padding: 10px 18px;
  border-radius: 20px;
  color: var(--font-color);
  background: var(--secondary-color);
  font-weight: 500;
  border: 0;
  font-size: 14.5px;
  height: 44px;
  }
  .user-details input {
  max-height: 44px;
  }
  .user-details textarea {
  max-height: 150px;
  min-height: 44px
  }
   .user-details input::placeholder,
  .user-details textarea::placeholder {
  color: var(--font-color);
  }
  .user-details button {
  width: 100%;
  max-width: 360px;
  padding: 10px 17px;
    border-radius: 20px;
    border: 0;
    font-weight: 500;
    font-size: 16.5px;
    color: #f8f8f8;
          background: var(--secondary-color);
    cursor: pointer;
  }
    #booking-widget {
  display: block !important;
}
  .confirmation-wrapper {
  max-width: 600px;
  margin: 30px auto;
  padding: 20px 20px 10px;
  background: var(--primary-color);
  border-radius: 13px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.confirmation-title {
  color: var(--secondary-color);
  font-size: 30px;
  font-weight: 600;
  margin-bottom: 12px;
}
.confirmation-details {
  text-align: left;
  margin-top: 2px;
  background: var(--secondary-color);
  padding: 10px 20px;
  border-radius: 15px;
  outline: 2px solid var(--secondary-color);
  border: 2px solid var(--primary-color);
  cursor: pointer;
  transition: .3s ease;
}
  .confirmation-details:hover {
  scale: 1.01;
  }

.confirmation-details p {
  margin: 9px 0;
  color: var(--font-color);
  font-weight: 400;
  font-size: 16px;
}

.confirmation-details strong {
  color: #f8f8f8;
  margin-right: 2.5px;
  font-weight: 500;
}

.confirmation-wrapper p {
  font-size: 16px;
  color: var(--font-color);
}
  .confirm-details {
  color: var(--font-color) !important;
font-size: 16.5px !important;
}
.confirm-details2 {
  color: var(--font-color) !important;
margin-top: 13px !important;
margin-bottom: 2px !important;
}
.note {
font-size: 15.8px;
margin: 0;
color: var(--note-color);
.noServiceTxt {
  color: var(--font-color);
}
}


      `;
      document.head.appendChild(style);
    };
  let services = [];
  let noService = ""
  const getServices = async () => {
    try {
        const res = await fetch(`${directory}/client-services`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ apiKey }),
          });
          const data = await res.json();
services = data.services;
noService = data.noService
    } catch (e) {
      console.log("An error has occurred with fetching user services", e);
    
    }
  }

  async function renderServiceSelector() {
    await getServices();
    const container = document.getElementById('calendar-widget');
    const serviceWrapper = document.createElement('div');
    serviceWrapper.className = 'selection-wrapper';
    serviceWrapper.id = 'service-selection';
  
    serviceWrapper.innerHTML = `
      <h2 class="selection-title">Select a service</h2>
      <div id="service-list" style="display: flex; flex-direction: column;"></div>
    `;
  
    container.parentNode.insertBefore(serviceWrapper, container);
  
    const selectService = serviceWrapper.querySelector('.selection-title');
    selectService.style.cssText = `
      font-size: 30px;
      font-weight: 550;
    `;
  
    const serviceList = serviceWrapper.querySelector('#service-list');
  
    // Check if services are empty
    if (!services || services.length === 0) {
      const noServiceTxt = document.createElement("p");
      noServiceTxt.classList.add("noServiceTxt");
      noServiceTxt.textContent = noService || "No services are currently available.";
      serviceList.appendChild(noServiceTxt);
      return; // Stop here if there are no services
    }
  
    services.forEach(service => {
      const btn = document.createElement('div');
      btn.className = 'selectable-item';
      btn.innerHTML = `
        <img src='${directory}${service.image}' alt="Service Picture" />
        <div>
          <h2>${service.name}</h2>
          <span>
            <h3>${service.duration}</h3>
            <button class="details-toggle">Details</button>
            <h3>$${service.price}</h3>
          </span>
          <p class="details-text" style="display: none; font-weight: 400; font-size: 15px;
          margin-bottom: -4px;">${service.description}</p>
        </div>
      `;
  
      const detailsButton = btn.querySelector('.details-toggle');
      const detailsText = btn.querySelector('.details-text');
  
      detailsButton.addEventListener('click', (e) => {
        e.stopPropagation();
        detailsText.style.display = detailsText.style.display === 'none' ? 'block' : 'none';
      });
  
      btn.addEventListener('click', () => {
        serviceWrapper.remove();
        renderStaffSelector(container, service.name);
      });
  
      serviceList.appendChild(btn);
    });
  }
  
  let staff = []
    const getStaff = async () => {
      try {
        const res = await fetch(`${directory}/client-staff`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ apiKey }),
        });
        const data = await res.json()
        staff = data.staff;
      } catch (e) {
        console.log("An error has occured with fetching the staff", e)
      }
    }
  async function renderStaffSelector(container, selectedService) {
  await  getStaff()
      const staffWrapper = document.createElement('div');
      staffWrapper.className = 'selection-wrapper';
      staffWrapper.id = 'staff-selection';
  
      staffWrapper.innerHTML = `
        <h2 class="selection-title">Select a staff member for ${selectedService}</h2>
        <div id="staff-list"></div>
      `;
  
      container.parentNode.insertBefore(staffWrapper, container);
  
      const staffList = staffWrapper.querySelector('#staff-list');
  
      staff.forEach((member) => {
        const noServiceList = member.no_service?.split(",").map(s => s.trim());
        console.log(noServiceList)
        const btn = document.createElement('div');
        btn.className = 'selectable-staff';
        if (noServiceList?.includes(selectedService)) {
          return
        }
        btn.innerHTML = `
         <img src="${directory}${member.image}" alt="Staff Member" />
         <h2>${member.name}</h2>
         <button>Book</button>
        `;
        btn.onclick = () => {
          staffWrapper.remove();
          container.style.display = 'block';
          initializeCalendarWidget(container, selectedService, member.name);
        };
        staffList.appendChild(btn);
      });
    }
  
    const note = document.createElement("p")
    note.classList.add("note")
    note.innerHTML += `<strong>Note:</strong> timezone is in `
const spanNote = document.createElement("span");
spanNote.classList.add("spanNote")
note.appendChild(spanNote)

    const getAvailableTimes = async (name, staffName, date) => {
      try {
        const res = await fetch(`${directory}/get-available-times`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ apiKey, serviceName: name, date, staffName })
        });
    
        const data = await res.json();
        spanNote.innerText = data.timezone
        return data.slots || [];
      } catch (e) {
        console.log("An error has occurred with fetching available times", e);
        return []; 
      }
    };
    

async function showConfirmation(details) {
  const container = document.getElementById("calendar-widget");
  container.innerHTML = ""; // Clear previous content

  const confirmationWrapper = document.createElement("div");
  confirmationWrapper.className = "confirmation-wrapper";

  confirmationWrapper.innerHTML = `
    <h2 class="confirmation-title">🎉 Booking Confirmed!</h2>
    <p class="confirm-details">Thank you, <strong>${details.name}</strong>. Your appointment has been booked successfully.</p>
    <div class="confirmation-details">
      <p><strong>Service:</strong> ${details.service}</p>
      <p><strong>Staff:</strong> ${details.staff}</p>
      <p><strong>Date:</strong> ${details.date}</p>
      <p><strong>Time:</strong> ${details.selectedTime}</p>
      <p><strong>Email:</strong> ${details.email}</p>
      <p><strong>Phone:</strong> ${details.phone}</p>
      ${details.specialRequirements ? `<p><strong>Notes:</strong> ${details.specialRequirements}</p>` : ""}
    </div>
    <p class="confirm-details2">You will receive a confirmation email shortly.</p>
  `;

  container.appendChild(confirmationWrapper);
}

const sendBookingRequest = async (bookingData) => {
  try {
    const res = await fetch(`${directory}/send-booking-request`, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify(bookingData)
    });
    showConfirmation(bookingData)
  } catch(e) {
    console.log("An error has occured with sending the booking DETAILS", e)
  }
}

    window.initializeCalendarWidget = function (element, service, staff) {
      if (!element) {
        console.error('Calendar mount element is required.');
        return;
      }
  
      element.style.maxWidth = '800px';
      element.style.width = '98%';
      element.style.margin = '15px auto';
      element.style.position = 'relative';
  
      const calendar = new FullCalendar.Calendar(element, {
        initialView: 'dayGridMonth',
        visibleRange: function (currentDate) {
          const start = currentDate.startOf('month');
          const end = start.clone().add(30, 'days');
          return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
          };
        },
        height: 'auto',
        selectable: true,
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: ''
        },
        dateClick: async function (info) {
          const overlay = document.createElement("div");
          overlay.classList.add("overlay-calendar");
          
  
          const overlayTitle = document.createElement("h2");
          overlayTitle.classList.add("overlay-title")
          overlayTitle.innerHTML = `
            Available times for <strong>${service}</strong><br>
            with <strong>${staff}</strong> on <strong>${info.dateStr}</strong>
          `;
          let availableTimes = await getAvailableTimes(service, staff, info.dateStr);
          if(availableTimes.length === 0) {
            availableTimes = [`No available times on ${info.dateStr}`]
          }
          overlayTitle.style.cssText = `
            font-size: 25px;
            font-weight: 500;
            margin-top: 0px;
          `;
          overlay.appendChild(overlayTitle);
          overlay.appendChild(note)
          const availableTimesDiv = document.createElement("div")
          availableTimesDiv.classList.add("available-times")
          overlay.appendChild(availableTimesDiv)
          let selectedTime = null;
          availableTimes.forEach(time => {
            const span = document.createElement("span")
            span.classList.add("time-element")
            span.innerText = time;
            span.addEventListener("click", () => {
                selectedTime = time;
                document.querySelectorAll(".time-element.selected-time").forEach(el => {
                    el.classList.remove("selected-time");
                  });
              
                  span.classList.add("selected-time");
              
                  selectedTime = time;
                  console.log("Selected time:", selectedTime);
                  let userDetails = document.querySelector(".user-details");
    if (!userDetails) {
      userDetails = document.createElement("form");
      userDetails.classList.add("user-details");
      overlay.appendChild(userDetails);

      const name = document.createElement("input");
      name.required = true
      name.type = "text";
      name.placeholder = "Enter Your Name";
      userDetails.appendChild(name);

      const email = document.createElement("input");
      email.required = true
      email.type = "email";
      email.placeholder = "Enter Your E-mail";
      userDetails.appendChild(email)

      const phoneInput = document.createElement("input");
      phoneInput.required = true
      phoneInput.type = "tel";
      phoneInput.placeholder = "Enter your phone number";
      userDetails.appendChild(phoneInput); 

      const specialRequirements = document.createElement("textarea")
      specialRequirements.rows = 3;
      specialRequirements.placeholder = "Enter any special requirements";
      userDetails.appendChild(specialRequirements)

      const bookBtn = document.createElement("button");
      bookBtn.classList.add("bookBtn")
      bookBtn.type = "Submit"
      bookBtn.innerText = "Book";
      
      userDetails.appendChild(bookBtn)


      userDetails.addEventListener("submit", async (e) => {
        e.preventDefault()
        const bookingData = {
          apiKey,
          service,
          staff,
          date: info.dateStr,
          selectedTime,
          name: name.value,
          email: email.value,
          phone: phoneInput.value,
          specialRequirements: specialRequirements.value
        }
        sendBookingRequest(bookingData)
      })

    }
            })
            availableTimesDiv.appendChild(span)
          })

        
        
  
          const closeBtn = document.createElement('button');
          closeBtn.classList.add("closeBtn")
          closeBtn.textContent = 'Back';
          closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            border: none;
            padding: 9px 18px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            border-radius: 13px;
          `;
          closeBtn.onclick = () => overlay.remove();
          overlay.appendChild(closeBtn);
  
          element.appendChild(overlay);
        }
      });
  
      calendar.render();
    };

    
    
  })();
  