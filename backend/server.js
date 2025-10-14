
if(process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}
const directory = "https://api.botassistai.com"
const express = require("express");
const app = express()
const nodemailer = require("nodemailer")
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
const jwt = require('jsonwebtoken');
const pool = createPool({
host: process.env.DATABASE_HOST,
user: process.env.DATABASE_USER,
password: process.env.DATABASE_PASSWORD,
database: process.env.DATABASE
}).promise();
const { shopifyApi } = require('@shopify/shopify-api');
const shopifyApiPackage = require('@shopify/shopify-api');
const verifySessionToken = require('./verifySessionToken');
const { SHOPIFY_API_KEY, HOST } = process.env;
const fetchWebhooks = require('./fetchWebhooks');
const { shopify, Webhook } = require('./shopify');
const { storeCallback } = require('./sessionStorage');
const { Session } = require("@shopify/shopify-api");
const { DeliveryMethod } = require("@shopify/shopify-api");
const MySQLStore = require('express-mysql-session')(session);
const shopifySessionMiddleware = require('./shopifySessionMiddleware');
const sessionStore = new MySQLStore({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});


app.set('trust proxy', 1);
app.use(cookieParser());
//process.env.SHOPIFY_API_SECRET

app.use((req, res, next) => {
  if (req.headers.host !== "api.botassistai.com") {
    return res.redirect(`https://api.botassistai.com${req.originalUrl}`);
  }
  if (req.protocol !== "https") {
    return res.redirect(`https://${req.headers.host}${req.originalUrl}`);
  }
  next();
});


app.use(['/ping-client', '/ask-ai'], cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false // ⚠️ NO cookies allowed here
}));

const allowedOrigins = [
  'https://www.botassistai.com',
  'https://botassistai.com',
  'https://admin.shopify.com',
  /\.myshopify\.com$/,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  "https://shop-ease2.netlify.app",
  "http://127.0.0.1:5501"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow no-origin requests (e.g., curl or same-origin SSR)
    
    const isAllowed = allowedOrigins.some(o =>
      o instanceof RegExp ? o.test(origin) : o === origin
    );

    if (isAllowed || true) {
      callback(null, true);
    } else {
      console.warn(`❌ Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore, 
  proxy: true,
  cookie: {
    httpOnly: true,
    secure: true,      
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000,
    domain: 'api.botassistai.com' 
  }
}));
app.use(shopifySessionMiddleware);



app.get("/auth", async (req, res) => {
  console.log("IN AUTH");
  try {
    const shop = req.query.shop || req.session.validated_shop;

    const redirectUrl = await shopify.auth.begin({
      shop,
      callbackPath: "/auth/callback",
      isOnline: true,
      rawRequest: req,
      rawResponse: res,
    });

    res.redirect(redirectUrl);
  } catch (e) {
    if (!res.headersSent) res.status(500).send("Auth error");
  }
});




app.get("/api/check-session", verifySessionToken, (req, res) => {
  return res.status(200).json({ message: "Session is valid", shop: req.shopify.shop });
});

app.get("/api/shop-data", verifySessionToken, async (req, res) => {
  try {
    const client = new shopify.clients.Rest({ session: req.shopify.session });
    const response = await client.get({ path: "shop" });
    return res.status(200).json({ shopData: response.body.shop });
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
});

app.get("/api/sessions", async (req, res) => {
  const sessions = require("./sessions.json");
  res.json(Object.keys(sessions));
});
                                  



app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "frame-ancestors https://admin.shopify.com https://*.myshopify.com;"
  );
  res.removeHeader("X-Frame-Options");
  next();
});



app.get('/shopify/embedded', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors https://admin.shopify.com https://*.myshopify.com"
  );
  next();
});


app.get("/auth/embedded", (req, res) => {
  const { shop, host } = req.query;

  if (!shop || !host) {
    return res.status(400).send("Missing shop or host");
  }

  const redirectUrl = `https://admin.shopify.com/store/${shop}/apps/${process.env.SHOPIFY_APP_HANDLE}?shop=${shop}&host=${host}`;
  return res.redirect(redirectUrl);
});






function verifyHMAC(queryParams, secret) {
  const { hmac, ...rest } = queryParams;
  const message = Object.keys(rest)
    .sort()
    .map(k => `${k}=${Array.isArray(rest[k]) ? rest[k][0] : rest[k]}`)
    .join('&');

  const digest = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(hmac, 'utf-8'),
      Buffer.from(digest, 'utf-8')
    );
  } catch (e) {
    return false;
  }
}
function verifyHMAC(queryParams, secret) {
  const { hmac, ...rest } = queryParams;
  const message = Object.keys(rest)
    .sort()
    .map(k => `${k}=${Array.isArray(rest[k]) ? rest[k][0] : rest[k]}`)
    .join('&');

  const digest = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(hmac, 'utf-8'), Buffer.from(digest, 'utf-8'));
  } catch (e) {
    return false;
  }
}
app.get('/', async (req, res) => {
  const { shop, hmac, host } = req.query;

  // Case 1: Embedded app launch
  if (shop && hmac) {
    const isValid = verifyHMAC(req.query, process.env.SHOPIFY_API_SECRET);
    if (!isValid) {
      console.warn("⚠️ Invalid HMAC on /:", req.query);
      return res.status(400).send('Invalid HMAC');
    }

    const normalizedShop = shop.toLowerCase();

    const [rows] = await pool.query(
      `SELECT access_token FROM shopify_installs WHERE shop = ?`,
      [normalizedShop]
    );

    if (rows.length === 0) {
      // Not installed yet → redirect to install flow
      return res.redirect(`/shopify/install?shop=${encodeURIComponent(normalizedShop)}`);
    }

    // Redirect into Shopify embedded app
    const redirectHost = host || Buffer.from(normalizedShop, 'utf-8').toString('base64');
    const embeddedUrl = `https://admin.shopify.com/store/${normalizedShop.replace('.myshopify.com', '')}/apps/${process.env.SHOPIFY_APP_HANDLE}?shop=${normalizedShop}&host=${redirectHost}`;
    return res.redirect(embeddedUrl);
  }

  // Case 2: Public site visitor (non-Shopify)
  res.sendFile(path.join(__dirname, 'public/index.html'));
});
 
function isValidShop(shop) {
  return /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/.test(shop);
}



app.use((req, res, next) => {
  const cookies = req.headers.cookie?.split(';').map(c => c.trim()) || [];
  const sidCookies = cookies.filter(c => c.startsWith('connect.sid='));
  if (sidCookies.length > 1) {
    console.warn("⚠️ Multiple connect.sid cookies detected, trimming to the latest");
    const trimmed = sidCookies[sidCookies.length - 1];
    req.headers.cookie = cookies
      .filter(c => !c.startsWith('connect.sid='))
      .concat(trimmed)
      .join('; ');
  }
  next();
});
 

