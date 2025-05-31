
if(process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}
const directory = "https://api.botassistai.com"
const express = require("express");
const app = express()
const nodemailer = require("nodemailer")
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require("cors");
const { createPool } = require("mysql2")
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const initialisePassport = require("./passport-config")
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { OpenAI } = require('openai');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cookieParser = require("cookie-parser");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const bodyParser = require("body-parser");
const cron = require("node-cron");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const { connect } = require("http2");
const algorithm = "aes-256-cbc";
const keyString = process.env.ENCRYPTION_KEY;
const encryptionKey = Buffer.from(keyString, 'hex');
const ivLength = 16;
const axios = require('axios');
const chrono = require('chrono-node');
const pool = createPool({
host: process.env.DATABASE_HOST,
user: process.env.DATABASE_USER,
password: process.env.DATABASE_PASSWORD,
database: process.env.DATABASE
}).promise()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));




const getUserByEmail = async (email) => {
const [rows] = await pool.query("SELECT * FROM users where email = ?", [email])
return rows[0]
}

const getUserById = async (id) => {
const [rows] = await pool.query("SELECT * FROM users where user_id = ?", [id])
return rows[0]
}

initialisePassport(passport, getUserByEmail, getUserById)

const devOrigins = new Set(["localhost", "127.0.0.1", "botassistai.com", "www.botassistai.com", ]);

const dynamicCors = async (origin, callback) => {
  if (!origin) return callback(null, true); // Allow non-browser requests (like Postman, curl)

  try {
    const hostname = new URL(origin).hostname;

    if (devOrigins.has(hostname)) {
      console.log("✅ Dev CORS allowed for:", hostname);
      return callback(null, true);
    }

    const [rows] = await pool.query("SELECT domain FROM allowed_domains");
    const allowed = rows.some(
      row => hostname === row.domain || hostname.endsWith(`.${row.domain}`)
    );

    if (allowed) {
      console.log("✅ CORS allowed for:", hostname);
      return callback(null, true);
    } else {
      console.warn("❌ CORS blocked:", hostname);
      return callback(new Error("Not allowed by CORS"));
    }
  } catch (err) {
    console.error("❌ CORS check failed:", err);
    return callback(new Error("CORS internal error"));
  }
};

// Wrapper to support async CORS origin
const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;

  dynamicCors(origin, (err, allow) => {
    if (err) {
      res.status(403).send("CORS error: " + err.message);
    } else {
      cors({
        origin: origin,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })(req, res, next);
    }
  });
};

app.use(corsMiddleware);



app.use(flash());
app.use(session({ 
secret: process.env.SESSION_SECRET,
resave: false, 
saveUninitialized: false,
cookie: {
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000 
}
}))
app.use(passport.initialize());
app.use(passport.session());

// update code see if it works


app.post("/paypal/webhook", async (req, res) => {
  const { orderID, userId } = req.body;

  console.log("Received webhook request:", req.body);  // Debugging incoming request

  if (!orderID || !userId) {
    console.log("Error: Missing orderID or userId");  // Debugging missing orderID or userId
    return res.status(400).json({ error: "Missing orderID or userId" });
  }

  try {
    const auth = await axios({
      url: "https://api-m.paypal.com/v1/oauth2/token",
      method: "post",
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_SECRET,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: "grant_type=client_credentials",
    });

    const accessToken = auth.data.access_token;
    console.log("Received PayPal access token:", accessToken);  // Debugging access token

    // Step 2: Get order details
    console.log("Step 2: Fetching order details from PayPal...");

    const orderDetails = await axios.get(
      `https://api-m.paypal.com/v2/checkout/orders/${orderID}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const order = orderDetails.data;

    console.log("Received order details:", order); 

    if (order.status !== "COMPLETED") {
      console.log("Error: Payment not completed");  // Debugging payment status
      return res.status(400).json({ error: "Payment not completed" });
    }

    // Optional: Validate paid amount
    const amount = order.purchase_units?.[0]?.amount?.value;
    console.log("Paid amount from PayPal:", amount);  // Debugging paid amount
    if (amount !== "20.00") {
      console.log("Error: Incorrect payment amount");  // Debugging incorrect amount
      return res.status(400).json({ error: "Incorrect payment amount" });
    }

    const customId = order.purchase_units?.[0]?.custom_id;
    console.log("Custom ID from PayPal:", customId);  // Debugging custom ID
    if (String(customId) !== String(userId)) {
      console.log("Error: User ID mismatch in PayPal order");  // Debugging user ID mismatch
      return res.status(400).json({ error: "User ID mismatch in PayPal order" });
    }

    // Step 3: Update subscription
    const now = new Date();
    const expiry = new Date(now);
    expiry.setDate(now.getDate() + 30); // 30-day subscription
    console.log("Updating subscription for user:", userId);  // Debugging subscription update

    const [result] = await pool.query(
      `UPDATE users 
       SET subscription_plan = ?, subscribed_at = ?, subscription_expiry = ? 
       WHERE user_id = ?`,
      ["Pro", now, expiry, userId]
    );

    console.log("Database update result:", result);  // Debugging database result

    if (result.affectedRows === 0) {
      console.log("Error: User not found");  // Debugging user not found in database
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Subscription updated successfully!");  // Debugging successful update
    res.status(200).json({ message: "✅ Subscription updated successfully" });
  } catch (err) {
    console.error("❌ PayPal webhook error:", err.response?.data || err.message);  // Debugging catch block
    res.status(500).json({ error: "Server error verifying PayPal payment" });
  }
});








app.post("/create-subscription", async (req, res) => {
  try {
    const { paymentMethodId, email, userId } = req.body;

    // Create the Stripe customer
    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // Save customer ID to your database
    await pool.query("UPDATE users SET stripe_customer_id = ? WHERE user_id = ?", [
      customer.id,
      userId,
    ]);

    // Create a subscription for the user
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_PRICE_ID }],  // Ensure this is the correct price ID
      expand: ["latest_invoice.payment_intent"],
      payment_settings: {
        payment_method_types: ["card"],
      },
    });

    // Ensure payment intent was created successfully
    if (!subscription.latest_invoice.payment_intent) {
      throw new Error("Payment intent creation failed.");
    }

    res.json({
      success: true,
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
});






app.get("/payed-membership", async (req, res) => {
const { type, userId } = req.query;

if (!type || !userId) {
  return res.status(400).json({ message: "Error with credentials" });
}
const date = new Date();
const dateNow = date.toISOString().slice(0, 19).replace("T", " "); // Format to 'YYYY-MM-DD HH:MM:SS'
date.setDate(date.getDate() + 30);
const dateIn30Days = date.toISOString().slice(0, 19).replace("T", " "); // Format to 'YYYY-MM-DD HH:MM:SS'


try {
  const [result] = await pool.query(
    "UPDATE users SET subscription_plan = ?, subscribed_at = ?, subscription_expiry = ? WHERE user_id = ?",
    [type, dateNow, dateIn30Days, userId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({ message: "Membership updated" });
} catch (e) {
  console.error("Error occurred with /payed-membership:", e);
  return res.status(500).json({ message: "An error occurred" });
}
});

cron.schedule("0 0 * * *", async () => {
  try {
    console.log("🔁 Running daily subscription expiry check...");

    const [usersToDowngrade] = await pool.query(
      `SELECT user_id FROM users 
       WHERE subscription_plan != 'free' 
       AND subscription_expiry IS NOT NULL 
       AND subscription_expiry <= NOW()`
    );

    if (usersToDowngrade.length > 0) {
      for (const user of usersToDowngrade) {
        await pool.query(
          "UPDATE users SET subscription_plan = 'free' WHERE user_id = ?",
          [user.user_id]
        );
        console.log(`🔻 Downgraded user ${user.user_id} to free`);
      }
    } else {
      console.log("✅ No users to downgrade today.");
    }
  } catch (err) {
    console.error("❌ Cron job error:", err);
  }
});

app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "invoice.payment_succeeded":
      const invoice = event.data.object;
      const customerId = invoice.customer;

      // Lookup your user by Stripe customer ID and extend their access
      await pool.query(
        `UPDATE users 
         SET subscription_plan = 'pro', 
             subscribed_at = NOW(), 
             subscription_expiry = DATE_ADD(NOW(), INTERVAL 30 DAY)
         WHERE stripe_customer_id = ?`,
        [customerId]
      );

      console.log(`✅ Extended subscription for customer ${customerId}`);
      break;

    case "customer.subscription.deleted":
    case "invoice.payment_failed":
      const failedCustomer = event.data.object.customer;

      await pool.query(
        `UPDATE users 
         SET subscription_plan = 'free' 
         WHERE stripe_customer_id = ?`,
        [failedCustomer]
      );

      console.log(`⚠️ Downgraded customer ${failedCustomer} due to payment failure or cancelation.`);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.sendStatus(200);
});

app.post("/save-services", upload.any(), async (req, res) => {
  const { userId, services: rawServices } = req.body;

  // If req.body.services came in as a string (which FormData might do), parse it
  const services = Array.isArray(rawServices)
    ? rawServices
    : typeof rawServices === "string"
    ? JSON.parse(rawServices)
    : [];

  // Attach files
  for (const file of req.files) {
    const match = file.fieldname.match(/^services\[(\d+)]\[image]$/);
    if (match) {
      const index = parseInt(match[1], 10);
      if (services[index]) {
        services[index].image = `/uploads/${file.filename}`;
      }
    }
  }

  const [apiKey] = await pool.query("SELECT * FROM users WHERE user_id = ?", [userId])

  // Step 3: Process each service (insert/update in the database)
  try {
    for (const s of services) {
      console.log("Processing service:", s);

      if (!s.name?.trim()) {
        console.log("Skipping service because name is missing or empty");
        continue;
      }

      const [rows] = await pool.query(
        `SELECT id, image FROM services WHERE user_id = ? AND name = ?`,
        [userId, s.name.trim()]
      );

      if (rows.length > 0) {
        await pool.query(
          `UPDATE services SET description = ?, price = ?, duration = ?, image = ? 
           WHERE id = ? AND user_id = ?`,
          [s.description, s.price, s.duration, s.image || rows[0].image, rows[0].id, userId]
        );
      } else {
        await pool.query(
          `INSERT INTO services (user_id, name, description, price, duration, image, saved, api_key) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, s.name.trim(), s.description, s.price, s.duration, s.image || null, true, apiKey[0].api_key]
        );
      }
    }

    res.status(200).json({ message: "Successfully saved services" });
  } catch (err) {
    console.error("💥 Error:", err);
    res.status(500).json({ error: "Error saving services" });
  }
});

