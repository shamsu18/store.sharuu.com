import { HttpError, number, parseJson } from '../utils/http.js';

export function validateCoupon(coupon,subtotal){
  if(!coupon||!coupon.active)throw new HttpError(400,'Coupon is invalid or inactive.');
  const now=new Date(); if(coupon.startDate&&new Date(coupon.startDate)>now)throw new HttpError(400,'Coupon has not started yet.'); if(coupon.endDate&&new Date(`${coupon.endDate}T23:59:59`)<now)throw new HttpError(400,'Coupon has expired.');
  if(number(coupon.usageLimit)>0&&number(coupon.usedCount)>=number(coupon.usageLimit))throw new HttpError(400,'Coupon usage limit reached.');
  if(subtotal<number(coupon.minimumOrder))throw new HttpError(400,`Minimum order is ${coupon.minimumOrder}.`);
  let discount=0;let freeShipping=false;
  if(coupon.type==='percentage'){discount=subtotal*(number(coupon.value)/100);if(number(coupon.maximumDiscount)>0)discount=Math.min(discount,number(coupon.maximumDiscount));}
  if(coupon.type==='fixed')discount=Math.min(subtotal,number(coupon.value));
  if(coupon.type==='free_shipping')freeShipping=true;
  return{code:coupon.code,discount:Math.round(discount*100)/100,freeShipping};
}

export function resolveProductLine(product,variantId,quantity){
  if(product.status!=='active')throw new HttpError(400,`${product.name} is unavailable.`);
  const qty=Math.max(1,number(quantity,1));
  if(product.hasVariants){const variant=(product.variants||[]).find(item=>item.id===variantId);if(!variant||variant.status!=='active')throw new HttpError(400,`Selected variant for ${product.name} is unavailable.`);if(number(variant.stock)<qty&&!variant.allowBackorder)throw new HttpError(400,`Not enough stock for ${product.name}.`);const labels=Object.entries(variant.optionValues||{}).reduce((result,[optionId,value])=>{const option=(product.options||[]).find(item=>item.id===optionId);const optionValue=option?.values?.find(item=>item.value===value);if(option)result[option.name]=optionValue?.label||value;return result;},{});return{variant,qty,unitPrice:number(variant.price??product.price),selectedOptionLabels:labels,image:variant.image||(product.media||[]).find(item=>item.isPrimary)?.url||(product.media||[])[0]?.url||''};}
  if(number(product.stock)<qty)throw new HttpError(400,`Not enough stock for ${product.name}.`);
  return{variant:null,qty,unitPrice:number(product.price),selectedOptionLabels:{},image:(product.media||[]).find(item=>item.isPrimary)?.url||(product.media||[])[0]?.url||''};
}
