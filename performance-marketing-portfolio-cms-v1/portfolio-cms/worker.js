const DEFAULT_CONTENT = {
  name: "YOUR NAME",
  heroKicker: "Performance Marketing · Creative Production",
  heroLead: "I work across campaign execution, performance analysis and creative production — connecting the numbers behind an ad with the message and visuals people see.",
  jobTitle: "Digital Marketing Specialist",
  experienceMeta: "DONG TAY LAND · Since 06/2024",
  locationMeta: "Vietnam · Real estate marketing",
  projects: [
    { title: "[Campaign / Project Name]", description: "Document the business goal, campaign setup, audience, creative angle, optimization decisions and verified outcome." },
    { title: "[Optimization Challenge]", description: "Explain what the data suggested, what you personally changed or recommended, and what you learned." },
    { title: "[Video / Editing Project]", description: "Add a real thumbnail or video link and state your contribution: filming, editing, script, motion graphics or adaptation." },
    { title: "[Advertising Design Set]", description: "Show real banner or poster variations, the message each one emphasizes and the role you played in making them." }
  ]
};
const enc = new TextEncoder();
function b64url(bytes){return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')}
async function sign(value, secret){const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return b64url(await crypto.subtle.sign('HMAC',key,enc.encode(value)))}
async function validSession(req,env){
 const cookie=req.headers.get('Cookie')||''; const m=cookie.match(/(?:^|; )portfolio_session=([^;]+)/); if(!m||!env.SESSION_SECRET)return false;
 const [exp,sig]=m[1].split('.'); if(!exp||!sig||Number(exp)<Date.now())return false;
 return (await sign(exp,env.SESSION_SECRET))===sig;
}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
async function getContent(env){
 try{const row=await env.DB.prepare('SELECT content FROM portfolio_content WHERE id=1').first();if(row?.content)return JSON.parse(row.content)}catch(e){}
 return DEFAULT_CONTENT;
}
async function api(req,env,url){
 if(url.pathname==='/api/content'&&req.method==='GET')return json(await getContent(env));
 if(url.pathname==='/api/login'&&req.method==='POST'){
  if(!env.ADMIN_PASSWORD||!env.SESSION_SECRET)return json({error:'Admin secrets are not configured in Cloudflare.'},503);
  let body={};try{body=await req.json()}catch(e){}
  if(typeof body.password!=='string'||body.password!==env.ADMIN_PASSWORD)return json({error:'Mật khẩu không chính xác.'},401);
  const exp=String(Date.now()+8*60*60*1000),sig=await sign(exp,env.SESSION_SECRET);
  return new Response(JSON.stringify({ok:true}),{headers:{'content-type':'application/json','cache-control':'no-store','set-cookie':`portfolio_session=${exp}.${sig}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`}});
 }
 if(url.pathname==='/api/logout'&&req.method==='POST')return new Response('',{status:204,headers:{'set-cookie':'portfolio_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'}});
 if(url.pathname==='/api/content'&&req.method==='PUT'){
  if(!(await validSession(req,env)))return json({error:'Phiên đăng nhập đã hết hạn.'},401);
  const origin=req.headers.get('Origin'); if(origin&&origin!==url.origin)return json({error:'Origin không hợp lệ.'},403);
  let data;try{data=await req.json()}catch(e){return json({error:'Dữ liệu JSON không hợp lệ.'},400)}
  if(!data||typeof data!=='object'||typeof data.name!=='string'||!Array.isArray(data.projects)||data.projects.length!==4)return json({error:'Thiếu trường bắt buộc hoặc danh sách dự án phải có đúng 4 mục.'},400);
  const clean={name:data.name.slice(0,100),heroKicker:String(data.heroKicker||'').slice(0,180),heroLead:String(data.heroLead||'').slice(0,1000),jobTitle:String(data.jobTitle||'').slice(0,120),experienceMeta:String(data.experienceMeta||'').slice(0,180),locationMeta:String(data.locationMeta||'').slice(0,180),projects:data.projects.map(p=>({title:String(p.title||'').slice(0,180),description:String(p.description||'').slice(0,1000)}))};
  await env.DB.prepare('INSERT INTO portfolio_content (id,content,updated_at) VALUES (1,?,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET content=excluded.content,updated_at=CURRENT_TIMESTAMP').bind(JSON.stringify(clean)).run();
  return json({ok:true});
 }
 return json({error:'Not found'},404);
}
export default {async fetch(req,env){const url=new URL(req.url);if(url.pathname.startsWith('/api/'))return api(req,env,url);if(url.pathname==='/admin')return env.ASSETS.fetch(new Request(new URL('/admin.html',url),req));return env.ASSETS.fetch(req)}};
