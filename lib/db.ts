import { Pool } from 'pg';

// Користи цео connection string из environment-a
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ово мора да буде Neon-ов URL
  ssl: {
    rejectUnauthorized: false // ИСКЉУЧИ ОВО У ПРОДАКЦИЈИ!
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Тест везе
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Database connection error:', err));

export default pool;