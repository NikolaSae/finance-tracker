import { Pool } from 'pg';

// Konfiguracija iz environment varijabli
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20, // Maksimalno konekcija u pool-u
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Provera konekcije pri inicijalizaciji
pool.query('SELECT NOW()')
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));

export default pool;