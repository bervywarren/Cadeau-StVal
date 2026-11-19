// Service worker : garde la page en mémoire pour un usage hors connexion
const VERSION = "mots-de-coeur-v2";

self.addEventListener("install", (e) => {
  // Pré-chargement des fichiers principaux
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
  // Réseau d'abord : la dernière version de la page s'affiche toujours quand il y a du réseau.
  // Le cache ne sert qu'en secours, hors connexion.
  e.respondWith(
    fetch(e.request)
      .then((rep) => {
        const copie = rep.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copie));
        return rep;
      })
      .catch(() => caches.match(e.request))
  );
});
