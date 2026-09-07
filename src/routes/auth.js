import express from 'express';
import {User } from '../models/index.js';
import bcrypt from 'bcrypt';

const router = express.Router();

router.post("/login", async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" })
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid email or password" })
        }

        req.session.user = {
            id: user._id || user.id,
            email: user.email,
            username: user.username
        };

        return res.status(200).json({ message: "Login successful", userId: user.id, username: user.username, email: user.email })

    } catch (error) {
        res.status(400).json({ error: "Internal Server Error" })
    }
});


router.get("/logout", async (req, res) => {

    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out, please try again.' });
        }
        res.clearCookie('connect.sid'); 
        return res.status(200).json({ message: 'Logged out successfully.' });
    });

});

router.post("/register", async (req, res) => {
    try {

        const { username, email, password, termsAccepted } = req.body;

        if (!termsAccepted) {
            return res.status(400).json({ error: 'Please accept the terms and conditions.' });
        }

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const isAlreadyRegistered = await User.findOne({ where: { email } });

        if (isAlreadyRegistered) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ username, email, password: hashedPassword, termsAccepted });

        if (!newUser) {
            return res.status(500).json({ error: 'Failed to create user.' });
        }

        req.session.user = {
            id: newUser._id || newUser.id,
            email: newUser.email,
            username: newUser.username
        };
        return res.status(201).json({ message: 'User registered successfully', data: newUser });

    } catch (error) {

        return res.status(500).json({
            error: "Internal Server Error",
            message: error.message,
        });
    }
});


router.get("/me", (req, res) => {
  if (req.session && req.session.user) {
    return res.status(200).json({ user: req.session.user });
  }
  return res.status(401).json({ error: "Not authenticated" });
});

export default router;