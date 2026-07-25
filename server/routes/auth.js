import bcrypt from 'bcryptjs';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { pool } from '../config/db.js';
import { clearAdminCookie, setAdminCookie, signAdmin } from '../middleware/auth.js';
import { asyncHandler, HttpError, ok } from '../utils/http.js';

const router=express.Router();
const limiter=rateLimit({windowMs:15*60*1000,limit:30,standardHeaders:true,legacyHeaders:false});
router.post('/login',limiter,asyncHandler(async(request,response)=>{const email=String(request.body?.email||'').trim().toLowerCase();const password=String(request.body?.password||'');const[rows]=await pool.execute('SELECT id,name,email,password_hash,role,active FROM admin_users WHERE email=? LIMIT 1',[email]);const admin=rows[0];if(!admin||!admin.active||!await bcrypt.compare(password,admin.password_hash))throw new HttpError(401,'Invalid admin email or password.');const safe={id:admin.id,name:admin.name,email:admin.email,role:admin.role};setAdminCookie(response,signAdmin(safe));ok(response,safe);}));
router.post('/logout',(request,response)=>{clearAdminCookie(response);ok(response,true);});
router.get('/me',asyncHandler(async(request,response)=>{const token=request.cookies?.sharuu_admin;if(!token)throw new HttpError(401,'Not logged in.');const jwt=(await import('jsonwebtoken')).default;const{env}=await import('../config/env.js');const payload=jwt.verify(token,env.jwtSecret);const[rows]=await pool.execute('SELECT id,name,email,role,active FROM admin_users WHERE id=? LIMIT 1',[payload.sub]);if(!rows[0]?.active)throw new HttpError(401,'Admin account is inactive.');ok(response,rows[0]);}));
export default router;
