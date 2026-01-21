import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 80; // As per previous request to run on port 80

// Path to data.json - using the one specified in previous issues
const DATA_FILE = '/var/www/staffpoints/data.json';
const WEB_ROOT = '/var/www/staffpoints';

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
    } catch (e) {
        console.error('Error creating directory:', e);
        // Fallback to local directory if /var/www/staffpoints is not writable/accessible
        return false;
    }
};

let activeDataFile = DATA_FILE;
if (!ensureDirectoryExistence(DATA_FILE)) {
    activeDataFile = path.join(__dirname, '..', 'data.json');
    console.log(`Fallback: Using local data file at ${activeDataFile}`);
}

// Initialize file if it doesn't exist
if (!fs.existsSync(activeDataFile)) {
    fs.writeFileSync(activeDataFile, JSON.stringify([], null, 2));
}

// Serve static files from webroot if it exists
if (fs.existsSync(WEB_ROOT)) {
    app.use(express.static(WEB_ROOT));
}

app.get('/api/slips', (req, res) => {
    fs.readFile(activeDataFile, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read data' });
        }
        try {
            const slips = JSON.parse(data);
            res.json(slips);
        } catch (e) {
            res.status(500).json({ error: 'Failed to parse data' });
        }
    });
});

app.post('/api/slips', (req, res) => {
    const newSlip = req.body;
    
    fs.readFile(activeDataFile, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read data' });
        }
        
        let slips = [];
        try {
            slips = JSON.parse(data);
        } catch (e) {
            // If parse fails, start with empty array
        }
        
        slips.push(newSlip);
        
        fs.writeFile(activeDataFile, JSON.stringify(slips, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to save data' });
            }
            res.status(201).json(newSlip);
        });
    });
});

// SPA routing - redirect all other requests to index.html if it exists
app.get('*', (req, res) => {
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
