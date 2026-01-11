
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 5000;
const JWT_SECRET = 'system-secret-key-change-this-in-prod';

// Middleware

// 1. CORS: Allow ALL origins (Vercel, Phones, Localhost)
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));

// 2. Logging: Print every request to the terminal so you know if the phone reached the computer
app.use((req, res, next) => {
    console.log(`[INCOMING] ${req.method} ${req.url} from ${req.ip}`);
    next();
});

// Root Route: For checking if server is alive via Browser/Ngrok
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: monospace; background: #05020a; color: #a855f7; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <h1>SYSTEM SERVER ONLINE</h1>
            <p style="color: #e2e8f0;">Status: Operational</p>
            <p style="color: #64748b;">Endpoint: /api</p>
        </div>
    `);
});

// Health Check Endpoint for App
app.get('/api/health', (req, res) => {
    res.json({ status: 'online', system: 'operational' });
});

// User Schema & Model
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
        console.log(`[REGISTER] Success: ${username}`);
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
        console.log(`[LOGIN] Success: ${username}`);
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
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, 
            { $set: { history: history } }, 
            { new: true, runValidators: true }
        );

        if (!updatedUser) return res.status(404).json({ message: 'User not found' });

        console.log(`[SYNC] Saved for: ${updatedUser.username} | Size: ${JSON.stringify(history).length} bytes`);
        res.json({ success: true });
    } catch (err) {
        console.error("Sync Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Listen on 0.0.0.0 to accept connections from outside the computer (Local Network)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n--- SYSTEM SERVER ONLINE ---`);
    console.log(`> Local:   http://localhost:${PORT}`);
    console.log(`> Network: Ensure you use your computer's IP (e.g. 192.168.1.5)`);
    console.log(`> Vercel:  You MUST use Ngrok for Vercel to reach this server.`);
    console.log(`----------------------------\n`);
});
