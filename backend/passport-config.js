if(process.env.NODE_ENV !== "production") {
    require("dotenv").config()
  }
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cookieParser = require("cookie-parser");
const { createPool } = require("mysql2");

const pool = createPool({
    host: "localhost",
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
}).promise()

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        try {
            const user = await getUserByEmail(email);
            if (!user) {
                return done(null, false, { message: "No user with that email" });
            }
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: "Password incorrect" });
            }
        } catch (e) {
            done(e);
        }
    };

    passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
    
    passport.serializeUser((user, done) => done(null, user.user_id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await getUserById(id);
            if (!user) {
                return done(null, false); // Prevent error if user is missing
            }
            done(null, user);
        } catch (e) {
            done(e, null);
        }
    });

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await getUserByEmail(profile.emails[0].value);
            if (!user) {
                console.log("Creating new Google user...");
                const [result] = await pool.query(
                    "INSERT INTO users (username, email, google_id) VALUES (?, ?, ?)",
                    [profile.displayName, profile.emails[0].value, profile.id]
                );
                user = { user_id: result.insertId, username: profile.displayName, email: profile.emails[0].value };
            }
            return done(null, user);
        } catch (e) {
            console.error("Error with Google authentication:", e);
            console.log("Error with Google authentication:", e);
            return done(e);
        }
    }))
}

module.exports = initialize;