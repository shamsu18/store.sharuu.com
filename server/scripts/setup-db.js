import fs from 'node:fs/promises';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';
const sql=await fs.readFile(new URL('../sql/sharuu-fullstack-v5.sql',import.meta.url),'utf8');
const connection=await mysql.createConnection({host:env.db.host,port:env.db.port,user:env.db.user,password:env.db.password,multipleStatements:true,charset:'utf8mb4'});
await connection.query(sql);
await connection.end();
console.log('Sharuu database schema created.');
