export class HttpError extends Error{constructor(status,message,details){super(message);this.status=status;this.details=details;}}
export const asyncHandler=handler=>(request,response,next)=>Promise.resolve(handler(request,response,next)).catch(next);
export function ok(response,data,message){response.json({success:true,data,...(message?{message}:{})});}
export function created(response,data,message){response.status(201).json({success:true,data,...(message?{message}:{})});}
export function parseJson(value,fallback={}){if(value==null)return fallback;if(typeof value==='object')return value;try{return JSON.parse(value);}catch{return fallback;}}
export function number(value,fallback=0){const parsed=Number(value);return Number.isFinite(parsed)?parsed:fallback;}