app.get('/clear-cookies', (req, res) => {
  const options = {
    path: '/',
    secure: true,
    sameSite: 'none',
  };

  // Clear variants that may exist
  res.clearCookie('connect.sid', { ...options, domain: 'api.botassistai.com' });
  res.clearCookie('connect.sid', { ...options, domain: '.botassistai.com' });
  res.clearCookie('connect.sid', { ...options }); // no domain

  res.send('✅ All session cookies cleared');
});


async function registerWebhooks(shop, accessToken) {
  const topicsToRegister = [
    { topic: 'app/uninstalled', address: 'https://api.botassistai.com/shopify/uninstall' },
    { topic: 'customers/data_request', address: 'https://api.botassistai.com/shopify/gdpr/customers/data_request' },
    { topic: 'customers/redact', address: 'https://api.botassistai.com/shopify/gdpr/customers/redact' },
    { topic: 'shop/redact', address: 'https://api.botassistai.com/shopify/gdpr/shop/redact' },
  ];

  const existing = await fetchWebhooks(shop, accessToken);

  for (const { topic, address } of topicsToRegister) {
    if (existing.find(h => h.topic === topic && h.address === address)) {
      console.log(`⚠️ Webhook for ${topic} at ${address} already exists, skipping`);
      continue;
    }

    try {
      await axios.post(`https://${shop}/admin/api/2023-10/webhooks.json`, {
        webhook: { topic, address, format: 'json' }
      }, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Registered webhook: ${topic} → ${address}`);
    } catch (err) {
      console.error(`❌ Failed to register webhook ${topic}:`, err.response?.data || err.message);
    }
  }
}





app.get('/shopify/welcome', (req, res) => {
  res.send(`<h2>🎉 Welcome to BotAssist AI!</h2><p>Installation successful for shop: ${req.query.shop}</p>`);
});

async function registerScriptTag(shop, accessToken) {
  const scriptSrc = `https://api.botassistai.com/chatbot-loader.js?shop=${encodeURIComponent(shop)}`;

  try {
    const existing = await axios.get(`https://${shop}/admin/api/2023-10/script_tags.json`, {
      headers: { 'X-Shopify-Access-Token': accessToken }
    });

    if (existing.data.script_tags.some(tag => tag.src === scriptSrc)) {
      console.log('⚠️ Script tag already exists, skipping');
      return;
    }

    await axios.post(`https://${shop}/admin/api/2023-10/script_tags.json`, {
      script_tag: {
        event: 'onload',
        src: scriptSrc
      }
    }, {
      headers: { 'X-Shopify-Access-Token': accessToken }
    });

    console.log('✅ Script tag injected:', scriptSrc);
  } catch (err) {
    console.error('❌ Error injecting script:', err.response?.data || err.message);
  }
}

app.post('/api/link-shop-to-user', async (req, res) => {
  if (!req.isAuthenticated() || !req.user?.user_id) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const { shop } = req.body;
  if (!shop) return res.status(400).json({ error: "Missing shop" });

  try {
    // Get token from the install table
    const [rows] = await pool.query(`SELECT access_token FROM shopify_installs WHERE shop = ?`, [shop]);
    if (!rows.length) return res.status(404).json({ error: "Shop not found" });

    const accessToken = rows[0].access_token;

    // Save to the actual users table
    await pool.query(
      `UPDATE users SET shopify_shop_domain = ?, shopify_access_token = ?, shopify_installed_at = NOW()
       WHERE user_id = ?`,
      [shop.toLowerCase(), accessToken, req.user.user_id]
    );

    return res.json({ success: true });
  } catch (e) {
    console.error("Linking shop failed:", e.message);
    return res.status(500).json({ error: "Database error" });
  }
});

app.post("/shopify/uninstall", bodyParser.raw({ type: "application/json" }), async (req, res) => {
  try {
    const crypto = require("crypto");
    const hmacHeader = req.headers["x-shopify-hmac-sha256"];
    const rawBody = req.body;

    const hash = crypto
      .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
      .update(rawBody, "utf8")
      .digest("base64");

    if (hmacHeader !== hash) {
      console.warn("❌ Invalid webhook signature");
      return res.status(401).send("Invalid signature");
    }

    const shop = req.headers["x-shopify-shop-domain"];
    const payload = JSON.parse(rawBody.toString());

    console.log("🔌 App uninstalled:", shop);



  const [[user]] = await pool.query(
    'SELECT * FROM users WHERE shopify_shop_domain = ?',
    [shop]
  );

  if (!user) {
    console.warn(`⚠️ No user found for shop ${shop}`);
    return res.status(404).send('User not found');
  }

  const email = user.email;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your Account Password for Our App",
    html: `
   <div style="font-family: 'Segoe UI', sans-serif; width: 90%; margin: auto; padding: 40px 30px; text-align: center; background: linear-gradient(to bottom, #0B1623, #092032); color: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 245, 212, 0.15);">

<img src="https://botassistai.com/img/BigLogo.png" alt="BotAssistAI Logo" style="width: 120px; margin-bottom: 30px;">

<h1 style="color: #00F5D4; font-size: 34px; font-weight: 700;">Hey there!</h1>

<p style="color: #cccccc; font-size: 17px; margin-bottom: 20px;">
We're sorry to see you go. <strong>Your store has uninstalled the BotAssistAI app.</strong><br />
If this was a mistake or you'd like to come back, you can reinstall anytime from the Shopify App Store.
</p>

<h3 style="color: #00F5D4; font-size: 22px;">We'll be here if you return.</h3>

<p style="margin-top: 35px; font-size: 14px; color: #aaa;">Questions? <a href="mailto:support@botassistai.com" style="color: #00F5D4; text-decoration: none;">Contact Support</a></p>

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
You received this email because you had an account with us. 
<a href="https://botassistai.com/unsubscribe" style="color: #ff5e5e; text-decoration: none;">Unsubscribe</a>
</p>
</div>


    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('❌ Error sending password email:', error);
    }
    console.log('✅ Password email sent:', info.response);
  });

  res.sendStatus(200);
} catch (err) {
  console.error("❌ Error handling APP_UNINSTALLED webhook:", err);
  res.status(500).send("Internal error");
}
});

app.get('/chatbot-loader.js', async (req, res) => {
  const shop = Array.isArray(req.query.shop) ? req.query.shop[0] : req.query.shop?.toLowerCase();
  if (!shop) return res.status(400).send('Missing or invalid shop');

  try {
    if (!shop || typeof shop !== 'string') {
      console.error("❌ Invalid shop value:", shop);
      return res.status(400).send("Invalid shop parameter");
    }
    console.log("🛠️ Running query for shop:", shop);

    const [rows] = await pool.query(
      'SELECT api_key FROM users WHERE shopify_shop_domain = ?',
      [shop]
    ); 

    const [rows2] = await pool.query("SELECT * FROM shopify_customization WHERE shop = ?", [shop])
    const shopifyCustom = rows2[0] || {}
    if (!rows.length) return res.status(404).send('Shop not found');

    let userApiKey;
    try {
      userApiKey = decryptApiKey(rows[0].api_key); // replace with your decryption logic
    } catch (e) {
      console.error("❌ API Key decrypt error:", e.message);
      return res.status(500).send("Decryption failed");
    }

    res.set('Content-Type', 'application/javascript');
    res.send(`
      // Inject CSS styles
      const style = document.createElement('style');
      style.innerHTML = \`
        :root {
          --ai-background: ${shopifyCustom.chatbotBackground || '#092032'}; 
          --ai-button: ${shopifyCustom.chatBtn || '#00F5D4'};
          --ai-input: ${shopifyCustom.chatInputBackground || '#ffffff'};
          --ai-input-font-color: ${shopifyCustom.chatInputTextColor || '#000000'};             
          --ai-border: ${shopifyCustom.borderColor || '#00F5D4'};                         
          --ai-website-chat-btn: ${shopifyCustom.websiteChatBtn || '#00F5D4'};              
          --ai-website-question: ${shopifyCustom.websiteQuestion || '#ffffff'};              
          --font-color: ${shopifyCustom.textColor || '#cccccc'};                        
          --conversation-boxes: ${shopifyCustom.chatBoxBackground || '#112B3C'};
          --need-help-text: ${shopifyCustom.needHelpTextColor || '#00F5D4'};
        }
      \`;
      document.head.appendChild(style);
    
      // Inject the chatbot script using an inline <script> tag with the api-key attribute
      const inlineScript = document.createElement('script');
      inlineScript.setAttribute("type", "text/javascript");
      inlineScript.setAttribute("api-key", "${userApiKey}");
      inlineScript.src = "https://api.botassistai.com/client-chatbot.js";
      document.body.appendChild(inlineScript);
    `);
  } catch (err) {
    console.error('Error loading chatbot script:', err.message);
    res.status(500).send('Internal server error');
  }
});






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


async function registerGdprWebhooks(session) {
  const gdprWebhooks = [
    { topic: "CUSTOMERS_DATA_REQUEST", path: "/shopify/gdpr/customers/data_request" },
    { topic: "CUSTOMERS_REDACT", path: "/shopify/gdpr/customers/redact" },
    { topic: "SHOP_REDACT", path: "/shopify/gdpr/shop/redact" },
  ];

  for (const webhook of gdprWebhooks) {
    try {
      const registered = await shopify.webhooks.register({
        session,
        path: webhook.path,
        topic: webhook.topic,
      });

      if (registered) {
        console.log(`✅ Registered webhook: ${webhook.topic} at ${webhook.path}`);
      } else {
        console.error(`❌ Failed to register webhook: ${webhook.topic}`);
      }
    } catch (error) {
      console.error(`❌ Error registering webhook ${webhook.topic}:`, error.message);
    }
  }
}


app.get('/check-shopify-store', async (req, res) => {
  const { shop } = req.query;

  if (!shop) {
    return res.status(400).json({ installed: false });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE shopify_shop_domain = ?",
      [shop.toLowerCase()]
    );

    const isInstalled = rows.length > 0;
    res.json({ installed: isInstalled });
  } catch (err) {
    console.error("❌ Error checking install status:", err);
    res.status(500).json({ installed: false });
  }
});



app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


async function handlePostInstall(shop, accessToken) {
  await Promise.all([
    registerScriptTag(shop, accessToken),
    registerWebhooks(shop, accessToken),
    registerGdprWebhooks({ shop, accessToken }, shop),
  ]);

  // ✅ Fake minimal session for REST client
  const session = {
    id: `offline_${shop}`,
    shop,
    state: "active",
    isOnline: false,
    accessToken,
    scope: process.env.SHOPIFY_SCOPES,
  };

  const client = new shopify.clients.Rest({ session });

  const response = await client.get({ path: "shop" });
  const shopData = response?.body?.shop;
  if (!shopData) throw new Error("Failed to fetch shop info");

  const email = shopData.email || shop;
  const username = shopData.name || shop;
  const rawKey = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(rawKey, 10);
  const encryptedKey = encryptApiKey(uuidv4());

  const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  let userId;

  if (existingUser.length) {
    userId = existingUser[0].user_id;
    await pool.query(
      `
      UPDATE users
      SET shopify_shop_domain = ?, shopify_access_token = ?, shopify_installed_at = NOW()
      WHERE user_id = ?
    `,
      [shop, accessToken, userId]
    );
  } else {
    const [result] = await pool.query(
      `
      INSERT INTO users (username, email, password, api_key, shopify_shop_domain, shopify_access_token, shopify_installed_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `,
      [username, email, hashedPassword, encryptedKey, shop, accessToken]
    );
    userId = result.insertId;
  }

  await pool.query(
    `
    INSERT INTO shopify_installs (shop, access_token, user_id, installed_at)
    VALUES (?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      access_token = VALUES(access_token),
      user_id = VALUES(user_id),
      installed_at = NOW()
  `,
    [shop, accessToken, userId]
  );

  return userId;
}

const handleSendNewUserEmail = async (rawKey, email) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your Account Password for Our App",
    html: `
     <div style="font-family: 'Segoe UI', sans-serif; width: 90%; margin: auto; padding: 40px 30px; text-align: center; background: linear-gradient(to bottom, #0B1623, #092032); color: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 245, 212, 0.15);">

<img src="https://botassistai.com/img/BigLogo.png" alt="BotAssistAI Logo" style="width: 120px; margin-bottom: 30px;">

<h1 style="color: #00F5D4; font-size: 34px; font-weight: 700;">Hey there!</h1>

<p style="color: #cccccc; font-size: 17px; margin-bottom: 20px;">
Your <strong>account </strong> has been created. Here is your temporary password:  
<br />
<strong>${rawKey}</strong>
</p>


<h3 style="color: #00F5D4; font-size: 22px;">Please log in and change your password in the settings for security.</h3>



<p style="margin-top: 35px; font-size: 14px; color: #aaa;">Questions? <a href="mailto:support@botassistai.com" style="color: #00F5D4; text-decoration: none;">Contact Support</a></p>

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
You received this email because you have an account with us. 
<a href="https://botassistai.com/unsubscribe" style="color: #ff5e5e; text-decoration: none;">Unsubscribe</a>
</p>
</div>


    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('❌ Error sending password email:', error);
    }
    console.log('✅ Password email sent:', info.response);
  });

}

// asta nu mai este folosita
app.get("/auth/callback", async (req, res) => {
  try {
    const result = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
      isOnline: true,
    });

    const session = result.session;

    if (!session || !session.shop || !session.accessToken) {
      console.log("❌ Missing session data");
      return res.status(400).send("Session missing required data.");
    }

    const shop = session.shop;
    const accessToken = session.accessToken;

    // ✅ Store session
    const { storeCallback } = require("./sessionStorage");
    await storeCallback(session);
    await registerGdprWebhooks(session, shop);


    // ✅ Fetch shop data from Shopify
    const client = new shopify.clients.Rest({ session });
    const response = await client.get({ path: "shop" });

    if (!response || !response.body || !response.body.shop) {
      console.error("❌ Invalid response from Shopify API when fetching shop info", response);
      return res.status(500).send("Failed to fetch shop info from Shopify.");
    }

    const shopData = response.body.shop;

    const email = shopData?.email || `${shop}`;
    const username = shopData?.name || shop;
    const domain = shop;
    const rawKey = Math.random().toString(36).slice(-8);
    const toEncryptKey = uuidv4();
    const encryptedKey = encryptApiKey(toEncryptKey);
    const hashedPassword = await bcrypt.hash(rawKey, 10); 

    const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);


    let user;
    if (existingUser.length > 0) {
      user = existingUser[0];
      console.log("✅ Existing Shopify user found:", user.username);
    
      await pool.query(`
        UPDATE users
        SET shopify_shop_domain = ?, shopify_access_token = ?, shopify_installed_at = NOW()
        WHERE user_id = ?
      `, [shop, accessToken, user.user_id]);
    
    } else {
      // Create user with Shopify fields
      await pool.query(`
        INSERT INTO users (username, email, password, api_key, shopify_shop_domain, shopify_access_token, shopify_installed_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [username, email, hashedPassword, encryptedKey, shop, accessToken]);
    
      const [newUserResult] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
      user = newUserResult[0];
      console.log("✅ New Shopify user created:", user.username);

     

    }


    req.logIn(user, async (err) => {
      if (err) {
        console.error("Login error after Shopify auth:", err);
        return res.status(500).send("Failed to log in after registration.");
      }

      // ✅ Log install in `shopify_installs` table
      await pool.query(`
        INSERT INTO shopify_installs (shop, access_token, user_id, installed_at)
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE access_token = VALUES(access_token), user_id = VALUES(user_id)
      `, [shop, accessToken, user.user_id]);

      // ✅ Redirect into app
      const redirectUrl = `/?shop=${shop}&host=${req.query.host}&shopifyUser=true`;

      res.set("Content-Type", "text/html");
      res.send(`
        <script src="https://unpkg.com/@shopify/app-bridge"></script>
        <script>
          const AppBridge = window["app-bridge"].default;
          const actions = window["app-bridge"].actions;
          const app = AppBridge({
            apiKey: "${process.env.SHOPIFY_API_KEY}",
            host: "${req.query.host}",
            forceRedirect: true
          });
          const redirect = actions.Redirect.create(app);
          redirect.dispatch(actions.Redirect.Action.REMOTE, "${redirectUrl}");
        </script>
      `);
    });
  } catch (err) {
    console.error("❌ Callback error:", err);
    if (!res.headersSent) {
      res.status(500).send("OAuth callback failed.");
    }
  }
});