app.post("/client-services", async (req, res) => {
  const { apiKey } = req.body;
  console.log(apiKey)
  try {
    const [services] = await pool.query("SELECT * FROM services");
    const [users] = await pool.query("SELECT * from users")

    const user = users.find((u) => {
      if(!u.api_key) return
      try{
        return decryptApiKey(u.api_key) === apiKey
      } catch(e) {
        console.log("Error trying to get the user")
        return
      }
    })
    let matchedServices = []
    let noService = ""
if(user.booking) {
     matchedServices = services.filter(service => {
      if (!service.api_key) return false;
      try {
        return decryptApiKey(service.api_key) === apiKey;
      } catch (e) {
        console.log("Failed to decrypt API key for service ID:", service.id, e);
        return false;
      }
    });
} else {
  matchedServices = []
  noService = "It looks like online bookings are currently disabled. You can check back later or contact us directly if you'd like help scheduling an appointment."
}
    console.log("Matched services:", matchedServices);
    return res.status(200).json({ services: matchedServices, noService });
  } catch (e) {
    console.log("An error has occurred with fetching user services", e);
    return res.status(500).json({ error: "An error has occurred with fetching user services" });
  }

});

app.get("/get-services", async (req, res) => {
  const { userId } = req.query;
  try {
    const [rows] = await pool.query("SELECT * FROM services WHERE user_id = ?", [userId])
    return res.status(200).json({ rows: rows})
  } catch(e) {
    console.log("Error fetching services data", e);
    return res.status(500).json({ error: "Error fetching services data"})
  }
})            

app.get("/delete-service", async (req, res) => {
  const { userId, name } = req.query;
  try{
    await pool.query("DELETE FROM services WHERE user_id = ? AND name = ?", [userId, name]);
    return res.status(200).json({ msg: "Sucess"})
  } catch(e) {
    console.log("Error deleting the service", e);
    return res.status(500).json({ error: "Error deleting the service"})
  }
})

