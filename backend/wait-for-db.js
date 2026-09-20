const { Client } = require('pg');

async function waitForDB() {
  const maxRetries = 30;
  const retryInterval = 1000; 

  for (let i = 0; i < maxRetries; i++) {
    try {
      const client = new Client({
        host: process.env.DB_HOST || 'db',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'admin',
        database: process.env.DB_NAME || 'toolbox',
      });
      await client.connect();
      await client.end();
      console.log('✅ Database is ready');
      return;
    } catch (err) {
      console.log(`⏳ Waiting for database... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
  }
  throw new Error('Database not ready after maximum retries');
}

waitForDB().then(() => process.exit(0));