function verifyWebhookRaw(req, secret) {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  const body = req.body;

  if (!hmacHeader || !Buffer.isBuffer(body)) {
    console.error("❌ Missing HMAC header or body is not Buffer");
    return false;
  }

  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(hmacHeader, 'base64'),
    Buffer.from(hash, 'base64')
  );
}


app.post('/shopify/gdpr/customers/data_request', express.raw({ type: 'application/json' }), (req, res) => {
  if (!verifyWebhookRaw(req, process.env.SHOPIFY_API_SECRET)) {
    return res.status(401).send('Invalid HMAC');
  }
  const parsed = JSON.parse(req.body.toString('utf8'));
  console.log("📦 GDPR: Customer Data Request", parsed);
  res.sendStatus(200);
});

app.post('/shopify/gdpr/customers/redact', express.raw({ type: 'application/json' }), (req, res) => {
  if (!verifyWebhookRaw(req, process.env.SHOPIFY_API_SECRET)) {
    return res.status(401).send('Invalid HMAC');
  }
  const parsed = JSON.parse(req.body.toString('utf8'));
  console.log("🗑️ GDPR: Customer Redact Request", parsed);
  res.sendStatus(200);
});

app.post('/shopify/gdpr/shop/redact', express.raw({ type: 'application/json' }), (req, res) => {
  if (!verifyWebhookRaw(req, process.env.SHOPIFY_API_SECRET)) {
    return res.status(401).send('Invalid HMAC');
  }
  const parsed = JSON.parse(req.body.toString('utf8'));
  console.log("🏪 GDPR: Shop Redact Request", parsed);
  res.sendStatus(200);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.get("/api/ping", async (req, res) => {
  try {
    const sessionId = await shopify.auth.session.getCurrentId({
      isOnline: true,
      rawRequest: req,
      rawResponse: res,
    });

    if (!sessionId) return res.status(401).json({ error: "Unauthorized" });

    const session = await shopify.sessionStorage.loadSession(sessionId);
    if (!session) return res.status(401).json({ error: "Session not found" });

    res.status(200).json({ ok: true, shop: session.shop });
  } catch (err) {
    console.error("❌ Auth check failed:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.get("/auth/toplevel", (req, res) => {
  const { shop } = req.query;
  if (!shop || !shop.endsWith(".myshopify.com")) {
    return res.status(400).send("Invalid shop");
  }

  res.setHeader("Content-Type", "text/html");
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" /></head>
      <body>
        <script type="text/javascript">
          if (window.top === window.self) {
            document.cookie = "shopify_toplevel=true; path=/; Secure; SameSite=None";
            window.location.href = "/shopify/install?shop=${encodeURIComponent(shop)}";
          } else {
            window.top.location.href = "/auth/toplevel?shop=${encodeURIComponent(shop)}";
          }
        </script>
      </body>
    </html>
  `);
});

app.get("/shopify/install", async (req, res) => {
  const { shop } = req.query;
  if (!shop || !shop.endsWith(".myshopify.com")) {
    return res.status(400).send("Invalid shop");
  }

  // 🧠 Ensure cookie present
  const cookieHeader = req.headers.cookie || "";
  console.log("🔍 install cookies:", cookieHeader);
  if (!cookieHeader.includes("shopify_toplevel=true")) {
    console.log("🧭 Missing top-level cookie — redirecting to /auth/toplevel");
    return res.redirect(`/auth/toplevel?shop=${encodeURIComponent(shop)}`);
  }

  try {
    console.log(`🛠️ Starting OAuth for ${shop}`);
    await shopify.auth.begin({
      shop,
      callbackPath: "/shopify/callback",
      isOnline: true,
      rawRequest: req,
      rawResponse: res,
    });
    return
  } catch (err) {
    console.error("❌ shopify.auth.begin failed:", err);
    if (!res.headersSent) res.status(500).send("Failed to start OAuth");
  }
});


app.use((req, res, next) => {
  console.log("🔍 Cookies received:", req.cookies);
  next();
});


app.get('/shopify/callback', async (req, res) => {
  try {
    res.setHeader("Set-Cookie", "shopify_toplevel=true; path=/; Secure; SameSite=None");

    const { session } = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
      isOnline: true,
    });

    if (!session?.shop || !session?.accessToken) {
      return res.status(400).send('Session missing required data.');
    }

    const shop = session.shop;
    const host = req.query.host;

    // --- Fetch shop info
    const client = new shopify.clients.Rest({ session });
    const shopInfo = (await client.get({ path: 'shop' })).body.shop || {};
    const email = shopInfo.email || shop;
    const username = shopInfo.name || shop;

    // --- Find or create user
    let [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    let user;
    if (existing.length > 0) {
      user = existing[0];
      await pool.query(
        `UPDATE users SET shopify_shop_domain=?, shopify_access_token=?, shopify_installed_at=NOW() WHERE user_id=?`,
        [shop, session.accessToken, user.user_id]
      );
    } else {
      const rawKey = Math.random().toString(36).slice(-8);
      const toEncryptKey = uuidv4();
      const encryptedKey = encryptApiKey(toEncryptKey);
      const hashedPassword = await bcrypt.hash(rawKey, 10);

      await pool.query(
        `INSERT INTO users (username, email, password, api_key, shopify_shop_domain, shopify_access_token, shopify_installed_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [username, email, hashedPassword, encryptedKey, shop, session.accessToken]
      );

      const [newUserResult] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
      user = newUserResult[0];
/*
      try {
        await handleSendNewUserEmail(rawKey, email);
      } catch (err) {
        console.error("❌ Failed to send new user email:", err);
      }

      SA FAC UPDATE DACA VREAU
        */
    }

    // --- Log the user in via Passport BEFORE redirect
    await new Promise((resolve, reject) => {
      req.logIn(user, (err) => {
        if (err) return reject(err);
        req.session.save((saveErr) => {
          if (saveErr) return reject(saveErr);
          resolve();
        });
      });
    });

    console.log(`✅ User ${user.email} logged in`);

    // --- Save install info
    await pool.query(
      `INSERT INTO shopify_installs (shop, access_token, user_id, installed_at)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE access_token=VALUES(access_token), user_id=VALUES(user_id)`,
      [shop, session.accessToken, user.user_id]
    );

    // --- Async background tasks
    (async () => {
      try {
        const { storeCallback } = require('./sessionStorage');
        await storeCallback(session);
        await registerGdprWebhooks(session, shop);

        // --- Register ScriptTag to load chatbot on storefront
        const scriptClient = new shopify.clients.Rest({ session });
        await scriptClient.post({
          path: "script_tags",
          data: {
            script_tag: {
              event: "onload",
              src: `https://api.botassistai.com/chatbot-loader.js?shop=${shop}`,
            },
          },
          type: "application/json",
        });

        console.log(`✅ Setup complete & ScriptTag installed for ${shop}`);
      } catch (err) {
        console.error('❌ Post-redirect setup error:', err);
      }
    })();
    
    const encodedHost = host || "";
    const appBridgeRedirectScript = `
      <script src="https://unpkg.com/@shopify/app-bridge@3"></script>
      <script>
        (function(){
          function safeTopRedirect(url) { try { window.top.location.href = url; } catch(e) { window.location.href = url; } }

          // If host param exists, try App Bridge redirect into Admin iframe
          if ("${encodedHost}") {
            try {
              const AppBridge = window['app-bridge'];
              if (!AppBridge) {
                // initialize minimal App Bridge object if needed
                var createApp = window["app-bridge"]?.default || window["app-bridge"];
              }
              const app = AppBridge.createApp({ apiKey: "${process.env.SHOPIFY_API_KEY}", host: "${encodedHost}" });
              const actions = AppBridge.actions;
              const Redirect = actions.Redirect;
              const redirect = Redirect.create(app);
              // Redirect into embedded app path
              redirect.dispatch(Redirect.Action.APP, "/dashboard");
              return;
            } catch (e) {
              console.error("App Bridge redirect failed:", e);
            }
          }

          // Fallback to top-level external dashboard
          safeTopRedirect("https://www.botassistai.com/${encodeURIComponent(/* user username should be inserted server-side */"REPLACE_USERNAME")}/dashboard?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(encodedHost)}");
        })();
      </script>
    `;

    // IMPORTANT: replace REPLACE_USERNAME with server-side username variable before sending
    // e.g. if you have user.username:
    // const html = appBridgeRedirectScript.replace("REPLACE_USERNAME", encodeURIComponent(user.username))
    // then send that html.

    // send the final redirect script (server must replace username)
    res.status(200).send(appBridgeRedirectScript.replace("REPLACE_USERNAME", encodeURIComponent(user?.username)));
 } catch (err) {
    console.error('❌ Shopify callback error:', err);
    if (!res.headersSent) res.status(500).send('OAuth callback failed.');
  }
});

// Fix cookies for Shopify OAuth
app.use((req, res, next) => {
  res.setHeader("P3P", 'CP="Not used"');
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  next();
});





app.post('/shopify/session-attach', (req, res) => {
  console.log("📦 Received body in session-attach:", req.body);

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  req.session.userId = userId;
  console.log("✅ Attached userId to session:", userId);

  return res.status(200).json({ success: true });
});




app.post("/paypal/webhook", async (req, res) => {
  const { orderID, userId } = req.body;


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
      `SELECT user_id, email FROM users 
       WHERE subscription_plan != 'free' 
       AND subscription_expiry IS NOT NULL 
       AND subscription_expiry <= NOW()`
    );

    if (usersToDowngrade.length > 0) {

  const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
          },
        });

      for (const user of usersToDowngrade) {
        await pool.query(
          "UPDATE users SET subscription_plan = 'free' WHERE user_id = ?",
          [user.user_id]
        );
        console.log(`🔻 Downgraded user ${user.user_id} to free`);

    
        const mailOptions = {
          from: process.env.EMAIL,
          to: user.email,
          subject: "Your BotAssistAI Premium Plan Has Expired",
          html: `
           <div style="font-family: 'Segoe UI', sans-serif; width: 90%; margin: auto; padding: 40px 30px; text-align: center; background: linear-gradient(to bottom, #0B1623, #092032); color: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 245, 212, 0.15);">

  <img src="https://botassistai.com/img/BigLogo.png" alt="BotAssistAI Logo" style="width: 120px; margin-bottom: 30px;">

  <h1 style="color: #00F5D4; font-size: 34px; font-weight: 700;">Hey there!</h1>

  <p style="color: #cccccc; font-size: 17px; margin-bottom: 20px;">
    Your <strong>BotAssistAI Premium</strong> plan has recently expired.  
    You’ve been moved to our <span style="color: #00F5D4;">Free Plan</span>. Your data is still secure, and you can upgrade again at any time.
  </p>

  <div style="background-color: #112B3C; padding: 20px; border-radius: 12px; margin: 30px 0;">
      <h3 style="color: #00F5D4; font-size: 22px;">What You’re Currently Missing:</h3>
      <ul style="list-style-type: none; padding: 0; margin-top: 15px;">
          <li style="margin: 12px 0; font-size: 16px;">• Unlimited conversations</li>
          <li style="margin: 12px 0; font-size: 16px;">• Advanced Bot Analytics</li>
          <li style="margin: 12px 0; font-size: 16px;">• Fully Brand Customizable</li>
          <li style="margin: 12px 0; font-size: 16px;">• Early Access to New Features</li>
          <li style="margin: 12px 0; font-size: 16px;">• Smart FAQ Upload</li>
      </ul>
  </div>

  <p style="font-size: 16px; margin-bottom: 30px;">
      Want to regain your <strong style="color: #00F5D4;">Premium features</strong>? Upgrade now and unlock full access.
  </p>

  <a href="https://botassistai.com/pricing" 
     style="display: inline-block; padding: 14px 30px; font-size: 16px; color: #000; background: #00F5D4; border-radius: 30px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 12px rgba(0, 245, 212, 0.4);">
     Upgrade to Premium
  </a>

  <p style="margin-top: 35px; font-size: 14px; color: #aaa;">Questions? <a href="mailto:support@botassistai.com" style="color: #00F5D4; text-decoration: none;">Contact Support</a></p>

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
    You received this email because you have an account with us. 
    <a href="https://botassistai.com/unsubscribe" style="color: #ff5e5e; text-decoration: none;">Unsubscribe</a>
  </p>
</div>


          `,
        };
      
        try {
          await transporter.sendMail(mailOptions);
          console.log(`📩 Email sent to ${user.email}`);
        } catch (err) {
          console.error(`❌ Failed to send email to ${user.email}:`, err);
        }
      }  
      
    } else {
      console.log("✅ No users to downgrade today.");
    }
  } catch (err) {
    console.error("❌ Cron job error:", err);
  }
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
    if (!user) return res.status(401).json({ error: "Invalid API key67" });

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
  const [rows] = await pool.query("SELECT subscription_plan, shopify_access_token FROM users WHERE user_id = ?", [userId])
  return res.status(200).json({ message: rows[0] })
} catch(e) {
  console.log("Error occured with retreving membership", e)
  return res.status(500).json({ message: "Error occured with retreving membership"})
}
})



