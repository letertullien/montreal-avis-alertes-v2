# Projet 2 — Documentation technique
## Avis et alertes – Ville de Montréal (PWA)

---

## 1. Installation et démarrage

### Prérequis
- Node.js 18+
- npm

### Étapes

```bash
# 1. Cloner le dépôt
git clone <url-du-depot>
cd montreal-avis-alertes

# 2. Installer les dépendances
npm install

# 3. Lancer en développement
npm run dev
# → http://localhost:5173

# 4. Build de production
npm run build

# 5. Prévisualiser le build (requis pour tester le SW et la PWA)
npm run preview
# → http://localhost:4173
```

---

## 2. Dépendances utilisées

### Installation

```bash
# Dépendances de production
npm install react react-dom react-router-dom leaflet react-leaflet

# Dépendances de développement
npm install -D vite @vitejs/plugin-react vite-plugin-pwa
```

### Tableau des dépendances

| Dépendance | Rôle |
|---|---|
| `react` | Interface utilisateur |
| `react-dom` | Rendu DOM |
| `react-router-dom` | Navigation entre pages |
| `vite` | Bundler et serveur de développement |
| `@vitejs/plugin-react` | Support JSX pour Vite |
| `vite-plugin-pwa` | Génération SW + manifeste PWA via Workbox |
| `leaflet` | Carte interactive (bonus GeoJSON) |
| `react-leaflet` | Composants React pour Leaflet |

---

## 3. Structure du projet

```
montreal-avis-alertes/
├── public/
│   ├── sw.js                          ← Service Worker manuel (documentation)
│   ├── manifest.webmanifest           ← Manifeste PWA
│   ├── robots.txt                     ← Référencement
│   ├── icons/
│   │   ├── icon-192.png               ← Icône Android 192×192
│   │   ├── icon-512.png               ← Icône Android 512×512
│   │   ├── icon-maskable-512.png      ← Icône maskable Android
│   │   └── apple-touch-icon-180.png   ← Icône iOS 180×180
│   └── screenshots/
│       ├── mobile.png                 ← Capture mobile (PWA install)
│       └── desktop.png                ← Capture desktop (PWA install)
├── src/
│   ├── main.jsx                       ← Point d'entrée + enregistrement SW
│   ├── App.jsx                        ← Routes de l'application
│   ├── index.css                      ← Styles globaux
│   ├── services/
│   │   ├── alertes.js                 ← Appels API + mapping + GeoJSON
│   │   └── listes.js                  ← Liste arrondissements + getSujets()
│   ├── utils/
│   │   └── Normaliser.js              ← Normalisation pour recherche sans accents
│   ├── components/
│   │   ├── CarteAlerte/               ← Carte d'une alerte dans la liste
│   │   ├── CarteAlerteDetail/         ← Carte Leaflet (bonus GeoJSON)
│   │   ├── BandeauHorsLigne/          ← Indicateur mode hors-ligne
│   │   ├── Chargement/                ← Spinner de chargement
│   │   ├── Abonnement/                ← Encart S'abonner
│   │   ├── Entete/                    ← En-tête partagée
│   │   ├── Layout/                    ← Mise en page commune
│   │   └── PiedDePage/                ← Pied de page
│   └── pages/
│       ├── Accueil/                   ← Liste alertes + filtres + recherche
│       │   ├── filtre/                ← Composant Filtre (boutons multi-sélection)
│       │   └── BoutonSupprimer/       ← Bouton Tout effacer
│       ├── DetailAlerte/              ← Page de détail + carte
│       └── PageIntrouvable/           ← Page 404
├── index.html                         ← HTML principal + manifeste + balises Apple
└── vite.config.js                     ← Configuration Vite + vite-plugin-pwa
```

---

## 4. Preuves de réalisation

### 4.1 Données réelles — API de la Ville de Montréal

**Fichier :** `src/services/alertes.js`

```javascript
const API_URL =
  "https://donnees.montreal.ca/api/3/action/datastore_search" +
  "?resource_id=fc6e5f85-7eba-451c-8243-bdf35c2ab336";

export async function getAlertes(offset = 0, limite = 10) {
  const url = `${API_URL}&limit=${limite}&offset=${offset}`;
  const reponse = await fetch(url);
  const json = await reponse.json();
  const alertes = json.result.records.map(mapperAlerte);
  const total = json.result.total;
  return { alertes, total };
}
```

### 4.2 Normalisation (mapping API → modèle interne)

**Fichier :** `src/services/alertes.js`

```javascript
function mapperAlerte(enreg) {
  return {
    id: String(enreg._id),
    titre: enreg.titre ?? "",
    arrondissement: extraireArrondissement(enreg.titre ?? ""),
    sujet: enreg.type ?? "Autre",
    dateEmission: enreg.date_debut ? enreg.date_debut.slice(0, 10) : "",
    dateFin: enreg.date_fin ? enreg.date_fin.slice(0, 10) : "",
    lien: enreg.lien ?? "",
  };
}
```

