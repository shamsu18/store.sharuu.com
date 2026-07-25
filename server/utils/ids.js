import crypto from 'node:crypto';
export const makeId=(prefix='id')=>`${prefix}-${crypto.randomUUID()}`;
export const orderNumber=()=>`SH-${Date.now().toString().slice(-9)}${crypto.randomInt(10,99)}`;
export const publicToken=()=>crypto.randomBytes(24).toString('hex');
