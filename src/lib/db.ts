import { Pool } from 'pg';

const rawConnectionString = process.env.DATABASE_URL;

if (!rawConnectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Some providers include `sslmode` in the URL query string, but node-postgres handles SSL
// via the `ssl` option below. Strip `sslmode` to avoid noisy warnings.
const connectionString = (() => {
  try {
    const url = new URL(rawConnectionString);
    url.searchParams.delete('sslmode');
    return url.toString();
  } catch {
    return rawConnectionString;
  }
})();

// إنشاء اتصال (Pool) لإدارة الاتصالات بقاعدة البيانات
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // مطلوب لاتصالات Neon الآمنة
  },
  max: 20, // الحد الأقصى للاتصالات المتزامنة
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // زيادة مهلة الاتصال
});

// دالة مساعدة لتنفيذ الاستعلامات
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database Query Error:', error);
    throw error;
  }
};

// دالة للحصول على عميل فردي للمعاملات (Transactions)
export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;
  
  // Monkey patch the release method to log release
  const releaseProxy = () => {
    // console.log('Client released');
    client.release();
  };
  
  return { client, release: releaseProxy };
};

export default pool;
