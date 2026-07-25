import dotenv from 'dotenv';
dotenv.config();

export const env={
  port:Number(process.env.PORT||5000),
  clientUrls:String(process.env.CLIENT_URL||'http://localhost:5173,http://127.0.0.1:5173').split(',').map(value=>value.trim()).filter(Boolean),
  db:{host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),database:process.env.DB_NAME||'sharuu_universal_store',user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD||''},
  jwtSecret:process.env.JWT_SECRET||'development-only-change-this-secret',
  cookieSecure:String(process.env.COOKIE_SECURE||'false').toLowerCase()==='true',
  uploadBaseUrl:process.env.UPLOAD_BASE_URL||`http://localhost:${Number(process.env.PORT||5000)}/uploads`,
  nodeEnv:process.env.NODE_ENV||'development'
};