// DACA TOT NU MERGE , SA COMENTEZ LINILE ASTEA SI SA VAD CUM 


//si sa vad ce zice pe chatgpt


app.post("/create-subscription2", async (req, res) => {
  try {
    const { userId } = req.body;

    // Lookup user/shop from DB
    const [rows] = await pool.query("SELECT * FROM users WHERE user_id=?", [userId]);
    if (rows.length === 0) return res.status(404).send("User not found");

    const user = rows[0];
    const shop = user.shopify_shop_domain;
    const token = user.shopify_access_token;

    // GraphQL mutation
    const query = `
      mutation AppSubscriptionCreate($name: String!, $returnUrl: URL!, $lineItems: [AppSubscriptionLineItemInput!]!) {
        appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems, test: true) {
          userErrors {
            field
            message
          }
          appSubscription {
            id
            name
          }
          confirmationUrl
        }
      }
    `;

    const variables = {
      name: "BotAssist Pro Plan",
      returnUrl: `https://api.botassistai.com/billing/callback?userId=${userId}`,
      lineItems: [
        {
          plan: {
            appRecurringPricingDetails: {
              price: {
                amount: 19.99,
                currencyCode: "EUR",
              },
              interval: "EVERY_30_DAYS",
            },
          },
        },
      ],
    };

    const response = await axios.post(
      `https://${shop}/admin/api/2025-01/graphql.json`,
      { query, variables },
      {
        headers: {
          "X-Shopify-Access-Token": token,
          "Content-Type": "application/json",
        },
      }
    );

    const { data } = response.data;
    const errors = data.appSubscriptionCreate.userErrors;

    if (errors.length > 0) {
      console.error("Shopify errors:", errors);
      return res.status(400).json({ errors });
    }

    const confirmationUrl = data.appSubscriptionCreate.confirmationUrl;
    res.json({ confirmationUrl });

  } catch (err) {
    console.error("❌ Error creating subscription:", err.response?.data || err.message);
    res.status(500).send("Failed to create subscription");
  }
});