| Champ API | Champ interne | Transformation |
|---|---|---|
| `_id` | `id` | Converti en string |
| `titre` | `titre` | Direct |
| *(absent)* | `arrondissement` | Extrait du titre par liste fixe + normalisation |
| `type` | `sujet` | Direct |
| `date_debut` | `dateEmission` | Tronqué à 10 caractères (YYYY-MM-DD) |
| `date_fin` | `dateFin` | Tronqué à 10 caractères (YYYY-MM-DD) |
| `lien` | `lien` | Direct |

### 4.3 États de chargement et d'erreur

**Fichier :** `src/pages/Accueil/Accueil.jsx`

```javascript
if (chargement) {
  return <Chargement />;
}

if (erreur) {
  return (
    <div className={styles.page}>
      <p className={styles.erreur}>
        Impossible de charger les alertes. Vérifiez votre connexion.
      </p>
    </div>
  );
}
```

### 4.4 Filtres multi-valeurs avec chips

**Fichier :** `src/pages/Accueil/filtre/Filtre.jsx`

```javascript
// Boutons toggle multi-sélection
function toggleArrondissement(valeur) {
  setFiltresArrondissement((prev) =>
    prev.includes(valeur)
      ? prev.filter((a) => a !== valeur)  // retire si déjà sélectionné
      : [...prev, valeur]                  // ajoute sinon
  );
}
```

```jsx
// Zone chips filtres actifs
{aFiltresActifs && (
  <div className={styles.filtresActifs}>
    {filtresArrondissement.map((a) => (
      <span key={a} className={styles.chip}>
        {a}
        <button onClick={() => retirerArrondissement(a)} aria-label={`Retirer le filtre ${a}`}>×</button>
      </span>
    ))}
  </div>
)}
```

**Logique ET/OU :** `src/pages/Accueil/Accueil.jsx`

```javascript
// OU à l'intérieur d'un filtre
const arrondissementOk =
  filtresArrondissement.length === 0 ||
  filtresArrondissement.includes(alerte.arrondissement);

// ET entre filtres
return rechercheOk && arrondissementOk && sujetOk && dateDebutOk && dateFinOk;
```

### 4.5 Manifest PWA

**Fichier :** `public/manifest.webmanifest`

```json
{
  "name": "Avis et alertes Montréal",
  "short_name": "Avis MTL",
  "description": "Consultez les avis et alertes de la Ville de Montréal",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1a1a2e",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "purpose": "any" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "purpose": "maskable" }
  ]
}
```

Icône Apple Touch dans `index.html` :
```html
<link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png" />
```

### 4.6 Service Worker — Stratégies de cache

**Fichier :** `vite.config.js`

```javascript
workbox: {
  // Assets statiques précachés au premier chargement
  globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest}'],

  // API Ville → Stale-While-Revalidate
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/donnees\.montreal\.ca\/api\//,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-avis-mtl',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 86400, // 24 heures
        },
      },
    },
  ],
},
```

| Ressource | Stratégie | Justification |
|---|---|---|
| Assets statiques (JS, CSS, HTML, images) | **Cache First** via précache | Fichiers qui ne changent pas entre les visites |
| API Ville (`donnees.montreal.ca`) | **Stale-While-Revalidate** | Affichage immédiat depuis le cache + mise à jour en arrière-plan |

### 4.7 Mode hors-ligne — Bandeau indicateur

**Fichier :** `src/components/BandeauHorsLigne/BandeauHorsLigne.jsx`

```javascript
function BandeauHorsLigne() {
  const [horsLigne, setHorsLigne] = useState(!navigator.onLine);

  useEffect(() => {
    window.addEventListener("online",  () => setHorsLigne(false));
    window.addEventListener("offline", () => setHorsLigne(true));
  }, []);

  if (!horsLigne) return null;

  return (
    <div className={styles.bandeau} role="alert">
      Vous êtes hors connexion. Les dernières alertes téléchargées sont affichées.
    </div>
  );
}
```

### 4.8 Bonus — Carte GeoJSON (Leaflet)

**Fichier :** `src/services/alertes.js`

```javascript
const GEOJSON_URL = "https://donnees.montreal.ca/dataset/.../avis-alertes.geojson";

export async function getGeometrieByTitre(titre) {
  const reponse = await fetch(GEOJSON_URL);
  const geojson = await reponse.json();
  const feature = geojson.features.find((f) => f.properties.titre === titre);
  if (!feature) return null;
  return feature.geometry;
}
```

**Fichier :** `src/components/CarteAlerteDetail/CarteAlerteDetail.jsx`

- Affiche un `<Marker>` pour les alertes de type `Point`
- Affiche un `<Polyline>` pour les alertes de type `LineString` (tracé de rue)
- Vérifie la validité des coordonnées (rejette `[0, 0]`)

---

## 5. Scores Lighthouse (production — navigation privée)

| Catégorie | Score |
|---|---|
| **Performances** | 97 |
| **Accessibilité** | 100 |
| **Bonnes pratiques** | 100 |
| **SEO** | 100 |

> Testé sur `npm run preview` (`localhost:4173`) en mode navigation privée, émulation Moto G Power, connexion 4G lente.