app.post("/save-staff", upload.any(), async (req, res) => {
  const { userId, staff: rawStaff } = req.body;

  // Handle JSON-stringified body values from FormData
  const staffList = Array.isArray(rawStaff)
    ? rawStaff
    : typeof rawStaff === "string"
    ? JSON.parse(rawStaff)
    : [];

  // Attach images from uploaded files to the correct staff member
  for (const file of req.files) {
    const match = file.fieldname.match(/^staff\[(\d+)]\[image]$/);
    if (match) {
      const index = parseInt(match[1], 10);
      if (staffList[index]) {
        staffList[index].image = `/uploads/${file.filename}`;
      }
    }
  }

  try {
    const [apiKey] = await pool.query("SELECT * FROM users WHERE user_id = ?", [userId]);

    for (const s of staffList) {
      const name = s.name?.trim();
      if (!name) continue;

      const description = s.description?.trim() || null;

      // Parse unavailableServices from JSON string
      let unavailable = s.unavailableServices;
      if (typeof unavailable === "string") {
        try {
          unavailable = JSON.parse(unavailable);
        } catch {
          unavailable = [];
        }
      }
      const noService = Array.isArray(unavailable)
        ? unavailable.join(",")
        : null;

      const [existing] = await pool.query(
        `SELECT id, image FROM staff WHERE user_id = ? AND name = ?`,
        [userId, name]
      );

      if (existing.length > 0) {
        await pool.query(
          `UPDATE staff SET description = ?, no_service = ?, image = ? WHERE id = ?`,
          [description, noService, s.image || existing[0].image, existing[0].id]
        );
      } else {
        await pool.query(
          `INSERT INTO staff (name, description, no_service, user_id, saved, api_key, image)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [name, description, noService, userId, true, apiKey[0].api_key, s.image || null]
        );
      }
    }

    return res.status(200).json({ message: "Successfully saved staff" });
  } catch (e) {
    console.log("An error has occurred with saving the staff", e);
    return res.status(500).json({ error: "An error has occurred with saving the staff" });
  }
});
function getTimeSlotsForDate(dateStr, startTimeStr, endTimeStr, durationMins) {
  const dayOfWeek = new Date(dateStr).toLocaleString("en-US", { weekday: "long" }).toLowerCase();

  const dateBase = `${dateStr}T`;

  const start = new Date(`${dateBase}${startTimeStr}:00`);
  const end = new Date(`${dateBase}${endTimeStr}:00`);

  const slots = [];
  let current = new Date(start);

  while (current < end) {
    slots.push(current.toTimeString().slice(0, 5)); // "HH:MM"
    current = new Date(current.getTime() + durationMins * 60 * 1000);
  }

  return { day: dayOfWeek, date: dateStr, slots };
}

app.post("/get-available-times", async (req, res) => {
  const { apiKey, serviceName, date, staffName } = req.body;

  try {
    const ONE_AND_HALF_MONTHS_IN_MS = 1.5 * 30 * 24 * 60 * 60 * 1000;

    const currentDate = new Date();
    const requestedDate = new Date(date);
    
    if (requestedDate > new Date(currentDate.getTime() + ONE_AND_HALF_MONTHS_IN_MS)) {
      return res.status(400).json({ error: "Cannot book or view appointments more than 1.5 months in advance." });
    }



    const [users] = await pool.query("SELECT * FROM users");
    const user = users.find(
      (user) => user.api_key && decryptApiKey(user.api_key) === apiKey
    );
    if (!user) return res.status(401).json({ error: "Invalid API key" });

    const userId = user.user_id;

    const [booking] = await pool.query("Select * from users where user_id = ?", [userId])
    if(booking[0].booking === 0) {
      return res.status(400).json({ error: "Booking table is disabled"})
    }
    const [durationResult] = await pool.query(
      "SELECT duration FROM services WHERE name = ? AND user_id = ?",
      [serviceName, userId]
    );

    const duration = durationResult[0]?.duration;
    if (!duration) return res.status(400).json({ error: "Service duration not found" });

    const [workingHoursData] = await pool.query(
      "SELECT * FROM working_hours WHERE user_id = ?",
      [userId]
    );

    const timezone = workingHoursData[0].timezone

    const workingHours = workingHoursData[0];
    if (!workingHours) return res.status(400).json({ error: "Working hours not found" });

    const daysOff = workingHours.daysOff || [];
    const isDayOff = daysOff.some((day) => day === date);
    
    if (isDayOff) {
      return res.status(400).json({ error: "Day off" });
    }


    let blockedHours = [];
    try {
      const raw = workingHours.blocked_times;

      if (Array.isArray(raw)) {
        blockedHours = raw;
      } else if (typeof raw === "string" && raw.trim() !== "") {
        blockedHours = JSON.parse(raw);
      }
    } catch (err) {
      console.error("Failed to parse blocked_times JSON:", err);
      blockedHours = [];
    }

    const weekday = new Date(date).toLocaleString("en-US", {
      weekday: "long",
    }).toLowerCase();

    const startKey = `${weekday}_start`;
    const endKey = `${weekday}_end`;
    const enabledKey = `${weekday}_enabled`;

    if (!workingHours[enabledKey]) {
      return res.status(200).json({
        available: false,
        reason: `${weekday} is not a working day.`,
        slots: []
      });
    }

    const startTime = workingHours[startKey];
    const endTime = workingHours[endKey];

    if (!startTime || !endTime) {
      return res.status(200).json({
        available: false,
        reason: `Missing start/end time for ${weekday}.`,
        slots: []
      });
    }

    const result = getTimeSlotsForDate(
      date,
      startTime.slice(0, 5),
      endTime.slice(0, 5),
      duration
    );

    const [appointmentsArr] = await pool.query(
      `SELECT a.start_time, s.duration
       FROM appointments a
       JOIN services s ON a.service_name = s.name AND a.user_id = s.user_id
       WHERE a.user_id = ? AND a.staff_name = ? AND a.appointment_date = ?`,
      [userId, staffName, date]
    );

    const dateBase = `${date}T`;

    function to24HourFormat(time) {
      if (!time || typeof time !== "string") return "00:00";
      const [hourStr, minuteStr] = time.split(":");
      let hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      if (isNaN(hour) || isNaN(minute)) return "00:00";

      // Assume input already in 24h format
      return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }

    const blockedRanges = blockedHours
      .filter((b) => b?.day?.toLowerCase() === weekday && b.start && b.end)
      .map((b) => {
        const startStr = to24HourFormat(b.start);
        const endStr = b.end === "00:00" ? "23:59" : to24HourFormat(b.end);

        const start = new Date(`${dateBase}${startStr}:00`);
        const end = new Date(`${dateBase}${endStr}:00`);

        return { start, end };
      });

    const availableSlots = result.slots.filter((slot) => {
      const slotStart = new Date(`${dateBase}${slot}`);
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);

      for (let blocked of blockedRanges) {
        if (slotStart < blocked.end && slotEnd > blocked.start) {
          console.log(`Slot ${slot} is BLOCKED`);
          return false;
        }
      }

      // Check against appointments
      for (let appt of appointmentsArr) {
        const apptStart = new Date(`${dateBase}${appt.start_time}`);
        const apptEnd = new Date(apptStart.getTime() + appt.duration * 60000);
        if (slotStart < apptEnd && slotEnd > apptStart) {
          return false;
        }
      }

      return true;
    });

    res.json({
      available: true,
      day: result.day,
      date: result.date,
      slots: availableSlots,
      timezone: timezone
    });

  } catch (e) {
    console.error("An error occurred fetching available times:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/booking-enable", async (req, res) => {
  const { userId } = req.query;
  try {
    const [user] = await pool.query("SELECT * FROM users WHERE user_id = ?", [userId])
    return res.status(200).json({ booking: user[0].booking})
  } catch(e) {
    console.log("An error occured fetching the if booking is enabled", e);
    return res.status(500).json({ err: "An error occured fetching the if booking is enabled"})
  }
})
app.get("/set-booking", async (req, res) => {
  const { userId, booking } = req.query
  try {
    await pool.query("UPDATE users SET booking = ? WHERE user_id = ?", [booking, userId])
    return res.status(200).json({ msg: "Sucess"})
  } catch (e) {
    console.log("An error occured enabling booking", e)
    return res.status(500).json({ err: "An error occured enabling booking"})
  }
})

app.post("/client-staff", async (req, res) => {
  const { apiKey } = req.body;

  try {
    const [staffs] = await pool.query("SELECT * FROM staff");

    const matchedStaff = staffs.filter((staff) => {
      if (!staff.api_key) return false;
      try {
        return decryptApiKey(staff.api_key) === apiKey;
      } catch (e) {
        console.error("Decryption failed for staff ID:", staff.id, e);
        return false;
      }
    });

    console.log("Matched staff:", matchedStaff);

    return res.status(200).json({ staff: matchedStaff });
  } catch (e) {
    console.error("An error has occurred with fetching the staff", e);
    return res.status(500).json({ error: "An error has occurred with fetching the staff" });
  }
});

app.get("/get-staff", async (req, res) => {
  const { userId } = req.query;

  try{
    const [staff] = await pool.query(`SELECT * FROM staff WHERE user_id = ?`, [userId])
    return res.status(200).json({ staff: staff})
  } catch(e) {
    console.log("Error fetching the staff occured", e)
    return res.status(500).json({ error: "Error fetching the staff occured"})
  }
})

app.get("/delete-staff", async (req, res) => {
  const { userId, name } = req.query;
  try {
    await pool.query("DELETE FROM staff WHERE user_id = ? AND name = ?", [userId, name]);
    return res.status(200).json({ msg: "Sucess"})
  } catch(e) {
    console.log("An error occured with deleting staff", e)
    return res.status(500).json({ error: "An error occured with deleting staff"})
  }
})

app.post("/save-working-hours", async (req, res) => {
  const { userId, blockedTimeEntries, startTimes, endTimes, data, timeZone, daysOff } = req.body;
  const blockedTimesJson = blockedTimeEntries ? JSON.stringify(blockedTimeEntries) : null;
  const daysOffJson = daysOff ? JSON.stringify(daysOff) : null;

  // Ensure we handle start and end times for each day, defaulting to NULL for disabled days
  const mondayStart = data.Monday.enabled ? startTimes.monday_start : null;
  const mondayEnd = data.Monday.enabled ? endTimes.monday_end : null;
  const tuesdayStart = data.Tuesday.enabled ? startTimes.tuesday_start : null;
  const tuesdayEnd = data.Tuesday.enabled ? endTimes.tuesday_end : null;
  const wednesdayStart = data.Wednesday.enabled ? startTimes.wednesday_start : null;
  const wednesdayEnd = data.Wednesday.enabled ? endTimes.wednesday_end : null;
  const thursdayStart = data.Thursday.enabled ? startTimes.thursday_start : null;
  const thursdayEnd = data.Thursday.enabled ? endTimes.thursday_end : null;
  const fridayStart = data.Friday.enabled ? startTimes.friday_start : null;
  const fridayEnd = data.Friday.enabled ? endTimes.friday_end : null;
  const saturdayStart = data.Saturday.enabled ? startTimes.saturday_start : null;
  const saturdayEnd = data.Saturday.enabled ? endTimes.saturday_end : null;
  const sundayStart = data.Sunday.enabled ? startTimes.sunday_start : null;
  const sundayEnd = data.Sunday.enabled ? endTimes.sunday_end : null;

  // Enabled status for each day (1 for enabled, 0 for disabled)
  const mondayEnabled = data.Monday.enabled ? 1 : 0;
  const tuesdayEnabled = data.Tuesday.enabled ? 1 : 0;
  const wednesdayEnabled = data.Wednesday.enabled ? 1 : 0;
  const thursdayEnabled = data.Thursday.enabled ? 1 : 0;
  const fridayEnabled = data.Friday.enabled ? 1 : 0;
  const saturdayEnabled = data.Saturday.enabled ? 1 : 0;
  const sundayEnabled = data.Sunday.enabled ? 1 : 0;

  try {
    const [existingEntry] = await pool.query("SELECT * FROM working_hours WHERE user_id = ?", [userId]);

    if (existingEntry.length > 0) {
      await pool.query(`
        UPDATE working_hours 
        SET 
          monday_start = ?, monday_end = ?, monday_enabled = ?,
          tuesday_start = ?, tuesday_end = ?, tuesday_enabled = ?,
          wednesday_start = ?, wednesday_end = ?, wednesday_enabled = ?,
          thursday_start = ?, thursday_end = ?, thursday_enabled = ?,
          friday_start = ?, friday_end = ?, friday_enabled = ?,
          saturday_start = ?, saturday_end = ?, saturday_enabled = ?,
          sunday_start = ?, sunday_end = ?, sunday_enabled = ?,
          blocked_times = ?, timezone = ?, daysOff = ?
        WHERE user_id = ?
      `, [
        mondayStart, mondayEnd, mondayEnabled,
        tuesdayStart, tuesdayEnd, tuesdayEnabled,
        wednesdayStart, wednesdayEnd, wednesdayEnabled,
        thursdayStart, thursdayEnd, thursdayEnabled,
        fridayStart, fridayEnd, fridayEnabled,
        saturdayStart, saturdayEnd, saturdayEnabled,
        sundayStart, sundayEnd, sundayEnabled,
        blockedTimesJson, timeZone, daysOffJson, userId
      ]);

      return res.status(200).json({ msg: "Working hours updated successfully" });

    } else {
      // If the user does not exist, insert a new row
      await pool.query(`
        INSERT INTO working_hours 
          (user_id, monday_start, monday_end, monday_enabled, tuesday_start, tuesday_end, tuesday_enabled, 
          wednesday_start, wednesday_end, wednesday_enabled, thursday_start, thursday_end, thursday_enabled, 
          friday_start, friday_end, friday_enabled, saturday_start, saturday_end, saturday_enabled, sunday_start, 
          sunday_end, sunday_enabled, blocked_times, timezone, daysOff)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        mondayStart, mondayEnd, mondayEnabled,
        tuesdayStart, tuesdayEnd, tuesdayEnabled,
        wednesdayStart, wednesdayEnd, wednesdayEnabled,
        thursdayStart, thursdayEnd, thursdayEnabled,
        fridayStart, fridayEnd, fridayEnabled,
        saturdayStart, saturdayEnd, saturdayEnabled,
        sundayStart, sundayEnd, sundayEnabled,
        blockedTimesJson, timeZone, daysOffJson
      ]);

      return res.status(200).json({ msg: "Working hours saved successfully" });
    }
  } catch (e) {
    console.log("Error saving or updating working hours", e);
    return res.status(500).json({ error: "Error saving or updating the working hours" });
  }
});

app.get("/get-working-hours", async (req, res) => {
  const { userId } = req.query;
  try {
    const [hours] = await pool.query("SELECT * FROM working_hours WHERE user_id = ?", [userId])
    return res.status(200).json({ hours: hours[0]})
  } catch(e) {
    console.log("Error occured fetching the working hours", e);
    return res.status(500).json({ err: "Error occured fetching the working hours"})
  }
})

app.get("/remove-dayOff", async (req, res) => {
  const { userId, dateToRemove} = req.query;
  try {
    const [result] = await pool.query("SELECT daysOff FROM working_hours WHERE user_id = ?", [userId]);

    let daysOff = result[0]?.daysOff;
    if (typeof daysOff === "string") {
      daysOff = JSON.parse(daysOff);
    }
    const updatedDaysOff = daysOff.filter((day) => day !== dateToRemove);
    
      await pool.query("UPDATE working_hours SET daysOff = ? WHERE user_id = ?", [JSON.stringify(updatedDaysOff), userId])
    
    return res.status(200).json({ msg: "Sucess"})
  } catch(e) {
    console.log("An error occured deleting a day off", e);
    return res.status(500).json({ err: "An error occured deleting a day off"})
  }
})

app.post("/remove-blocked-time", async (req, res) => {
  const { userId, time } = req.body; // time is already parsed as an object
  
  try {
    // Query the blocked_times for the user
    const [result] = await pool.query("SELECT blocked_times FROM working_hours WHERE user_id = ?", [userId]);

    let blockedTimes = result[0]?.blocked_times;
    if (typeof blockedTimes === "string") {
      blockedTimes = JSON.parse(blockedTimes); // Parse if it's stored as a string in the DB
    }

    const { start, end } = time;

    const updatedBlockedTimes = blockedTimes.filter((entry) => {
      return !(entry.start === start && entry.end === end); 
    });

    // Update the database with the new blocked times array
    await pool.query("UPDATE working_hours SET blocked_times = ? WHERE user_id = ?", [
      JSON.stringify(updatedBlockedTimes), // Store as a JSON string
      userId,
    ]);

    return res.status(200).json({ msg: "Successfully deleted blocked time" });
  } catch (e) {
    console.log("Error occurred with deleting the blocked time", e);
    return res.status(500).json({ err: "Error occurred with deleting the blocked time" });
  }
});

