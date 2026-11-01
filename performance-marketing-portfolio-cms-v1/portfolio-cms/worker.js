const DEFAULT_CONTENT = {
 name:"Lê Ngọc Thiên Bảo",heroKicker:"Performance Marketing · Creative Production",
 heroLead:"I work across campaign execution, performance analysis and creative production — connecting campaign data with the message and visuals people see.",
 jobTitle:"Digital Marketing Specialist",experienceMeta:"DONG TAY LAND · Since 06/2024",locationMeta:"Vietnam · Real estate marketing",
 projects:[
 {title:"Meta Ads · Real Estate Lead Generation",meta:"Paid media · Lead generation",description:"Set up and monitor lead-generation campaigns for real-estate projects; coordinate audience, offer and creative angles, then review lead volume and quality.",foot:"Campaign execution",imageUrl:"",linkUrl:""},
 {title:"Performance Analysis & Optimization",meta:"Reporting · Optimization",description:"Review CPL, CTR, CPC, CPM and lead-quality signals; identify delivery or funnel issues and recommend campaign-level and product-message adjustments.",foot:"Data-led optimization",imageUrl:"",linkUrl:""},
 {title:"Video Shooting & Editing",meta:"Creative production",description:"Produce and edit short-form advertising videos, including footage selection, editing, pacing, subtitles and format adaptation for campaign placements.",foot:"Video production",imageUrl:"",linkUrl:""},
 {title:"Advertising Banners & Posters",meta:"Banner · Poster · Variations",description:"Create advertising banners and posters that communicate project information, pricing, policies and product selling points in a clear campaign format.",foot:"Advertising design",imageUrl:"",linkUrl:""}],
 tools:["Meta Ads","Google Ads","TikTok Ads","Microsoft Ads","MGID","Google Sheets / Reporting","Adobe Premiere Pro","CapCut","Adobe Photoshop","Adobe Illustrator","Adobe After Effects","Canva"],contactEmail:"",contactLinkedIn:"",contactLocation:"Vietnam"
};
const enc=new TextEncoder();
function b64url(bytes){return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')}
async function sign(value,secret){const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return b64url(await crypto.subtle.sign('HMAC',key,enc.encode(value)))}
async function validSession(req,env){const cookie=req.headers.get('Cookie')||'';const m=cookie.match(/(?:^|; )portfolio_session=([^;]+)/);if(!m||!env.SESSION_SECRET)return false;const [exp,sig]=m[1].split('.');if(!exp||!sig||Number(exp)<Date.now())return false;return(await sign(exp,env.SESSION_SECRET))===sig}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}})}
async function getContent(env){try{const row=await env.DB.prepare('SELECT content FROM portfolio_content WHERE id=1').first();if(row?.content)return{...DEFAULT_CONTENT,...JSON.parse(row.content)}}catch(e){}return DEFAULT_CONTENT}
function txt(v,max){return(typeof v==='string'?v:'').trim().slice(0,max)}
function safeUrl(v){try{const u=new URL(v);return u.protocol==='https:'?u.href:''}catch{return''}}
async function api(req,env,url){
 if(url.pathname==='/api/content'&&req.method==='GET')return json(await getContent(env));
 if(url.pathname==='/api/login'&&req.method==='POST'){
  if(!env.ADMIN_PASSWORD||!env.SESSION_SECRET)return json({error:'Cloudflare chưa cấu hình ADMIN_PASSWORD và SESSION_SECRET.'},503);
  let body={};try{body=await req.json()}catch{}
  if(typeof body.password!=='string'||body.password!==env.ADMIN_PASSWORD)return json({error:'Mật khẩu không chính xác.'},401);
  const exp=String(Date.now()+8*60*60*1000),sig=await sign(exp,env.SESSION_SECRET);
  return new Response(JSON.stringify({ok:true}),{headers:{'content-type':'application/json','cache-control':'no-store','set-cookie':`portfolio_session=${exp}.${sig}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`}});
 }
 if(url.pathname==='/api/logout'&&req.method==='POST')return new Response(null,{status:204,headers:{'set-cookie':'portfolio_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'}});
 if(url.pathname==='/api/content'&&req.method==='PUT'){
  if(!(await validSession(req,env)))return json({error:'Phiên đăng nhập đã hết hạn.'},401);
  const origin=req.headers.get('Origin');if(origin&&origin!==url.origin)return json({error:'Origin không hợp lệ.'},403);
  let d;try{d=await req.json()}catch{return json({error:'Dữ liệu JSON không hợp lệ.'},400)}
  if(!d||!Array.isArray(d.projects)||d.projects.length!==4||!Array.isArray(d.tools))return json({error:'Dữ liệu không hợp lệ.'},400);
  const clean={name:txt(d.name,100),heroKicker:txt(d.heroKicker,180),heroLead:txt(d.heroLead,1000),jobTitle:txt(d.jobTitle,120),experienceMeta:txt(d.experienceMeta,180),locationMeta:txt(d.locationMeta,180),
   projects:d.projects.map(p=>({title:txt(p.title,180),meta:txt(p.meta,120),description:txt(p.description,1000),foot:txt(p.foot,100),imageUrl:safeUrl(p.imageUrl),linkUrl:safeUrl(p.linkUrl)})),
   tools:d.tools.map(x=>txt(x,60)).filter(Boolean).slice(0,30),contactEmail:txt(d.contactEmail,180),contactLinkedIn:safeUrl(d.contactLinkedIn),contactLocation:txt(d.contactLocation,100)};
  await env.DB.prepare('INSERT INTO portfolio_content (id,content,updated_at) VALUES (1,?,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET content=excluded.content,updated_at=CURRENT_TIMESTAMP').bind(JSON.stringify(clean)).run();
  return json({ok:true});
 }
 return json({error:'Not found'},404);
}
export default{async fetch(req,env){const url=new URL(req.url);if(url.pathname.startsWith('/api/'))return api(req,env,url);if(url.pathname==='/admin'||url.pathname==='/admin/')return env.ASSETS.fetch(new Request(new URL('/admin.html',url),req));return env.ASSETS.fetch(req)}};