app.get("/billing/callback", async (req, res) => {
  try {
    const { userId, host } = req.query;

    const [rows] = await pool.query("SELECT * FROM users WHERE user_id=?", [userId]);
    if (rows.length === 0) return res.status(404).send("User not found");

    await pool.query(
      "UPDATE users SET subscription_plan='Pro', subscribed_at=NOW() WHERE user_id=?",
      [userId]
    );

    // Redirect back into Shopify iframe
    res.redirect(
      `https://admin.shopify.com/store/${rows[0].shopify_shop_domain.split(".")[0]}/apps/${process.env.SHOPIFY_APP_HANDLE}?shop=${rows[0].shopify_shop_domain}&host=${host}`
    );    
  } catch (err) {
    console.error("❌ Billing callback failed:", err.response?.data || err.message);
    res.status(500).send("Billing callback failed");
  }
});












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
      const { apiKey, message, model = "gpt-4o-mini", temperature = 0.1, ...updates } = req.body;
 
      const [users] = await pool.query("SELECT * FROM users")
      const user = users.find((u) => {
        try {
          return decryptApiKey(u.api_key) === apiKey;
        } catch (e) {
          return false;
        }
      });
  
  
      if (!user) {
        console.log("Invalid API keyiuioho")
        return res.status(403).json({ error: "Invalid API keyiuioho" });
      }
  
  
  const userId = user.user_id
  user_id = userId
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
        console.log("Invalid API key65")
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
  


      let systemPrompt = `
      You are a helpful, concise AI chatbot for customer support on this website: ${webUrl}.
      Keep answers short (under 30 words), friendly, and direct.
      
      Be specific with your answers and make them very undestable for the person asking you.

      Only answer questions related to this website or its products/services. Politely decline unrelated topics.And be sure of what that bussines does , like they either sell products or provide services.
      
      If a user asks a broad or general question, use product categories relevant to the business context: ${business_context}.
      
      Never say “I’m not sure.” Always be helpful, even with minimal input.
      
      Do not assist with specific order issues. Instead say: "Have you completed all the steps correctly, including payment and confirmation?"
      
      Also if you get asked a question about a product or service I need you to go to that product/service on ${webUrl}, find it, and give it back to the person asked about that product.
      
      Give your absolute best to staisfy the customer and answer his questions or requiremnts in the best way possible.

      And don't say in the answer that you give back "you can check out our website for more" because you are already on the website and that answer is no useful to the customer, you go to this ${webUrl} and check what the customer asked you.
      `;

     
      if (businessName) {
          userMessage = `Hello ${businessName},\n` + userMessage;
          systemPrompt += `\nThis chatbot represents the business: ${businessName}.`;
      }
      

      if (business_context) {
          userMessage = `Context: ${business_context}\nUser: ${message}`;
          systemPrompt += `\nThis business context is important: ${business_context}. Tailor all responses accordingly.`;
      }
  
      if (avoid_topics) {
          userMessage += `\n(Note: Avoid discussing these topics: ${avoid_topics})`;
      }
  
      
  
      if (languages_supported) {
          userMessage += `\n(Preferred languages: ${languages_supported})`;
      }
      if (businessName) {
        systemPrompt += `\nThis chatbot represents the business: ${businessName}.`;
    }
  
      if (uploaded_file) {
          userMessage += `\n(Additional info from uploaded file: ${uploaded_file})`;
          systemPrompt += `\nThis info from the user may be relevant: ${uploaded_file}`;
      }
  
      if (webUrl) {
        userMessage += `\n(Reference URL: ${webUrl})`;
        systemPrompt += `\nAnswer only questions related to the website: ${webUrl}.`;
    }
    
  
   
    if (languages_supported) {
      systemPrompt += `\nThe chatbot should prefer responding in these languages: ${languages_supported}.`;
  }
  
    
  
      if (response_tone) {
          systemPrompt += `\nRespond in a ${response_tone} tone.`;
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
  

      systemPrompt += `
Avoid vague answers. Provide clear value in every reply.
Use product or service examples that match the business type.
Never refer users to another page unless explicitly asked.`;



      const startTime = Date.now();
  
      const response = await openai.chat.completions.create({
          model: model,
          messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage }
          ],
          temperature: temperature,
          max_tokens: 40
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
  return res.status(403).json({ error: "Invalid API key6." });
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
    
    let user = null;
    for (const u of users) {
      try {
        if (!u.api_key) continue;
        if (decryptApiKey(u.api_key) === apiKey) {
          user = u;
          break;
        }
      } catch (decryptErr) {
        console.error("Error decrypting api_key for user_id", u.user_id, decryptErr);
      }
    }

    if (!user) {
      return res.status(403).json({ connected: false, message: "API key not found" });
    }

    await pool.query('UPDATE users SET last_connected = NOW() WHERE user_id = ?', [user.user_id]);

    return res.status(200).json({ connected: true });

  } catch (e) {
    console.error("Error checking if the api is connected:", e);
    return res.status(500).json({ connected: false, error: e.message });
  }
});


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
    const now = new Date();
    const expiry = new Date(now);
    expiry.setDate(now.getDate() + 30);
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (username, email, password, api_key) 
       VALUES (?, ?, ?, ?)`,
      [username, email, hashedPassword, encryptedKey]
    );

    // Fetch the newly created user (you may already have this from the INSERT if returning user_id)
    const [userResult] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = userResult[0];
 

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

      const now = new Date();
const expiry = new Date(now);
expiry.setDate(now.getDate() + 30);

const [result] = await pool.query(
  `INSERT INTO users (username, email, google_id, api_key) 
   VALUES (?, ?, ?, ?)`,
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



// ADMIN STUFF

app.get("/admin-daily-conversations", async (req, res) => {
  const { key } = req.query;
  try {
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }

    const query = `
    SELECT COUNT(*) AS total_messages
    FROM chat_messages
    WHERE timestamp >= CURDATE()
  `;

  const [result] = await pool.query(query);

  res.json({ totalMessages: result[0]?.total_messages || 0 });
  } catch (e) {
    console.log("BAckend error trrying to receive the number of converrsations", e)
    return res.status(500).json({ message: "An error occured getting daily conv num"})
  }
})

app.get("/admin-users-count" , async (req, res) => {
  const { key } = req.query;
  try {
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const query = `SELECT COUNT(*) AS total_users FROM users`;
  const [result] = await pool.query(query);

  res.json({ totalUsers: result[0]?.total_users || 0 });
  } catch (e) {
    console.log("BAckend error trrying to receive the users count", e)
    return res.status(500).json({ message: "An error occured getting daily conv num"})
  }
})

app.get("/admin-users-pro" , async (req, res) => {
  const { key } = req.query;
  try {
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const query = `
  SELECT COUNT(*) AS pro_users_count
  FROM users
  WHERE subscription_plan = 'Pro';

  `;
  const [result] = await pool.query(query);

  res.json({ proUsers: result[0]?.pro_users_count || 0 });
  } catch (e) {
    console.log("BAckend error trrying to receive the users pro accounts", e)
    return res.status(500).json({ message: "An error occured getting daily conv num"})
  }
})

app.get("/admin-users-free" , async (req, res) => {
  const { key } = req.query;
  try {
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const query = `
  SELECT COUNT(*) AS free_users_count
  FROM users
  WHERE subscription_plan = 'Free';
  `;
  const [result] = await pool.query(query);

  res.json({ freeUsers: result[0]?.free_users_count || 0 });
  } catch (e) {
    console.log("BAckend error trrying to receive the users free accounts", e)
    return res.status(500).json({ message: "An error occured getting free accounts"})
  }
})

app.get("/admin-messages", async (req, res) => {
  const { key, page = 1, limit = 20 } = req.query;

  try {
    if (key !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [result] = await pool.query(
      `SELECT * FROM user_messages ORDER BY id DESC LIMIT ? OFFSET ?`,
      [parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM user_messages`
    );

    res.json({ messages: result, total });
  } catch (e) {
    console.log("Backend error retrieving messages:", e);
    return res.status(500).json({ message: "An error occurred fetching messages" });
  }
});

