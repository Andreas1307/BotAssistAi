if(process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User'); // Adjust the path according to your project structure
const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Replace with your actual client ID

router.post('/auth/google', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Replace with your actual client ID
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    // Check if user exists in your database
    let user = await User.findOne({ email });
    if (!user) {
      // Create a new user if not found
      user = await User.create({
        username: name, // or implement a more robust username generation logic
        email,
        password: 'google-auth', // Use a placeholder or generate a password (consider security implications)
      });
    }

    // Create a session or JWT for the user and respond
    req.session.user = user; // Use session or JWT as needed
    res.json({ user });
  } catch (error) {
    console.error('Error verifying Google token:', error);
    res.status(401).send('Invalid token');
  }
});

module.exports = router;
