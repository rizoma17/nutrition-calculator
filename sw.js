const CACHE='nutrition-page-v1';
const PAGE=new URL('./',self.registration.scope).href;
self.addEventListener('install',event=>{event.waitUntil((async()=>{const response=await fetch(PAGE,{cache:'reload'});if(!response.ok)throw Error('Page unavailable');const cache=await caches.open(CACHE);await cache.put(PAGE,response);await self.skipWaiting();})());});
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.mode!=='navigate'||url.origin!==new URL(PAGE).origin||! [new URL(PAGE).pathname,new URL('index.html',PAGE).pathname].includes(url.pathname))return;
 const cached=caches.open(CACHE).then(cache=>cache.match(PAGE));
 const update=(async()=>{const response=await fetch(event.request,{cache:'no-cache'});if(response.ok&&response.headers.get('content-type')?.includes('text/html')){const previous=await cached;const changed=previous&&(await previous.clone().text())!==(await response.clone().text());const cache=await caches.open(CACHE);await cache.put(PAGE,response.clone());if(changed){const clients=await self.clients.matchAll({type:'window'});clients.forEach(client=>client.postMessage({type:'NUTRITION_UPDATE_READY'}));}}return response;})();
 event.waitUntil(update.catch(()=>{}));
 event.respondWith((async()=>{const response=await cached;return response||await update;})());
});