app.get("/admin-delete-message", async (req, res) => {
  const { key, id } = req.query;
  try {
    if (key !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ error: "Forbidden" });
    }
    await pool.query("DELETE FROM user_messages WHERE id = ?", [id])
  } catch(e) {
    console.log("BAckend error trrying to delete the message", e)
    return res.status(500).json({ message: "An error occured trrying to delete the message"})
  }
})

app.get("/change-membership", async (req, res) => {
  const { id, email, membershipType, expiryDate } = req.query;

  try {
    if (membershipType === "Pro") {
      if (!expiryDate) {
        return res.status(400).json({ message: "Expiry date is required for Pro membership" });
      }

      const formattedDate = new Date(expiryDate);
      await pool.query(
        "UPDATE users SET subscription_plan = ?, subscription_expiry = ? WHERE user_id = ? AND email = ?",
        [membershipType, formattedDate, id, email]
      );

      return res.status(200).json({ message: "User successfully set to Pro" });
    } else {
      await pool.query(
        "UPDATE users SET subscription_plan = ?, subscription_expiry = NULL WHERE user_id = ? AND email = ?",
        [membershipType, id, email]
      );
      return res.status(200).json({ message: "User successfully set to Free" });
    }
  } catch (e) {
    console.log("An error occurred changing the user membership", e);
    return res.status(500).json({ message: "An error occurred changing the user membership" });
  }
});

