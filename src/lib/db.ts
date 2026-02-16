import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __carshowxPgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __carshowxPgPoolConn: string | undefined;
}

const rawConnectionString = process.env.DATABASE_URL;

// if (!rawConnectionString) {
//   throw new Error('DATABASE_URL environment variable is not set');
// }

// Some providers include `sslmode` in the URL query string, but node-postgres handles SSL
// via the `ssl` option below. Strip `sslmode` to avoid noisy warnings.
const connectionString = (() => {
  if (!rawConnectionString) return '';
  try {
    const url = new URL(rawConnectionString);
    url.searchParams.delete('sslmode');
    return url.toString();
  } catch {
    return rawConnectionString;
  }
})();

function createPool(conn: string) {
  const pool = new Pool({
    connectionString: conn,
    ssl: {
      rejectUnauthorized: false, // مطلوب لاتصالات Neon الآمنة
    },
    // في وضع التطوير Next.js قد يعيد تحميل الملفات كثيراً؛ الاتصالات الكثيرة تسبب timeouts
    max: process.env.NODE_ENV === 'production' ? 5 : 3,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 15000,
    keepAlive: true,
  });

  pool.on('error', (err) => {
    console.error('Database Pool Error:', err);
  });

  return pool;
}

function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    console.error('CRITICAL ERROR: DATABASE_URL is missing!');
    throw new Error('Server Configuration Error: Database connection string is missing.');
  }
  if (!connectionString) {
    throw new Error('Server Configuration Error: DATABASE_URL is invalid.');
  }

  // Singleton عالمي لتجنب إنشاء Pools متعددة أثناء hot reload
  if (!globalThis.__carshowxPgPool || globalThis.__carshowxPgPoolConn !== connectionString) {
    if (globalThis.__carshowxPgPool) {
      // إغلاق الـpool القديم إذا تغيرت البيئة/الاتصال
      globalThis.__carshowxPgPool.end().catch(() => undefined);
    }
    globalThis.__carshowxPgPool = createPool(connectionString);
    globalThis.__carshowxPgPoolConn = connectionString;
  }

  return globalThis.__carshowxPgPool;
}

async function recreatePool() {
  if (globalThis.__carshowxPgPool) {
    try {
      await globalThis.__carshowxPgPool.end();
    } catch {
      // ignore
    }
  }
  globalThis.__carshowxPgPool = createPool(connectionString);
  globalThis.__carshowxPgPoolConn = connectionString;
}

function isTransientDbError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('Connection terminated unexpectedly') ||
    message.includes('connection timeout') ||
    message.includes('timeout')
  );
}

// دالة مساعدة لتنفيذ الاستعلامات
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const pool = getPool();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database Query Error:', error);
    // Retry مرة واحدة في حال سقوط الاتصال/timeout (شائع مع dev/hot reload أو مزود DB)
    if (isTransientDbError(error)) {
      try {
        await recreatePool();
        const pool = getPool();
        return await pool.query(text, params);
      } catch (retryError) {
        console.error('Database Query Retry Error:', retryError);
      }
    }

    throw error;
  }
};

// دالة للحصول على عميل فردي للمعاملات (Transactions)
export const getClient = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('Server Configuration Error: Database connection string is missing.');
  }
  const client = await getPool().connect();
  const query = client.query;
  const release = client.release;
  
  // Monkey patch the release method to log release
  const releaseProxy = () => {
    // console.log('Client released');
    client.release();
  };
  
  return { client, release: releaseProxy };
};

export default getPool();
