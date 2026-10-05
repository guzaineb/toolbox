const net = require('net');

const host = process.env.DB_HOST || 'db';
const port = parseInt(process.env.DB_PORT || '5432', 10);
const maxRetries = parseInt(process.env.DB_WAIT_RETRIES || '60', 10);
const retryInterval = parseInt(process.env.DB_WAIT_INTERVAL || '1000', 10);

function tryConnect() {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host, port });
    socket.setTimeout(2000);
    socket.once('connect', () => {
      socket.destroy();
      resolve();
    });
    socket.once('timeout', () => {
      socket.destroy();
      reject(new Error('timeout'));
    });
    socket.once('error', (err) => {
      socket.destroy();
      reject(err);
    });
  });
}

async function waitForDB() {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await tryConnect();
      console.log(`✅ Database is ready (${host}:${port})`);
      return;
    } catch {
      console.log(`⏳ Waiting for database... (${i + 1}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, retryInterval));
    }
  }
  throw new Error('Database not ready after maximum retries');
}

waitForDB()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
