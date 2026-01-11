
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 5000;
const JWT_SECRET = 'system-secret-key-change-this-in-prod';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for large history data

// User Schema & Model
// 'minimize: false' is CRITICAL. Without it, Mongoose discards empty objects, causing data loss.
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    history: { type: mongoose.Schema.Types.Mixed, default: {} } 
}, { minimize: false, strict: false });

const User = mongoose.model('User', UserSchema);

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/system_db')
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, history: {} });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ 
            token, 
            user: { id: newUser._id, username: newUser.username },
            history: newUser.history
        });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ 
            token, 
            user: { id: user._id, username: user.username },
            history: user.history || {}
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Data Routes
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

app.get('/api/data', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ history: user.history || {} });
    } catch (err) {
        console.error("Get Data Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/data/sync', authMiddleware, async (req, res) => {
    try {
        const { history } = req.body;
        
        // Use $set to strictly replace the history field
        // { new: true } returns the updated document (useful for debugging)
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, 
            { $set: { history: history } }, 
            { new: true, runValidators: true }
        );

        if (!updatedUser) return res.status(404).json({ message: 'User not found' });

        console.log(`[Sync] Data saved for user: ${updatedUser.username} | Keys: ${Object.keys(history).length}`);
        res.json({ success: true });
    } catch (err) {
        console.error("Sync Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
