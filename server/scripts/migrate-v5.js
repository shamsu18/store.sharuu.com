import crypto from 'node:crypto';
import { pool } from '../config/db.js';
import { getSettings,saveSettings } from '../services/store.js';
import { settings as defaults } from './seed-data.js';

const normalizeSocialLinks=value=>{
  const items=Array.isArray(value)
    ? value
    : Object.entries(value||{}).map(([platform,url])=>({platform,url,active:true}));

  return items
    .map((item,index)=>({
      id:String(item?.id||`social-${index+1}`),
      platform:String(item?.platform||'').trim(),
      url:String(item?.url||'').trim(),
      active:item?.active!==false
    }))
    .filter(item=>item.platform&&item.url);
};

const [columns]=await pool.query(`SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders'`);
const names=new Set(columns.map(item=>item.COLUMN_NAME));
if(!names.has('public_token')){
  await pool.query('ALTER TABLE orders ADD COLUMN public_token VARCHAR(100) NULL AFTER total');
  const[rows]=await pool.query('SELECT id FROM orders WHERE public_token IS NULL OR public_token=""');
  for(const row of rows)await pool.execute('UPDATE orders SET public_token=? WHERE id=?',[crypto.randomBytes(24).toString('hex'),row.id]);
  await pool.query('ALTER TABLE orders MODIFY public_token VARCHAR(100) NOT NULL, ADD UNIQUE KEY uq_orders_public_token(public_token)');
}
const current=await getSettings();
const currentSocialLinks=normalizeSocialLinks(current.socialLinks);
const merged={...defaults,...current,socialLinks:currentSocialLinks.length?currentSocialLinks:normalizeSocialLinks(defaults.socialLinks),footerColumns:current.footerColumns?.length?current.footerColumns:defaults.footerColumns,newArrivalModels:current.newArrivalModels?.length?current.newArrivalModels:defaults.newArrivalModels,brandingBanners:current.brandingBanners?.length?current.brandingBanners:defaults.brandingBanners,shippingAreas:current.shippingAreas?.length?current.shippingAreas:defaults.shippingAreas,paymentMethods:current.paymentMethods?.length?current.paymentMethods:defaults.paymentMethods};
await saveSettings(merged);
await pool.end();
console.log('V5 mini-change migration completed without replacing existing products/orders.');
