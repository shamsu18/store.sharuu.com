import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from '../utils/http.js';
export function signAdmin(admin){return jwt.sign({sub:admin.id,email:admin.email,role:admin.role},env.jwtSecret,{expiresIn:'12h'});}
export function setAdminCookie(response,token){response.cookie('sharuu_admin',token,{httpOnly:true,secure:env.cookieSecure,sameSite:'lax',maxAge:12*60*60*1000,path:'/'});}
export function clearAdminCookie(response){response.clearCookie('sharuu_admin',{httpOnly:true,secure:env.cookieSecure,sameSite:'lax',path:'/'});}
export function requireAdmin(request,_response,next){try{const token=request.cookies?.sharuu_admin;if(!token)throw new HttpError(401,'Admin login is required.');request.admin=jwt.verify(token,env.jwtSecret);next();}catch(error){next(error instanceof HttpError?error:new HttpError(401,'Admin session expired.'));}}