app.get("/get-appointments", async (req, res) => {
  const { userId } = req.query;
  try {
    const [appointments] = await pool.query("SELECT * FROM appointments WHERE user_id = ?", [userId]);

    return res.status(200).json({ appointments: appointments})
  } catch(e) {
    console.log("Error occured fetching the appointments", e)
    return res.status(500).json({ err: "Error occured fetching the appointments"})
  }
})

app.post("/complete-appointment", async (req, res) => {
  const { userId, email, startTime, staffName, date } = req.body;
  
  try {
    await pool.query(
      "DELETE FROM appointments WHERE user_id = ? AND email = ? AND start_time = ? AND staff_name = ? AND appointment_date = ?",
      [userId, email, startTime, staffName, date]
    );
    return res.status(200).json({ msg: "Sucess"})
  } catch(e) {
    console.log("Error occured while trying to complete the appointment",e)
    return res.status(500).json({ err: "Error occured while trying to complete the appointment"})
  }
})

function addMinutesToTime(timeStr, durationMins) {
  if (!timeStr || !/^\d{1,2}:\d{2}$/.test(timeStr)) {
    console.error("Invalid timeStr input:", timeStr);
    return null;
  }

  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);

  date.setMinutes(date.getMinutes() + durationMins);

  return date.toTimeString().slice(0, 5); // "HH:MM"
}

app.post("/send-booking-request", async (req, res) => {
  const {
    apiKey,
    service,
    staff,
    date,
    selectedTime,
    name,
    email,
    phone,
    specialRequirements
  } = req.body;
  try {
    const [users] = await pool.query("SELECT * FROM users");
    const user = users.find((user) => {
      if(!user.api_key) return
      return decryptApiKey(user.api_key) === apiKey;
    })
    const userId = user.user_id 

    const [durationArr] = await pool.query("SELECT * FROM services WHERE user_id = ? AND name = ?", [userId, service])
    const duration = durationArr[0].duration



   const endTime = addMinutesToTime(selectedTime, duration)
   if (!endTime || endTime === "Inval") {
    console.error("Invalid endTime generated:", endTime);
    return res.status(400).json({ error: "Invalid end time generated." });
  }
    await pool.query(`INSERT INTO appointments 
      (user_id, staff_name, service_name, appointment_date, start_time, end_time, name, email, phone, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       `,
      [userId, staff, service, date, selectedTime, endTime, name, email, phone, specialRequirements]
      )


return res.status(200).json({ msg: "Sucess"})
  } catch(e) {
    console.log("An error has occured with sending the booking DETAILS", e);
    return res.status(500).json({ error: "An error has occured with sending the booking DETAILS"})
  }
})

app.get("/get-membership", async (req, res) => {
const { userId } = req.query  
if(!userId) {
  return res.status(404).json({ message: "Invalid credentials"})
}
try {
  const [rows] = await pool.query("SELECT subscription_plan FROM users WHERE user_id = ?", [userId])
  return res.status(200).json({ message: rows[0] })
} catch(e) {
  console.log("Error occured with retreving membership", e)
  return res.status(500).json({ message: "Error occured with retreving membership"})
}
})

const dailyConversations = async (userId) => {
  if (!userId) {
    throw new Error("Missing userId parameter.");
  }

  try {
    const query = `
      SELECT COUNT(*) AS total_messages
      FROM chat_messages
      WHERE user_id = ? AND timestamp >= CURDATE()
    `;

    const [rows] = await pool.query(query, [userId]);
    const count = rows[0]?.total_messages || 0;

    return count;
  } catch (error) {
    console.error("Error fetching daily conversations:", error);
    throw error;
  }
};
function findClosestAvailableTimes(chosenTime, availableTimes) {
  // Parse the chosen time into a Date object for easier comparison
  const chosenDate = new Date(`1970-01-01T${chosenTime}:00Z`);
  
  // Convert available times into Date objects
  const availableDates = availableTimes.map(time => {
    const [hours, minutes] = time.split(':');
    const date = new Date(`1970-01-01T${time}:00Z`);
    return {
      time: time,
      date: date,
      diff: Math.abs(chosenDate - date)  // Calculate the time difference in milliseconds
    };
  });

  // Sort available dates by their time difference with the chosen time
  const sortedAvailableTimes = availableDates.sort((a, b) => a.diff - b.diff);

  // Get the closest available times (you can adjust how many you want to show)
  const closestTimes = sortedAvailableTimes.slice(0, 3).map(item => item.time);

  return closestTimes;
}

app.get("/fetch-all-faq", async (req, res) => {
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const [rows] = await pool.query("SELECT * FROM faq WHERE user_id = ?", [userId]);

    if (rows.length > 0) {
      return res.status(200).json({ faq: rows[0] });
    } else {
      return res.status(200).json({ faq: null }); // Explicitly return null
    }
  } catch (e) {
    console.error("An error occurred fetching the flagged issues:", e);
    return res.status(500).json({ error: "Internal server error fetching FAQ" });
  }
});


