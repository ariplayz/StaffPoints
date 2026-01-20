import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

// Path to the JSON file in the webroot
const DATA_FILE = '/var/www/staffpoints/data.json';

// Ensure the directory exists (optional, but good for local dev if path is different)
const ensureDirectoryExistence = (filePath) => {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    try {
        fs.mkdirSync(dirname, { recursive: true });
    } catch (err) {
        console.warn(`Could not create directory ${dirname}:`, err.message);
    }
};

// Initialize the data file if it doesn't exist
const initDataFile = () => {
    ensureDirectoryExistence(DATA_FILE);
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
        console.log(`Created new data file at ${DATA_FILE}`);
    }
};

initDataFile();

app.get('/api/slips', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('GET /api/slips error:', err);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

app.post('/api/slips', (req, res) => {
    try {
        const { name, date, points, hours } = req.body;
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        
        const newSlip = {
            id: Date.now(),
            name,
            date,
            points,
            hours
        };
        
        data.push(newSlip);
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        
        res.status(201).json({ message: 'Slip saved successfully' });
    } catch (err) {
        console.error('POST /api/slips error:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
