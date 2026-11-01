(async()=>{
 const set=(id,v)=>{const el=document.getElementById(id);if(el&&typeof v==='string')el.textContent=v};
 const validUrl=v=>{try{const u=new URL(v);return u.protocol==='https:'?u.href:''}catch{return''}};
 try{const r=await fetch('/api/content',{cache:'no-store'});if(!r.ok)return;const d=await r.json();
  set('brandName',d.name);set('footerName',d.name);set('heroKicker',d.heroKicker);set('heroLead',d.heroLead);set('jobTitle',d.jobTitle);set('experienceMeta',d.experienceMeta);set('locationMeta',d.locationMeta);
  (d.projects||[]).forEach((p,i)=>{const n=i+1;set('project'+n+'Title',p.title);set('project'+n+'Meta',p.meta);set('project'+n+'Desc',p.description);set('project'+n+'Foot',p.foot);
   const link=document.getElementById('project'+n+'Link'),href=validUrl(p.linkUrl||'');if(link&&href){link.href=href;link.hidden=false}
   const visual=document.querySelectorAll('.work-visual')[i],image=validUrl(p.imageUrl||'');if(visual&&image){const img=document.createElement('img');img.className='project-image';img.src=image;img.alt=p.title||'Project visual';img.loading='lazy';visual.prepend(img);visual.classList.add('has-image')}
  });
  const cloud=document.getElementById('toolCloud');if(cloud&&Array.isArray(d.tools)){cloud.replaceChildren();d.tools.forEach(name=>{const span=document.createElement('span');span.className='tool';span.textContent=name;cloud.append(span)})}
  const email=d.contactEmail||'',box=document.querySelector('.contact-details');if(box&&email){const p=document.createElement('p');p.textContent='Email · '+email;box.prepend(p);const a=document.createElement('a');a.className='btn btn-primary';a.href='mailto:'+email;a.textContent='Email me ↗';box.append(a)}
  if(box&&d.contactLinkedIn){const a=document.createElement('a');a.href=validUrl(d.contactLinkedIn);a.target='_blank';a.rel='noopener';a.textContent='LinkedIn ↗';a.style.display='block';box.append(a)}
 }catch(e){/* static HTML remains readable if CMS is unavailable */}
})();