function generateRandomToken() {
  return Math.random().toString(36).substring(2, 10);
}
let userData = {};  
let userConversationState = {};
let user_id;
const conversationId = `${user_id}-${generateRandomToken()}`;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
app.post("/ask-ai", async (req, res) => {
  
try {
    const { apiKey, message, model = "gpt-4o-mini", temperature = 0.2, ...updates } = req.body;

    const [users] = await pool.query("SELECT * FROM users")
    const user = users.find((u) => {
      try {
        return decryptApiKey(u.api_key) === apiKey;
      } catch (e) {
        return false;
      }
    });


    if (!user) {
      console.log("Invalid API key")
      return res.status(403).json({ error: "Invalid API key" });
    }


const userId = user.user_id
user_id = userId
// Ensure that userData and userConversationState are initialized for the conversationId
if (!userData[conversationId]) {
  userData[conversationId] = {
    serviceName: "",
    staffName: "",
    date: "",
    availableTimes: [],
    selectedTime: "",
    name: "",
    email: "",
    specialRequirements: "",
  };
}

if (!userConversationState[conversationId]) {
  userConversationState[conversationId] = {};  // Initialize empty state for the conversation
}
const [accountType] = await pool.query("SELECT * FROM users WHERE user_id = ?", [userId]);
    if (accountType[0].subscription_plan === "Free") {
      const count = await dailyConversations(userId);
      console.log("👀 Conversations today:", count);
    
      if (count >= 30) {
        console.log("Invalid API key2")
        return res.status(400).json({ error: "Finished your 30 conversations per day." });
      }
    }

    if(accountType[0].apiBot === 0) {
      console.log("Invalid API key")
      return res.status(400).json({ error: "Your bot is disabled" });
    }
    
    if (!apiKey || !message) {
      
      console.log("Invalid API key4")
        return res.status(400).json({ error: "Missing required parameters (userId or message)." });
    }
    const [rows] = await pool.query("SELECT * FROM faq WHERE user_id = ? LIMIT 1", [userId]);

    if (rows.length === 0) {

        return res.status(404).json({ error: "No customization settings found for this user." });
    }

    let userSettings = rows[0];

    const updateFields = {};
    Object.keys(updates).forEach((key) => {
        if (updates[key] !== "" && updates[key] !== null && updates[key] !== undefined) {
            updateFields[key] = updates[key];
        }
    });


    if (Object.keys(updateFields).length > 0) {
        const updateQuery = `UPDATE faq SET ${Object.keys(updateFields).map(key => `${key} = ?`).join(", ")} WHERE user_id = ?`;
        const updateValues = [...Object.values(updateFields), userId];

        console.log("🔄 Executing update query:", updateQuery);
        console.log("🔄 Update values:", updateValues);

        await pool.query(updateQuery, updateValues);
    } else {
        console.log("⚠️ No valid fields to update. Skipping database update.");
    }

    const [updatedRows] = await pool.query("SELECT * FROM faq WHERE user_id = ? LIMIT 1", [userId]);
    userSettings = updatedRows[0];  

    const { 
        faq_id,
        username,
        tags,
        category,
        response_tone,
        response_delay_ms,
        escalation_threshold,
        business_context,
        avoid_topics,
        languages_supported,
        fine_tuning_data,
        customer_name,
        uploaded_file,
        webUrl,
        phoneNum
    } = userSettings;

    const businessName = customer_name; 

    let userMessage = message;

    if (business_context) {
        userMessage = `Context: ${business_context}\nUser: ${message}`;
    }

    if (avoid_topics) {
        userMessage += `\n(Note: Avoid discussing these topics: ${avoid_topics})`;
    }

    if (businessName) {
        userMessage = `Hello ${businessName},\n` + userMessage;
    }

    if (languages_supported) {
        userMessage += `\n(Preferred languages: ${languages_supported})`;
    }

    if (uploaded_file) {
        userMessage += `\n(Additional info from uploaded file: ${uploaded_file})`;
    }

    if (webUrl) {
        userMessage += `\n(Reference URL: ${webUrl})`;
    }

    let systemPrompt = `You are a helpful, concise AI chatbot for customer support on a website. Keep answers short (under 30 words), friendly, and direct. Avoid long explanations.`;
    if (response_tone) {
        systemPrompt = `Respond in a ${response_tone} tone.`;
    }
    if (fine_tuning_data) {
        systemPrompt += `\nUse fine-tuned data: ${fine_tuning_data}`;
    }
    if (category) {
        systemPrompt += `\nThe topic is categorized as: ${category}`;
    }
    if (tags) {
        systemPrompt += `\nRelevant keywords: ${tags}`;
    }

    const startTime = Date.now();

    const response = await openai.chat.completions.create({
        model: model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ],
        temperature: temperature,
        max_tokens: 50
    });

    const endTime = Date.now(); 

    const responseTime = endTime - startTime;

    console.log(`Response time: ${responseTime} ms`); 

    const sessionQuery = "SELECT session_id FROM chat_sessions WHERE user_id = ? ORDER BY session_id DESC LIMIT 1";
    const [sessionRows] = await pool.query(sessionQuery, [userId]);

    let sessionId;
    if (sessionRows.length > 0) {
        sessionId = sessionRows[0].session_id;  
    } else {
        const [newSession] = await pool.query("INSERT INTO chat_sessions (user_id) VALUES (?)", [userId]);
        sessionId = newSession.insertId;  
    }

    await pool.query("INSERT INTO chat_messages (session_id, sender_type, message_text, user_id) VALUES (?, 'user', ?, ?)", [sessionId, message, userId]);


    const [servicesNames] = await pool.query("SELECT name FROM services WHERE user_id = ?", [userId])
    const [staffNames] = await pool.query("SELECT name FROM staff WHERE user_id = ?", [userId])
    const [bookingEnabled] = await pool.query("SELECT booking FROM users where user_id = ?", [userId])
    const [subscrptionPlan] = await pool.query("SELECT subscription_plan FROM users WHERE user_id = ?", [userId])

    let aiResponse = response.choices[0].message.content;

    
    console.log("Parsed Date:", chrono.parseDate("May 7", new Date(), { forwardDate: true }));


    const lowerMessage = message.toLowerCase();


    


   
    const supportKeywords = [
      "talk to human",
      "human support",
      "real person",
      "speak to agent",
      "talk to someone",
      "need help from a person",
      "can I speak to a human",
      "contact support",
      "customer support",
      "live agent",
      "human assistant",
      "talk with a representative",
      "speak to support",
      "someone help me",
      "real support",
      "help from a human"
    ];
    const wantsHumanSupport = supportKeywords.some(phrase => lowerMessage.includes(phrase));
    
    if (wantsHumanSupport) {
      aiResponse = `Sure! You can reach our human support agent at 📞 ${phoneNum}. `;
      await pool.query("INSERT INTO chat_messages (session_id, sender_type, message_text, user_id, res_duration, status) VALUES (?, 'bot', ?, ?, ?, ?)", [sessionId, aiResponse, userId, responseTime, "Transferred to Agent"]);
    } 


    const triggers = [
      "book an appointment",
      "make an appointment",
      "schedule an appointment",
      "book a time",
      "schedule a time",
      "set up an appointment",
      "reserve an appointment",
      "book a meeting",
      "schedule a meeting",
      "arrange an appointment",
      "i need an appointment",
      "i want to book",
      "i want to schedule",
      "can i book",
      "can i schedule"
    ];
    const cancelTriggers = ["cancel", "never mind", "forget it", "stop", "exit"];

if (cancelTriggers.some(trigger => lowerMessage.includes(trigger))) {
  delete userConversationState[conversationId];
  delete userData[conversationId];
  aiResponse = "No problem! Let me know if you need anything else.";
} 

    if(subscrptionPlan[0].subscription_plan === "Pro") {
      
      if (triggers.some(trigger => lowerMessage.includes(trigger))) {
      if (!bookingEnabled[0].booking) {
        aiResponse = "Sorry, bookings are currently disabled. Please try again later or contact support.";
      } else {
        aiResponse = "What service would you like to book? (type 'exit' to cancel)";
        userConversationState[conversationId] = "waiting_for_service";
      }
    }

  
    else if (bookingEnabled[0].booking) {

 if (userConversationState[conversationId] === "waiting_for_service") {
  const normalizedMessage = message.toLowerCase().trim();
  
  const service = servicesNames.find(serviceObj => normalizedMessage.includes(serviceObj.name.toLowerCase().trim()));

  if (service) {
    if (!userData[conversationId]) {
      userData[conversationId] = {}; 
    }
    userData[conversationId].serviceName = service.name;  
    aiResponse = "Great! Who would you like to book with?";
    userConversationState[conversationId] = "waiting_for_staff";  
  } else {
    aiResponse = "Sorry, I couldn't find that service. Could you double-check the name?";
  }
  
}

else if (userConversationState[conversationId] === "waiting_for_staff") {
  const staff = staffNames.find(staffObj => message.toLowerCase().includes(staffObj.name.toLowerCase()));
  
  if (staff) {
    userData[conversationId].staffName = staff.name; 
    aiResponse = "Great! What date would you like to book? (yyyy-mm-dd)";
    userConversationState[conversationId] = "waiting_for_date";

  } else {
    aiResponse = "Hmm, I couldn't find that staff member. Could you double-check the name?";
    
  }
}

else if (userConversationState[conversationId] === "waiting_for_date") {
  const parsedDate = chrono.parseDate(message, new Date(), { forwardDate: true });

  if (parsedDate instanceof Date && !isNaN(parsedDate)) {
    const selectedDate = new Date(parsedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate >= today) {
      // Format date as YYYY-MM-DD
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      userData[conversationId].date = `${yyyy}-${mm}-${dd}`;

      aiResponse = "Great! What time works best for your appointment?";
      userConversationState[conversationId] = "waiting_for_time";
      try {
        const response = await axios.post(`${directory}/get-available-times`, {
          apiKey,
          serviceName: userData[conversationId].serviceName,
          date: userData[conversationId].date,
          staffName: userData[conversationId].staffName
        });

        userData[conversationId].availableTimes = response.data.slots;
        console.log("Available times:", userData[conversationId].availableTimes);
      } catch (e) {
        console.error("Error fetching times:", e);
        aiResponse = "There was a problem checking availability. Please try again.";
      }

    } else {
      aiResponse = "That date is in the past. Please choose a future date.";
    }

  } else {
    aiResponse = "Sorry, I couldn’t understand that date. Try something like 'May 5', 'in 3 days', or 'next Friday'.";
  }
}

else if (userConversationState[conversationId] === "waiting_for_time") {
  const parsedTime = chrono.parseDate(message);
  
  if (parsedTime) {
    const inputHours = parsedTime.getHours();
    const inputMinutes = parsedTime.getMinutes();
    const formattedTime = `${String(inputHours).padStart(2, '0')}:${String(inputMinutes).padStart(2, '0')}`;
    
    // Check if the user has selected an available time
    if (userData[conversationId].availableTimes.includes(formattedTime)) {
      userData[conversationId].selectedTime = formattedTime;
      aiResponse = `Perfect! Please enter your name!`;
      userConversationState[conversationId] = "waiting_for_name";
    } else {
      // If the selected time isn't available, find nearby available times
      const availableTimes = userData[conversationId].availableTimes;
      const suggestedTimes = findClosestAvailableTimes(formattedTime, availableTimes);
      
      if (suggestedTimes.length > 0) {
        aiResponse = `That time's taken. How about one of these? ${suggestedTimes.join(', ')}`;
      } else {
        aiResponse = "Sorry, that time isn't available. Please choose one of the available times listed.";
      }
    }
  } else {
    aiResponse = "I couldn't understand the time. Please enter something like '10:30 AM' or '15:00'.";
  }
}

    else if (userConversationState[conversationId] === "waiting_for_name") {
      if(message.length > 30) {
        aiResponse = "Name is too long!"
      } else {
        userData[conversationId].name = message;
        aiResponse = "Great! What's your email for confirmation?";
        userConversationState[conversationId] = "waiting_for_email";
      }
    }
    
    else if (userConversationState[conversationId] === "waiting_for_email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
      if (emailRegex.test(message.trim())) {
        userData[conversationId].email = message.trim();
        aiResponse = "Perfect, Do you have any special requirements?";
        userConversationState[conversationId] = "waiting_for_special_req";
      } else {
        aiResponse = "That email looks off—mind checking it again?";
      }
    }

    else if(userConversationState[conversationId] === "waiting_for_special_req") {
      userData[conversationId].specialRequirements = message
    
          const bookingData = {
          apiKey, 
          service: userData[conversationId].serviceName,
          staff: userData[conversationId].staffName,
          date: userData[conversationId].date,
          selectedTime: userData[conversationId].selectedTime,
          name: userData[conversationId].name, 
          email: userData[conversationId].email, 
          phone: "",
          specialRequirements: userData[conversationId].specialRequirements
          }
          try {
           await axios.post(`${directory}/send-booking-request` , bookingData , { withCredentials: true})
             aiResponse = `You are all set! Appoiment is on ${userData[conversationId].date} at ${userData[conversationId].selectedTime}`;
             userConversationState[conversationId] = null;
          } catch(e) {
            console.log("An Error Occured Sending the user's details to the backend from the backend", e)
          }
    }
  }
    } else {
    await pool.query("INSERT INTO chat_messages (session_id, sender_type, message_text, user_id, res_duration, status) VALUES (?, 'bot', ?, ?, ?, ?)", [sessionId, aiResponse, userId, responseTime, "Chatbot handled"]);
    }
    

    if (isUnresolved(aiResponse)) {
        await pool.query("INSERT INTO unresolved_queries (user_id, query, response, status) VALUES (?, ?, ?, 'unresolved')", [userId, message, aiResponse]);
    } else {
      await pool.query("INSERT INTO unresolved_queries (user_id, query, response, status) VALUES (?, ?, ?, 'resolved')", [userId, message, aiResponse]);
    }

    const satisfactionPrompt = `Thank you for using our support! Please rate your experience:
      1. Very Dissatisfied
      2. Dissatisfied
      3. Neutral
      4. Satisfied
      5. Very Satisfied
    `;

    setTimeout(() => {
        res.json({ 
            response: aiResponse,
            satisfaction_prompt: satisfactionPrompt, 
            response_time: responseTime, 
            metadata: {
                faq_id,
                userId,
                username,
                category,
                response_tone,
                escalation_threshold,
                businessName,
                webUrl 
            }
        });
    }, response_delay_ms || 0);
    
} catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "AI request failed" });
}
});



