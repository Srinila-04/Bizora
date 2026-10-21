import config from './env.js';

const parseOrigins = () => {
  const origins = new Set([
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
  ]);

  if (config.clientUrl) {
    const list = config.clientUrl.split(',').map((u) => u.trim()).filter(Boolean);
    for (const url of list) {
      const cleanUrl = url.replace(/\/+$/, '');
      origins.add(cleanUrl);
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        origins.add(`https://${cleanUrl}`);
        origins.add(`http://${cleanUrl}`);
      }
    }
  }

  return Array.from(origins);
};

export const allowedOrigins = parseOrigins();

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, mobile or Postman/curl requests where origin is undefined
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/+$/, ''))) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Error: Origin ${origin} not allowed by policy`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

export default corsOptions;

