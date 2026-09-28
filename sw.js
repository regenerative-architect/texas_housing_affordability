const CACHE='tx-housing-os-v2.0.0';
const RUNTIME='tx-housing-os-runtime-v2';
const CORE=['./','./index.html','./enhancements.js','./webllm-worker.mjs','./manifest.webmanifest','./data/current-evidence.json','./README.md','./icons/icon-192.png','./icons/icon-512.png'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>![CACHE,RUNTIME].includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(resp=>{
      if(resp&&resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
      return resp;
    }).catch(()=>req.mode==='navigate'?caches.match('./index.html'):Promise.reject(new Error('offline')))));
    return;
  }
  // Cache only small cross-origin JavaScript runtime modules. WebLLM model artifacts use WebLLM's own cache.
  if(['esm.sh','esm.run','cdn.jsdelivr.net'].includes(url.hostname)){
    event.respondWith(caches.open(RUNTIME).then(async cache=>{
      const cached=await cache.match(req);if(cached)return cached;
      const resp=await fetch(req);if(resp&&resp.ok)cache.put(req,resp.clone());return resp;
    }));
  }
});