function isUnresolved(response) {
return response.includes("I'm sorry") || response.includes("I don't know") || response.length < 30;
}
function isResolved(response) {
return !isUnresolved(response);
}


app.get("/get-bot-status", async (req, res) => {
  const { userId } = req.query;

  try {
    const [rows] = await pool.query("SELECT apiBot FROM users WHERE user_id = ?", [userId]);
    const bool = !!rows[0]?.apiBot; // Ensure it's a boolean
    return res.status(200).json({ bool });
  } catch (e) {
    console.log("Error getting the status of bot", e);
    return res.status(500).json({ error: "Error getting the status of bot" });
  }
});

app.get("/set-bot-status", async (req, res) => {
  const { userId, aiBot } = req.query;

  try {
    await pool.query("UPDATE users SET apiBot = ? WHERE user_id = ?", [aiBot, userId]);
    return res.status(200).json({ message: "Change was successful" });
  } catch (e) {
    console.log("Error occurred with setting bot on or off", e);
    return res.status(500).json({ message: "Error occurred with setting bot on or off" });
  }
});


app.get("/get-queries", async (req, res) => {
const { userId } = req.query;
try {
  const [rows] = await pool.query(`
    SELECT * FROM unresolved_queries 
    WHERE user_id = ? 
    ORDER BY timestamp DESC
  `, [userId]);

  // Separate unresolved and resolved queries
  const unresolvedQueries = rows.filter(query => query.status === 'unresolved');
  const resolvedQueries = rows.filter(query => query.status === 'resolved');

  return res.status(200).json({ unresolvedQueries, resolvedQueries });
} catch (e) {
  console.log("Error occurred with fetching queries", e);
  res.status(500).json({ error: "Failed to fetch queries." });
}
});

app.get("/resTime-graph", async (req, res) => {
  const { userId } = req.query;

  try {
    const [rows] = await pool.query("SELECT * FROM chat_messages WHERE user_id = ? AND sender_type = ? ", [userId, "bot"]);
    return res.status(200).json({ message: rows})
  } catch(e) {
    console.log("An error has occured with retreiving the response time for chart", e)
    return res.status(500).json({ message: "An error has occured with retreiving the response time for chart"})
  }
})