app.get("/get-shopify-users-count", async (req, res) => {
  try{
    const query = `
    SELECT COUNT(*) AS shopify_users
    FROM users
    WHERE shopify_shop_domain IS NOT NULL;
    `;
    const [result] = await pool.query(query);
  
    res.json({ count: result[0]?.shopify_users || 0 });
  } catch(e) {
    console.log("An error occured while trying to get the shopify users count", e);
    return res.status(500).json({ count: 0})
  }
})

app.get("/admin-unresolved-queries", async (req, res) => {
  try {
    const query = `
    SELECT COUNT(*) AS count FROM unresolved_queries
    `
    const [result] = await pool.query(query);
  
    res.json({ count: result[0]?.count || 0 });
  } catch (e) {
    console.log("An error occured fetching the unresolved queries", e)
    return res.status(500).json({ count: 0})
  }
})

app.get("/admin-convs", async (req, res) => {
  try {
    const query = `
    SELECT COUNT(*) AS count FROM chat_messages
    `
    const [result] = await pool.query(query);
  
    res.json({ count: result[0]?.count || 0 });
  } catch(e) {
    console.log("An error occured fetching the total num of conversations", e)
    return res.status(500).json({ count: 0})
  }
})

app.get("/admin-suggestions", async (req, res) => {
  try{
    const [response] = await pool.query("SELECT * FROM suggestions")
    return res.status(200).json({ suggestions: response})
  } catch(e) {
    console.log("Error occured trying to fetch suggetsions", e)
    return res.status(500).json({ suggestions: []})
  }
})

