import mysql from 'mysql2/promise';
import { env } from './env.js';

export const pool=mysql.createPool({host:env.db.host,port:env.db.port,database:env.db.database,user:env.db.user,password:env.db.password,waitForConnections:true,connectionLimit:10,queueLimit:0,charset:'utf8mb4',decimalNumbers:true,dateStrings:true});
export async function withTransaction(handler){const connection=await pool.getConnection();try{await connection.beginTransaction();const result=await handler(connection);await connection.commit();return result;}catch(error){await connection.rollback();throw error;}finally{connection.release();}}