app.get("/chat-stats/last-7-days/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as message_count
      FROM chat_messages cm
      JOIN chat_sessions cs ON cm.session_id = cs.session_id
      WHERE cs.user_id = ?
        AND timestamp >= CURDATE() - INTERVAL 7 DAY
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `;

    const [rows] = await pool.query(query, [userId]);
    res.json({ data: rows });
  } catch (e) {
    console.error("Error getting 7-day chat data:", e);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/chat-history/:userId", async (req, res) => {
try {
    const { userId } = req.params;

    // Validate input
    if (!userId) {
        return res.status(400).json({ error: "Missing userId parameter." });
    }

    // Fetch the latest messages for the user (ordered by timestamp)
    const query = `
        SELECT cm.message_id, cm.session_id, cm.sender_type, cm.message_text, cm.timestamp, cm.res_duration, cm.status
FROM chat_messages cm
JOIN chat_sessions cs ON cm.session_id = cs.session_id
WHERE cs.user_id = ?
ORDER BY cm.timestamp DESC
LIMIT 20;
    `;

    const [messages] = await pool.query(query, [userId]);

    res.json({ messages });
} catch (error) {
    console.error("❌ Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to retrieve chat history." });
}
});

app.get("/satisfaction", async (req, res) => {
const { userId } = req.query

try {
  const [response] = await pool.query("SELECT * FROM customer_feedback where user_id = ?", [userId]);
  return res.status(200).json({ message: response})
} catch (e) {
  console.log("Error occured with getting user satisfaction from the database");
  return res.status(500).json({ message: "Error"})
}
})

app.get("/conv-history", async (req, res) => {
const { userId } = req.query;
if (!userId) {
  return res.status(404).json({ message: "Invalid credentials"})
}
try {
  const [rows] = await pool.query("SELECT * FROM chat_messages WHERE user_id = ?", [userId])
  return res.status(200).json({ message: rows})
   
} catch(e){
  console.log("An error occured fetching the conversation history", e);
  return res.status(500).json({ message: "Internal server error occured"})
}
})

app.post("/submit-feedback", async (req, res) => {
  try {
    const { apiKey, rating } = req.body;

    if (!apiKey || rating === undefined || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Invalid input. Rating should be between 1 and 5." });
    }

    const encryptedKey = encryptApiKey(apiKey);
    console.log("Key", encryptedKey)
    const [users] = await pool.query("SELECT * FROM users");

    const user = users.find((u) => {
      if (!u.api_key) return false;
      try {
        return decryptApiKey(u.api_key) === apiKey;
      } catch (err) {
        console.error("Error decrypting API key for user:", u.user_id, err.message);
        return false;
      }
    });


if (!user) {
  return res.status(403).json({ error: "Invalid API key." });
}

const userId = user.user_id;

    const feedbackQuery = `
      INSERT INTO customer_feedback (rating, timestamp, user_id)
      VALUES (?, NOW(), ?)
    `;

    await pool.query(feedbackQuery, [rating, userId]);

    res.status(200).json({ message: "Thank you for your feedback!" });

  } catch (error) {
    console.error("❌ Error submitting feedback:", error.message);
    res.status(500).json({ error: "Failed to submit feedback." });
  }
});


app.post("/ping-client", async (req, res) => {
  const { apiKey } = req.body;

  try {
    const [users] = await pool.query("SELECT * FROM users");
    const user = users.find((u) => {
      if (!u.api_key) return false;
      return decryptApiKey(u.api_key) === apiKey;
    })
    if (!user) return res.status(403).json({ connected: false });

    await pool.query('UPDATE users SET last_connected = NOW() WHERE user_id = ?', [user.user_id]);
    res.status(200).json({ connected: true });
  } catch(e) {
    console.log("Error checking if the api is connected", e);
    res.status(500).json({ connected: false });
  }
})

app.get("/get-connected", async (req, res) => {
  const { userId } = req.query;
  try {
    const [rows] = await pool.query("SELECT last_connected FROM users WHERE user_id = ?", [userId]);
const user = rows[0];
    if (user && user.last_connected) {
      return res.status(200).json({
        connected: true,
        last_connected: user.last_connected,
      });
    } else {
      return res.status(200).json({ connected: false });
    }
  } catch (e) {
    console.log("Error fetching the bot status (connected)", e);
    return res.status(500).json({ connected: false });
  }
});


app.get("/daily-messages", async (req, res) => {
try {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing user_id parameter." });
  }

  const query = `
    SELECT COUNT(*) AS total_messages
    FROM chat_messages
    WHERE user_id = ? AND timestamp >= CURDATE()
  `;

  // Execute the query
  const [result] = await pool.query(query, [userId]);

  // Send the result as response
  res.json({ dailyMessages: result[0]?.total_messages || 0 });
} catch (error) {
  console.error("❌ Error fetching daily messages:", error);
  res.status(500).json({ error: "Failed to retrieve daily messages." });
}
});

app.get("/yesterday-messages", async (req, res) => {
  const { userId } = req.query
  if (!userId) {
    return res.status(400).json({ error: "Missing user_id parameter." });
  }
  try {
    const query = `
  SELECT COUNT(*) AS total_messages
  FROM chat_messages
  WHERE user_id = ? 
    AND timestamp >= CURDATE() - INTERVAL 1 DAY
    AND timestamp < CURDATE()
`;
const [result] = await pool.query(query, [userId]);
res.json({ yesterdayMessages: result[0]?.total_messages || 0 });
} catch (error) {
  console.error("❌ Error fetching yesterday's messages:", error);
  res.status(500).json({ error: "Failed to retrieve yesterday's messages." });
}
})

app.post("/user-training", async (req, res) => {
  const { username } = req.body;

  try {
    const [tables] = await pool.query("SHOW TABLES LIKE 'faq'");
    if (tables.length === 0) {
      console.warn("FAQ table does not exist.");
      return res.status(200).json({ config: {} }); 
    }

    const [rows] = await pool.query("SELECT * FROM faq WHERE username = ?", [username]);
    console.log("DB QUERY RESULT:", rows);

    if (rows.length > 0) {
      const training = rows[0];
      return res.status(200).json({ config: training });
    } else {
      return res.status(200).json({ config: {} });
    }

  } catch (e) {
    console.error("DB QUERY ERROR:", e);
    return res.status(500).json({ message: "An error occurred getting the user training data" });
  }
});




app.post("/send-suggestion", async (req, res) => {
  const { message } = req.body;
  try {
    const insert = await pool.query("INSERT INTO suggestions (message) VALUES (?)", [message]);
    return res.status(200).json({ message: "Sucess sending the message"})
  } catch (e) {
    console.log("Error with send suggestion", e)
    return res.status(500).json({ error: "Error with send suggestion"})
  }
})

app.post("/send-form", async (req, res) => {
  const { name, email, phone, message } = req.body;
try {
    const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAILMY,
      pass: process.env.PASSMY
    }
  })

  const mailOptions = {
    from: process.env.EMAILMY,
    to: process.env.SENDEMAIL, 
    subject: "CONTACT US BOTASSISTAI",
    html: `
    From: ${name}, Email: ${email}, Phone: ${phone}, Message: ${message}
    `
  }

   transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).send("Error sending email");
    }
    res.send("Thanks for subscribing!");
  })

}catch (e) {
  console.error("Database error:", e);
  res.status(500).send("Something went wrong. Please try again later.");
}


})


app.post("/upload-file", upload.single("file"), async (req, res) => {
try {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const filePath = path.join(uploadDir, req.file.filename);
  const fileExtension = path.extname(req.file.originalname).toLowerCase();

  let faqData = [];

  if (fileExtension === ".txt") {
    // 📄 Process TXT file
    const content = fs.readFileSync(filePath, "utf-8");
    faqData = content.split("\n").map((line) => {
      const parts = line.split("?");
      return {
        question: parts[0] ? parts[0].trim() + "?" : "Untitled Question",
        answer: parts[1] ? parts[1].trim() : "No answer provided.",
      };
    });
  } else if (fileExtension === ".csv") {
    // 📊 Process CSV file
    const content = fs.readFileSync(filePath, "utf-8");
    const rows = content.split("\n").map((row) => row.split(","));
    faqData = rows.map(([question, answer]) => ({
      question: question ? question.trim() : "Untitled Question",
      answer: answer ? answer.trim() : "No answer provided.",
    }));
  } else if (fileExtension === ".pdf") {
    // 📜 Process PDF file using pdf-parse
    const dataBuffer = fs.readFileSync(filePath);
    const pdfText = await pdfParse(dataBuffer);
    faqData = extractFAQs(pdfText.text);
  } else if (fileExtension === ".docx") {
    // 📝 Process Word file using mammoth
    const docxBuffer = fs.readFileSync(filePath);
    const { value } = await mammoth.extractRawText({ buffer: docxBuffer });
    faqData = extractFAQs(value);
  } else {
    return res.status(400).json({ error: "Unsupported file format." });
  }

  // Insert or update FAQs in the database
  for (const faq of faqData) {
    await pool.query(
      "INSERT INTO faq (question, answer) VALUES (?, ?) ON DUPLICATE KEY UPDATE answer = VALUES(answer)",
      [faq.question, faq.answer]
    );
  }

  res.json({ message: "File processed and FAQs updated!" });
} catch (error) {
  console.error("File processing error:", error);
  res.status(500).json({ error: "Error processing file." });
}
});

function extractFAQs(text) {
const lines = text.split("\n");
return lines
  .map((line) => {
    const parts = line.split("?");
    return {
      question: parts[0] ? parts[0].trim() + "?" : "Untitled Question",
      answer: parts[1] ? parts[1].trim() : "No answer provided.",
    };
  })
  .filter((faq) => faq.question !== "Untitled Question"); // Remove empty entries
}

const ensureAuthenticated = (req, res, next) => {
if (req.isAuthenticated()) {
  return next();
}
return res.status(401).json({ error: "Unauthorized: Please log in first" });
};
app.get("/dashboard", ensureAuthenticated, (req, res) => {
res.json({ message: "Welcome to the dashboard", user: req.user });
});


app.get("/auth-check", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ user: null });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE user_id = ?",
      [req.user.user_id]
    );

    const user = rows[0];

    let showRenewalModal = false;

    if (
      user.subscription_plan === "free" &&
      user.subscription_expiry &&
      new Date(user.subscription_expiry) < new Date() &&
      user.subscribed_at // meaning they had a subscription in the past
    ) {
      showRenewalModal = true;
    }

    return res.json({ user, showRenewalModal });
  } catch (err) {
    console.error("auth-check error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});




app.post("/log-in", async (req, res, next) => {
if (req.isAuthenticated()) {
  return res.status(403).json({ error: "Already logged in" });
}

passport.authenticate("local", (err, user, info) => {
  if (err) return next(err);
  if (!user) return res.status(401).json({ error: info ? info.message : "Invalid credentials" });

  req.logIn(user, async (err) => {
    if (err) return next(err);


    
    try {
      const lastLoginTime = new Date().toISOString().slice(0, 19).replace("T", " ");
      await pool.query("UPDATE users SET last_login = ? WHERE user_id = ?", [lastLoginTime, user.user_id]);
      
      console.log("Last login updated:", lastLoginTime);
    } catch (e) {
      console.error("Error updating last login date:", e);
      return res.status(500).json({ error: "Database error" });
    }

    return res.json({ success: true, user });
  });
})(req, res, next);
});



app.post('/register', async (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.status(403).json({ error: 'Already logged in' });
  }

  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const rawKey = uuidv4();
  let encryptedKey;
  try {
    encryptedKey = encryptApiKey(rawKey);
  } catch (error) {
    console.error('Encryption error:', error);
    return res.status(500).json({ message: 'Error encrypting API key' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, email, password, api_key) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, encryptedKey]
    );

    // Fetch the newly created user (you may already have this from the INSERT if returning user_id)
    const [userResult] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = userResult[0];
console.log(user)
    // Log the user in
    req.logIn(user, async (err) => {
      if (err) {
        console.error("Login error after registration:", err);
        return next(err);
      }

      return res.json({ success: true, user });
    });

  } catch (e) {
    console.error('Error creating the account:', e);
    return res.status(500).json({ message: 'Internal error creating your account' });
  }
});



// Encryption function
function encryptApiKey(apiKey) {
  const iv = crypto.randomBytes(ivLength); // Generate IV
  console.log('IV Length:', iv.length); // Should be 16 bytes
  console.log('Raw API Key:', apiKey); // Log the API key being encrypted

  const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
  
  try {
      let encrypted = cipher.update(apiKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted; // IV + encrypted data
  } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Encryption failed');
  }
}

function decryptApiKey(encryptedKey) {
  const [ivHex, encrypted] = encryptedKey.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}


app.get("/get-api", async (req, res) => {
  const { userId } = req.query
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [userId])
    if (rows.length > 0) {
      const decryptedKey = decryptApiKey(rows[0].api_key)
    return res.status(200).json({ key: decryptedKey})
    } else {
      return
    }
  } catch (e) {
    console.log("Error fetching api", e)
    return res.status(500).json({ message: "Error"})
  }
})



async function verifyGoogleToken(token) {
  try {
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
      });
      return ticket.getPayload();
  } catch (error) {
      console.log("Error verifying Google token:", error);
      return null;
  }
}
async function generateUniqueUsername(baseUsername) {
  let username = baseUsername.replace(/\s+/g, ''); // Remove spaces
  let uniqueUsername = username;
  let counter = 1;

  const [rows] = await pool.query(
    "SELECT username FROM users WHERE username LIKE ?",
    [`${username}%`]
  );

  const taken = new Set(rows.map(r => r.username));

  while (taken.has(uniqueUsername)) {
    uniqueUsername = `${username}${counter}`;
    counter++;
  }

  return uniqueUsername;
}

app.post("/auth/google", async (req, res) => {
  const { token } = req.body;
  const googleUser = await verifyGoogleToken(token);

  if (!googleUser) {
    return res.status(401).json({ message: "Invalid Google token" });
  }

  try {
    let user;
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [googleUser.email]);

    if (rows.length === 0) {
      const baseUsername = googleUser.name || googleUser.email.split("@")[0];
      const uniqueUsername = await generateUniqueUsername(baseUsername);

      // Generate and encrypt API key
      const rawKey = uuidv4();
      const encryptedKey = encryptApiKey(rawKey);

      const [result] = await pool.query(
        "INSERT INTO users (username, email, google_id, api_key) VALUES (?, ?, ?, ?)",
        [uniqueUsername, googleUser.email, googleUser.sub, encryptedKey]
      );

      if (result.affectedRows === 1) {
        user = { user_id: result.insertId, username: uniqueUsername, email: googleUser.email };
        console.log("New Google user created:", user);
      } else {
        return res.status(500).json({ message: "Failed to create Google user." });
      }
    } else {
      user = rows[0];
    }

    req.login(user, async (err) => {
      if (err) {
        return res.status(500).json({ message: "Login session error" });
      }

      try {
        const lastLoginTime = new Date().toISOString().slice(0, 19).replace("T", " ");
        await pool.query("UPDATE users SET last_login = ? WHERE email = ?", [lastLoginTime, user.email]);
        return res.json({ message: "Google login successful", user });
      } catch (dbError) {
        return res.status(500).json({ message: "Failed to update last login time" });
      }
    });

  } catch (dbError) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// **Google OAuth Redirect Flow**
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));



app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/log-in" }),
  (req, res) => {
    if (!req.user) {
      return res.redirect("/log-in");
    }
    
    // ✅ Redirect to the dashboard with the correct username
    console.log(`✅ Google OAuth success: Redirecting to /${req.user.username}/dashboard`);
    res.redirect(`/${req.user.username}/dashboard`);
  }
);




app.post("/logout", (req, res) => {
req.logout((err) => {
  if (err) return res.status(500).json({ error: "Logout failed" });
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    return res.json({ message: "Logged out successfully" });
  });
});
});






app.get("/check-google_id", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: "❌ Missing userId" });

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "❌ User not found" });
    }

    res.status(200).json({ user: rows[0] });
  } catch (e) {
    console.error("❌ An error occurred with checking the Google ID:", e);
    res.status(500).json({ message: "❌ Error retrieving Google ID" });
  }
});


app.post("/change-password", async (req, res) => {
const {oldPassword, newPassword, userId} = req.body;
try{
  const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [userId]);
  
  if (rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  const user = rows[0];

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Incorrect old password" });
  }

    const newPass = await bcrypt.hash(newPassword, 10)
    await pool.query("UPDATE users SET password = ? WHERE user_id = ?", [newPass, userId])
    return res.status(200).json({ message: "Password changed sucessfully"})
  
} catch(e){
  return res.status(500).json({ message: "An internal error has occured, please try again"})
}
})

app.post("/update-config", upload.single("file"), async (req, res) => {
const {
  responseTone,
  responseDelay,
  escalationThreshold,
  categories,
  businessContext,
  businessName,
  avoidTopics,
  languages,
  fineTuningData,
  userName,
  userId,
  faqQuestion,
  faqAnswer,
  webUrl,
  phoneNum
} = req.body;

const fileReference = req.file ? req.file.path : null; // Get the uploaded file
const parsedThreshold = parseFloat(escalationThreshold) || 0.7;

try {
  const [existingUser] = await pool.query("SELECT * FROM faq WHERE user_id = ?", [userId]);

  const [user] = await pool.query("SELECT * FROM users WHERE user_id = ?", [userId])
  if (existingUser.length > 0) {
    await pool.query(
      `UPDATE faq SET username = ?, question = ?, answer = ?, category = ?, 
       response_tone = ?, response_delay_ms = ?, escalation_threshold = ?, 
       business_context = ?, avoid_topics = ?, languages_supported = ?, 
       fine_tuning_data = ?, businessName = ?, uploaded_file = ?, webUrl = ?, phoneNum = ?, last_updated = NOW() WHERE user_id = ?`,
      [
        userName, faqQuestion, faqAnswer, categories,
        responseTone, parseInt(responseDelay) || 500, parsedThreshold,
        businessContext, avoidTopics, languages,
        fineTuningData, businessName, fileReference, webUrl, phoneNum, userId
      ]
    );

    const [domainCheck] = await pool.query(
      "SELECT * FROM allowed_domains WHERE user_id = ?",
      [userId]
    );

    if (domainCheck.length > 0) {
      await pool.query("UPDATE allowed_domains SET domain = ? WHERE user_id = ?", [webUrl, userId]);
    } else {
      await pool.query("INSERT INTO allowed_domains (user_id, api_key, domain) VALUES (?, ?, ?)", [
        userId,
        user[0].api_key,
        webUrl,
      ]);
    }
    res.status(200).json({ message: "Configuration updated successfully!" });
  } else {
    await pool.query(
      `INSERT INTO faq 
      (user_id, username, question, answer, category, response_tone, response_delay_ms, 
      escalation_threshold, business_context, avoid_topics, languages_supported, 
      fine_tuning_data, businessName, uploaded_file, phoneNum) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, userName, faqQuestion, faqAnswer, categories,
        responseTone, parseInt(responseDelay) || 500, parsedThreshold,
        businessContext, avoidTopics, languages,
        fineTuningData, businessName, fileReference, phoneNum
      ]
    );

    await pool.query("Insert into allowed_domains (user_id, api_key, domain) values (?, ?, ?)", [userId, user[0].api_key, webUrl])

    res.status(201).json({ message: "Configuration inserted successfully!" });
  }
} catch (error) {
  console.error("Error updating/creating FAQ table:", error);
  res.status(500).json({ error: "Database error. Could not update configuration." });
}
});