app.get("/delete-suggestion", async (req, res) => {
  const { id } = req.query
  try{
    await pool.query("DELETE FROM suggestions WHERE id = ?", [id]);
    res.status(200)
  } catch (e) {
    console.log("Error occured while trying to delete suggestion", e)
    return res.status(500)
  }
})

app.get("/download-newsletter-emails", async (req, res) => {
  try {
    const [results] = await pool.query("SELECT email FROM newsletter");

    const csv = results.map(row => row.email).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=newsletter_emails.csv");
    res.send(csv);
  } catch (e) {
    console.error("Error exporting newsletter emails:", e);
    res.status(500).send("Internal server error");
  }
});

app.get("/download-users-emails", async (req, res) => {
  try {
    const [results] = await pool.query("SELECT email FROM users");

    const csv = results.map(row => row.email).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users_emails.csv");
    res.send(csv);
  } catch (e) {
    console.error("Error exporting users emails:", e);
    res.status(500).send("Internal server error");
  }
});

app.get("/download-users-emails-pro", async (req, res) => {
  try {
    const [results] = await pool.query("SELECT email FROM users WHERE subscription_plan = ?", ['Pro']);

    const csv = results.map(row => row.email).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users_emails_pro.csv");
    res.send(csv);
  } catch (e) {
    console.error("Error exporting users emails:", e);
    res.status(500).send("Internal server error");
  }
});

app.get("/download-users-emails-free", async (req, res) => {
  try {
    const [results] = await pool.query("SELECT email FROM users WHERE subscription_plan = ?", ['Free']);

    const csv = results.map(row => row.email).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users_emails_free.csv");
    res.send(csv);
  } catch (e) {
    console.error("Error exporting users emails:", e);
    res.status(500).send("Internal server error");
  }
});

app.get("/admin-user-id", async (req, res) => {
  const {email} = req.query;
  try {
    const [response] = await pool.query("SELECT * FROM users WHERE email = ?", [email])
    return res.status(200).json({ id: response})
  } catch(e) {
    console.log("Error occured fetching the userId", e)
    return res.status(500).json({ id: []})
  }
})

app.get("/admin-latest-users", async (req, res) => {
  const { key } = req.query;
  try {
    if (key !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const [response] = await pool.query("SELECT * FROM users ORDER BY created_at DESC LIMIT 5");
    return res.status(200).json({ users: response})
  } catch(e) {
    console.log("An error occured fetching the latest users", e)
    return res.status(500).json({ error: "An error occured fetching the latest users"})
  }
})

app.get("/satisfaction-admin", async (req, res) => {
  
  try {
    const [response] = await pool.query("SELECT * FROM customer_feedback");
    return res.status(200).json({ message: response})
  } catch (e) {
    console.log("Error occured with getting user satisfaction from the database");
    return res.status(500).json({ message: "Error"})
  }
  })

  app.post("/chatbot-config-shopify", async (req, res) => {
    const { shop, colors } = req.body;
  try {
    const {
      background,
      chatbotBackground,
      chatBoxBackground,
      chatInputBackground,
      chatInputTextColor,
      chatBtn,
      websiteChatBtn,
      websiteQuestion,
      needHelpTextColor,
      textColor,
      borderColor
    } = colors;

    const query = `
      INSERT INTO shopify_customization 
        (shop, background, chatbotBackground, chatBoxBackground, chatInputBackground, chatInputTextColor, chatBtn, websiteChatBtn, 
         websiteQuestion, needHelpTextColor, textColor, borderColor) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        background = VALUES(background),
        chatbotBackground = VALUES(chatbotBackground),
        chatBoxBackground = VALUES(chatBoxBackground),
        chatInputBackground = VALUES(chatInputBackground),
        chatInputTextColor = VALUES(chatInputTextColor),
        chatBtn = VALUES(chatBtn),
        websiteChatBtn = VALUES(websiteChatBtn),
        websiteQuestion = VALUES(websiteQuestion),
        needHelpTextColor = VALUES(needHelpTextColor),
        textColor = VALUES(textColor),
        borderColor = VALUES(borderColor)
    `;

    await pool.query(query, [
      shop,
      background,
      chatbotBackground,
      chatBoxBackground,
      chatInputBackground,
      chatInputTextColor,
      chatBtn,
      websiteChatBtn,
      websiteQuestion,
      needHelpTextColor,
      textColor,
      borderColor
    ]);

    return res.status(200).json({data: true})
  } catch(e) {
    console.log("An error occured while trying to send the chatbot config", e)
    return res.status(500).json({data: false})
  }
})

app.get("/check-shopify-user", async (req, res) => {
  const { id } = req.query;
  try {
    const [rows] = await pool.query(
      "SELECT shopify_access_token FROM users WHERE user_id = ?", 
      [id]
    );
    if (rows.length && rows[0].shopify_access_token) {
      return res.json({ data: true, domain: rows[0].shopify_access_token });
    } else {
      return res.json({ data: false, domain: "" });
    }    
  } catch(e) {
    console.log("An error occured checking the shopify user", e)
    return res.status(500).json({ data: false, domain: ""})
  }
})

app.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      return res.json({ message: "Logged out successfully" });
    });
  });
  });



app.get("/get-shopify-styles", async (req, res) => {
  const { shop } = req.query;
  try {
    const [response] = await pool.query("SELECT * FROM shopify_customization WHERE shop = ?", [shop])

    if (!response.length) {
      return res.status(404).json({ error: "No customization found for this shop." });
    }
    
    return res.status(200).json({ data: response[0]})
  } catch(e) {
    console.log("Error occured while trying to fetch the shopify styles", e)
    return res.status(500)
  }
})

app.listen(8090)