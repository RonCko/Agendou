import dotenv from 'dotenv';
dotenv.config();

export default {
  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY
  },

  // Database (PostgreSQL via Supabase)
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'secret-padrao-TROCAR-ISSO',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // Session
  session: {
    secret: process.env.SESSION_SECRET || 'session-secret-padrao-TROCAR',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    }
  },

  // Server
  server: {
    port: process.env.PORT || 3333,
    env: process.env.NODE_ENV || 'development'
  }
};
