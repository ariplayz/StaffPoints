import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 80; // As per previous request to run on port 80

// Path to data files
const DATA_DIR = process.env.DATA_DIR || path.dirname(process.env.DATA_FILE || '/var/www/staffpoints/data.json');
const DATA_FILE = process.env.DATA_FILE || path.join(DATA_DIR, 'data.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const STAFF_FILE = path.join(DATA_DIR, 'staff.json');
const WEB_ROOT = process.env.WEB_ROOT || '/var/www/staffpoints';

app.use(cors());
app.use(express.json());

// Ensure the directory exists
const ensureDirectoryExistence = (filePath) => {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    try {
        fs.mkdirSync(dirname, { recursive: true });
        return true;
    } catch (e) {
        console.error('Error creating directory:', e);
        return false;
    }
};

let activeDataDir = DATA_DIR;
if (!ensureDirectoryExistence(DATA_FILE)) {
    activeDataDir = path.join(__dirname, '..');
    console.log(`Fallback: Using local directory at ${activeDataDir}`);
}

const activeDataFile = path.join(activeDataDir, 'data.json');
const activeUsersFile = path.join(activeDataDir, 'users.json');
const activeStaffFile = path.join(activeDataDir, 'staff.json');

const JWT_SECRET = process.env.JWT_SECRET || 'staff-points-secret-2026';

// Initialize files if they don't exist
if (!fs.existsSync(activeDataFile)) {
    fs.writeFileSync(activeDataFile, JSON.stringify([], null, 2));
}

if (!fs.existsSync(activeUsersFile)) {
    // Initial admin user: admin/Password01
    const hashedPassword = bcrypt.hashSync('Password01', 10);
    const initialUsers = [{ username: 'admin', password: hashedPassword, role: 'admin' }];
    fs.writeFileSync(activeUsersFile, JSON.stringify(initialUsers, null, 2));
} else {
    // Migration: ensure all passwords are hashed
    try {
        const users = JSON.parse(fs.readFileSync(activeUsersFile, 'utf8'));
        let changed = false;
        const migratedUsers = users.map(u => {
            if (u.password && !u.password.startsWith('$2a$') && !u.password.startsWith('$2b$')) {
                u.password = bcrypt.hashSync(u.password, 10);
                changed = true;
            }
            return u;
        });
        if (changed) {
            fs.writeFileSync(activeUsersFile, JSON.stringify(migratedUsers, null, 2));
        }
    } catch (e) {
        console.error('Migration error:', e);
    }
}

if (!fs.existsSync(activeStaffFile)) {
    fs.writeFileSync(activeStaffFile, JSON.stringify([], null, 2));
}

// Helper to read/write JSON files
const readJSON = (file) => {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
        return [];
    }
};

const writeJSON = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

/**
 * Authentication endpoint
 * Generates a JWT token valid for 30 days on successful login
 */
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    const users = readJSON(activeUsersFile);
    const user = users.find(u => u.username === username);
    
    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign(
            { username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
        res.json({ username: user.username, role: user.role, token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

/**
 * Auth middleware
 * Verifies the JWT token from the Authorization header
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Authentication required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

/**
 * Admin check middleware
 * Ensures the authenticated user has the 'admin' role
 */
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
};

/**
 * Get current user info from token
 */
app.get('/api/me', authenticateToken, (req, res) => {
    res.json(req.user);
});

/**
 * User management endpoints (Admin only)
 */
app.get('/api/users', authenticateToken, isAdmin, (req, res) => {
    res.json(readJSON(activeUsersFile).map(u => ({ username: u.username, role: u.role })));
});

app.post('/api/users', authenticateToken, isAdmin, (req, res) => {
    const newUser = req.body;
    if (newUser.password) {
        newUser.password = bcrypt.hashSync(newUser.password, 10);
    }
    const users = readJSON(activeUsersFile);
    if (users.find(u => u.username === newUser.username)) {
        return res.status(400).json({ error: 'User already exists' });
    }
    users.push(newUser);
    writeJSON(activeUsersFile, users);
    res.status(201).json({ username: newUser.username, role: newUser.role });
});

app.delete('/api/users/:username', authenticateToken, isAdmin, (req, res) => {
    const { username } = req.params;
    if (username === 'admin') return res.status(400).json({ error: 'Cannot delete default admin' });
    let users = readJSON(activeUsersFile);
    users = users.filter(u => u.username !== username);
    writeJSON(activeUsersFile, users);
    res.status(204).send();
});

/**
 * Staff management endpoints
 */
app.get('/api/staff', authenticateToken, (req, res) => {
    res.json(readJSON(activeStaffFile));
});

app.post('/api/staff', authenticateToken, isAdmin, (req, res) => {
    const newStaff = req.body;
    const staff = readJSON(activeStaffFile);
    if (staff.find(s => s.name === newStaff.name)) {
        return res.status(400).json({ error: 'Staff member already exists' });
    }
    staff.push(newStaff);
    writeJSON(activeStaffFile, staff);
    res.status(201).json(newStaff);
});

app.delete('/api/staff/:name', authenticateToken, isAdmin, (req, res) => {
    const { name } = req.params;
    let staff = readJSON(activeStaffFile);
    staff = staff.filter(s => s.name !== name);
    writeJSON(activeStaffFile, staff);
    res.status(204).send();
});

/**
 * Points slips endpoints
 */
app.get('/api/slips', authenticateToken, (req, res) => {
    res.json(readJSON(activeDataFile));
});

app.post('/api/slips', authenticateToken, (req, res) => {
    const newSlip = req.body;
    const slips = readJSON(activeDataFile);
    slips.push(newSlip);
    writeJSON(activeDataFile, slips);
    res.status(201).json(newSlip);
});

// Serve static files from webroot if it exists
if (fs.existsSync(WEB_ROOT)) {
    app.use(express.static(WEB_ROOT));
}

// SPA routing - redirect all other requests to index.html if it exists
app.get('/{/*splat}', (req, res) => {
    const indexPath = path.join(WEB_ROOT, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Not found');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Saving data to: ${activeDataFile}`);
});
