// Service worker : garde en mémoire la page et ses ressources pour un usage hors connexion
const VERSION = "mots-de-coeur-v1";

self.addEventListener("install", (e) => {
  // Pré-chargement de la page d'accueil
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(["./", "./index.html", "./icon.svg", "./manifest.json"]).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  // Suppression des anciennes versions du cache
  e.waitUntil(caches.keys().then((cles) => Promise.all(cles.filter((k) => k !== VERSION).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  // Réponse du cache d'abord, mise à jour en arrière-plan quand le réseau est disponible
  e.respondWith(
    caches.open(VERSION).then((cache) =>
      cache.match(e.request).then((enCache) => {
        const reseau = fetch(e.request)
          .then((rep) => { cache.put(e.request, rep.clone()); return rep; })
          .catch(() => enCache);
        return enCache || reseau;
      })
    )
  );
});