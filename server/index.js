import express from 'express';
import mariadb from 'mariadb';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

// Load credentials from credentials.txt
const credsPath = path.join(process.cwd(), 'credentials.txt');
if (fs.existsSync(credsPath)) {
    const creds = fs.readFileSync(credsPath, 'utf8');
    creds.split('\n').forEach(line => {
        const index = line.indexOf('=');
        if (index !== -1) {
            const key = line.substring(0, index).trim();
            const value = line.substring(index + 1).trim();
            if (key) {
                process.env[key] = value;
            }
        }
    });
} else {
    console.warn('credentials.txt not found. Using environment variables or defaults.');
}

const app = express();
app.use(cors());
app.use(express.json());

// Create pool without database first to ensure database exists
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '3306'),
    connectionLimit: 5
};

let pool;

// Initialize database
async function initDb() {
    let conn;
    try {
        // First connection without database to create it if needed
        conn = await mariadb.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            port: dbConfig.port
        });
        
        const dbName = process.env.DB_NAME || 'staff_points';
        console.log(`Connecting to MariaDB to ensure database ${dbName} exists...`);
        await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`Database ${dbName} ensured`);
        await conn.end();

        // Now create the pool with the database
        pool = mariadb.createPool({
            ...dbConfig,
            database: dbName
        });

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
        console.log('Table points_slips ensured');
    } catch (err) {
        console.error('Error initializing database:', err);
        // If we can't initialize, we should probably exit or handle it
        process.exit(1);
    } finally {
        if (conn && conn.end && !conn.release) await conn.end(); // If it was a direct connection
        else if (conn) conn.release();
    }
}

// Wrapper to ensure pool is initialized before use
async function getPoolConnection() {
    if (!pool) {
        // Wait a bit or try to init if not done
        throw new Error('Database pool not initialized');
    }
    return await pool.getConnection();
}

initDb();

app.get('/api/slips', async (req, res) => {
    let conn;
    try {
        conn = await getPoolConnection();
        const rows = await conn.query("SELECT name, date, points, hours FROM points_slips");
        res.json(rows);
    } catch (err) {
        console.error('GET /api/slips error:', err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.post('/api/slips', async (req, res) => {
    let conn;
    try {
        const { name, date, points, hours } = req.body;
        conn = await getPoolConnection();
        await conn.query(
            "INSERT INTO points_slips (name, date, points, hours) VALUES (?, ?, ?, ?)",
            [name, date, points, hours]
        );
        res.status(201).json({ message: 'Slip saved successfully' });
    } catch (err) {
        console.error('POST /api/slips error:', err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