app.get("/reset-bot", async (req, res) => {
  const { userId } = req.query;

  try{
    await pool.query(
      `UPDATE faq SET 
        question = '',
        answer = '',
        tags = '',       
        category = '',
        response_tone = '',
        response_delay_ms = 500,
        escalation_threshold = 0.7,
        business_context = '',
        avoid_topics = '',
        fine_tuning_data = '',
        businessName = '',
        webUrl = '',
        uploaded_file = ''
      WHERE user_id = ?`,
      [userId]
    );
    
    return res.status(200).json({ message: "Sucess"})
  } catch(e) {
    console.log("Error with reseting bot data", e)
    return res.status(500).json({ error: "Error with reseting bot data"})
  }
})


app.post("/send-question", async (req, res) => {
  const { userId, email, msg } = req.body;
  try {
    const add = await pool.query("INSERT INTO user_messages (user_id, user_email, message) VALUES (?, ?, ?)", 
      [userId, email, msg]
    )
    return res.status(200).json({ message: "Message sent sucessfully"})
  } catch(e) {
    console.log("An error occured sending the user's issue / question", e)
    return res.status(500).json({ message: "An error occured sending the user's issue / question"})
  }
})

app.get("/unsubscribe", async (req, res) => {
  const { email } = req.query;
  if(email === "") {
    return res.status(404).json({ message: "Error Unsubscribing"})
  }
  try {
     await pool.query("DELETE FROM newsletter WHERE email = ?", [email])
    return res.status(200).json({ message: "Unsubscribed"})
  } catch(e) {
    console.log("Error occured with unsubscribing", e);
    return res.status(500).json({ message: "Error Unsubscribing"})
  }
})


app.post("/newsletter", async (req, res) => {
const { email } = req.body;
const html = `
  <div style="font-family: 'Segoe UI', sans-serif; width: 90%; margin: auto; padding: 40px 30px; text-align: center; background: linear-gradient(to bottom, #0B1623, #092032); color: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 245, 212, 0.15);">
      
     <img src="https://botassistai.com/img/BigLogo.png" alt="BotAssistAI Logo" style="width: 120px; margin-bottom: 30px;">

      <h1 style="color: #00F5D4; font-size: 34px; font-weight: 700;">merhaba! 🚀</h1>
      
      <p style="color: #cccccc; font-size: 17px; margin-bottom: 20px;">
        Welcome to <strong>BotAssistAI</strong>! 🎉 Thanks for subscribing to our newsletter.
        Get ready for <span style="color: #00F5D4;">AI-powered insights, updates & exclusive perks</span> delivered straight to your inbox.
      </p>

      <div style="background-color: #112B3C; padding: 20px; border-radius: 12px; margin: 30px 0;">
          <h3 style="color: #00F5D4; font-size: 22px;">What You'll Receive:</h3>
          <ul style="list-style-type: none; padding: 0; margin-top: 15px;">
              <li style="margin: 12px 0; font-size: 16px;">✅ Expert AI Customer Support Tips</li>
              <li style="margin: 12px 0; font-size: 16px;">✅ Exclusive Product Updates</li>
              <li style="margin: 12px 0; font-size: 16px;">✅ Case Studies & Use Cases</li>
              <li style="margin: 12px 0; font-size: 16px;">✅ Special Deals & Discounts</li>
          </ul>
      </div>

      <p style="font-size: 16px; margin-bottom: 30px;">
          Let’s revolutionize your support with <strong style="color: #00F5D4;">AI-driven automation</strong> 🚀
      </p>

      <a href="https://botassistai.com/dashboard" 
         style="display: inline-block; padding: 14px 30px; font-size: 16px; color: #000; background: #00F5D4; border-radius: 30px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 12px rgba(0, 245, 212, 0.4);">
         Explore BotAssistAI 🔍
      </a>

      <p style="margin-top: 35px; font-size: 14px; color: #aaa;">Need help? <a href="mailto:support@botassistai.com" style="color: #00F5D4; text-decoration: none;">Contact Support</a></p>

      <div style="margin-top: 25px;">
          <a href="https://facebook.com/botassistai" style="margin: 0 8px;">
              <img src="https://img.icons8.com/ios-filled/50/00F5D4/facebook.png" alt="Facebook" width="28">
          </a>
          <a href="https://instagram.com/botassistai" style="margin: 0 8px;">
              <img src="https://img.icons8.com/ios-filled/50/00F5D4/instagram-new.png" alt="Instagram" width="28">
          </a>
          <a href="https://twitter.com/botassistai" style="margin: 0 8px;">
              <img src="https://img.icons8.com/ios-filled/50/00F5D4/twitter.png" alt="Twitter" width="28">
          </a>
          <a href="https://linkedin.com/company/botassistai" style="margin: 0 8px;">
              <img src="https://img.icons8.com/ios-filled/50/00F5D4/linkedin.png" alt="LinkedIn" width="28">
          </a>
      </div>

      <p style="font-size: 12px; color: #666; margin-top: 20px;">
        You received this email because you subscribed to our updates. 
        <a href="https://botassistai.com/unsubscribe?email=${email}" style="color: #ff5e5e; text-decoration: none;">Unsubscribe</a>
      </p>
  </div>
`;




try {
  await pool.query("INSERT INTO newsletter (email) VALUES (?)", [email]);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS
    }
  })
  
  const mailOptions = {
    from: process.env.EMAIL,
    to: email, 
    subject: "Thanks for subscribing to our newsletter",
    html: html
  }
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).send("Error sending email");
    }
    console.log("Email sent successfully:", info.response); 
    res.send("Thanks for subscribing!");
  })

} catch (e) {
  console.error("Database error:", e);
  res.status(500).send("Something went wrong. Please try again later.");
}

})

const { SitemapStream } = require('sitemap');

// Generate sitemap automatically on server start
async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: 'https://www.botassistai.com' });
  const writeStream = fs.createWriteStream(path.join(__dirname, 'public', 'sitemap.xml'));
  sitemap.pipe(writeStream);

  sitemap.write({ url: '/', changefreq: 'daily', priority: 1.0 });
  sitemap.write({ url: '/features', changefreq: 'weekly', priority: 0.8 });
  sitemap.write({ url: '/pricing', changefreq: 'monthly', priority: 0.7 });
  sitemap.write({ url: '/about', changefreq: 'monthly', priority: 0.6 });
  sitemap.write({ url: '/contact', changefreq: 'monthly', priority: 0.6 });
  sitemap.write({ url: '/log-in', changefreq: 'monthly', priority: 0.7 });
  sitemap.write({ url: '/sign-up', changefreq: 'monthly', priority: 0.7 });

  sitemap.end();

  writeStream.on('finish', () => {
    console.log('✅ sitemap.xml generated on server start');
  });

  writeStream.on('error', (err) => {
    console.error('❌ Error generating sitemap:', err);
  });
}

// Call it when the server starts
generateSitemap();

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: https://www.botassistai.com/sitemap.xml
`);
});


app.listen(8090)