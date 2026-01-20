import express from 'express';
import mariadb from 'mariadb';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load credentials from credentials.txt
const credsPath = path.join(process.cwd(), 'credentials.txt');
if (fs.existsSync(credsPath)) {
    const creds = fs.readFileSync(credsPath, 'utf8');
    creds.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const app = express();
app.use(cors());
app.use(express.json());

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    connectionLimit: 5
});

// Initialize database
async function initDb() {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(`
            CREATE TABLE IF NOT EXISTS points_slips (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                date DATE NOT NULL,
                points DOUBLE NOT NULL,
                hours DOUBLE NOT NULL
            )
        `);
        console.log('Database initialized');
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        if (conn) conn.release();
    }
}

initDb();

app.get('/api/slips', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT name, date, points, hours FROM points_slips");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.post('/api/slips', async (req, res) => {
    let conn;
    try {
        const { name, date, points, hours } = req.body;
        conn = await pool.getConnection();
        await conn.query(
            "INSERT INTO points_slips (name, date, points, hours) VALUES (?, ?, ?, ?)",
            [name, date, points, hours]
        );
        res.status(201).json({ message: 'Slip saved successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
