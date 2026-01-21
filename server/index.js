import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Initialize files if they don't exist
if (!fs.existsSync(activeDataFile)) {
    fs.writeFileSync(activeDataFile, JSON.stringify([], null, 2));
}

if (!fs.existsSync(activeUsersFile)) {
    // Initial admin user: admin/Password01
    const initialUsers = [{ username: 'admin', password: 'Password01', role: 'admin' }];
    fs.writeFileSync(activeUsersFile, JSON.stringify(initialUsers, null, 2));
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

// Authentication endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // Hardcoded default admin that is always accepted
    if (username === 'admin' && password === 'Password01') {
        return res.json({ username: 'admin', role: 'admin' });
    }

    const users = readJSON(activeUsersFile);
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        res.json({ username: user.username, role: user.role });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Admin check middleware (optional for this simple tool, but good practice)
const isAdmin = (req) => {
    // In this simplified version, we'll let the frontend handle most UI logic,
    // but the backend should ideally verify some header/token.
    // For now, we trust the client as requested for an "unimportant tool".
    return true; 
};

// User management (Admin only)
app.get('/api/users', (req, res) => {
    res.json(readJSON(activeUsersFile).map(u => ({ username: u.username, role: u.role })));
});

app.post('/api/users', (req, res) => {
    const newUser = req.body;
    const users = readJSON(activeUsersFile);
    if (users.find(u => u.username === newUser.username)) {
        return res.status(400).json({ error: 'User already exists' });
    }
    users.push(newUser);
    writeJSON(activeUsersFile, users);
    res.status(201).json({ username: newUser.username, role: newUser.role });
});

app.delete('/api/users/:username', (req, res) => {
    const { username } = req.params;
    if (username === 'admin') return res.status(400).json({ error: 'Cannot delete default admin' });
    let users = readJSON(activeUsersFile);
    users = users.filter(u => u.username !== username);
    writeJSON(activeUsersFile, users);
    res.status(204).send();
});

// Staff management
app.get('/api/staff', (req, res) => {
    res.json(readJSON(activeStaffFile));
});

app.post('/api/staff', (req, res) => {
    const newStaff = req.body;
    const staff = readJSON(activeStaffFile);
    if (staff.find(s => s.name === newStaff.name)) {
        return res.status(400).json({ error: 'Staff member already exists' });
    }
    staff.push(newStaff);
    writeJSON(activeStaffFile, staff);
    res.status(201).json(newStaff);
});

app.delete('/api/staff/:name', (req, res) => {
    const { name } = req.params;
    let staff = readJSON(activeStaffFile);
    staff = staff.filter(s => s.name !== name);
    writeJSON(activeStaffFile, staff);
    res.status(204).send();
});

app.get('/api/slips', (req, res) => {
    res.json(readJSON(activeDataFile));
});

app.post('/api/slips', (req, res) => {
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
app.get('{/*splat}', (req, res) => {
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
