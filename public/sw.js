 
const CACHE_STATIQUE = "avis-mtl-statique-v2";  
const CACHE_API      = "avis-mtl-api-v1";       

 
const ASSETS = [
  "/",                       
  "/index.html",             
  "/manifest.webmanifest",   
];
 
self.addEventListener("install", (event) => {
 
  event.waitUntil(
     
    caches.open(CACHE_STATIQUE).then((cache) => cache.addAll(ASSETS))
  );
 
  self.skipWaiting();
});

 
self.addEventListener("activate", (event) => {
 
  const cachesValides = [CACHE_STATIQUE, CACHE_API];

  event.waitUntil(
   
    caches.keys().then((clefs) =>
      Promise.all(
        clefs
 
          .filter((c) => !cachesValides.includes(c))
          // Supprime chacun d'eux
          .map((c) => caches.delete(c))
      )
    )
  );

 
  self.clients.claim();
});

 
self.addEventListener("fetch", (event) => {

 
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith("http")) return;
  const url = new URL(event.request.url);

  if (url.hostname === "donnees.montreal.ca") {
    event.respondWith(staleWhileRevalidate(event.request, CACHE_API));
    return;  
  }
 
  event.respondWith(cacheFirst(event.request, CACHE_STATIQUE));
});

 
async function cacheFirst(requete, nomCache) {
  const cache  = await caches.open(nomCache);

  const cached = await cache.match(requete);

  if (cached) return cached;
 
  const reponse = await fetch(requete);
 
  if (reponse.ok) {
    cache.put(requete, reponse.clone());
  }

  return reponse;
}
 
async function staleWhileRevalidate(requete, nomCache) {
  const cache = await caches.open(nomCache);
 
  const cached = await cache.match(requete);

 
  const reseauPromesse = fetch(requete).then((reponse) => {
 
    if (reponse.ok) {
      cache.put(requete, reponse.clone());
    }
    return reponse;
  });

 
  return cached || reseauPromesse;
}