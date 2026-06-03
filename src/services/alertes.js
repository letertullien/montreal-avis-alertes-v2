import { extraireArrondissement } from "./listes";

 
const API_URL =
  "https://donnees.montreal.ca/api/3/action/datastore_search" +
  "?resource_id=fc6e5f85-7eba-451c-8243-bdf35c2ab336";

const LIMITE_PAR_PAGE = 10;

 
function mapperAlerte(enreg) {
  return {
    id: String(enreg._id),
    titre: enreg.titre ?? "",
    arrondissement: extraireArrondissement(enreg.titre ?? ""),
    sujet: enreg.type ?? "Autre",
    dateEmission: enreg.date_debut
      ? enreg.date_debut.slice(0, 10)
      : "",
    dateFin: enreg.date_fin ? enreg.date_fin.slice(0, 10) : "",
    lien: enreg.lien ?? "",
  };
}

 
export async function getAlertes(offset = 0, limite = 10) {
  const url = `${API_URL}&limit=${limite}&offset=${offset}`;
  const reponse = await fetch(url);

  if (!reponse.ok) {
    throw new Error(`Erreur API : ${reponse.status} ${reponse.statusText}`);
  }

  const json = await reponse.json();

  if (!json.success) {
    throw new Error("L'API a retourné une erreur.");
  }

  const alertes = json.result.records.map(mapperAlerte);
  const total = json.result.total;

  return { alertes, total };
}

 
export async function getAlerteById(id) {
  const filtres = encodeURIComponent(JSON.stringify({ _id: Number(id) }));
  const url = `${API_URL}&filters=${filtres}`;
  const reponse = await fetch(url);

  if (!reponse.ok) {
    throw new Error(`Erreur API : ${reponse.status} ${reponse.statusText}`);
  }

  const json = await reponse.json();

  if (!json.success || json.result.records.length === 0) {
    return null;
  }

  return mapperAlerte(json.result.records[0]);
}

 
const GEOJSON_URL =
  "https://donnees.montreal.ca/dataset/556c84af-aebf-4ca9-9a9c-2f246601674c/resource/d249e452-46f5-422f-91ae-898c98eea6cc/download/avis-alertes.geojson";

export async function getGeometrieByTitre(titre) {
  const reponse = await fetch(GEOJSON_URL);

  if (!reponse.ok) {
    throw new Error(`Erreur GeoJSON : ${reponse.status} ${reponse.statusText}`);
  }

  const geojson = await reponse.json();

  const feature = geojson.features.find(
    (f) => f.properties.titre === titre
  );

  if (!feature) return null;

  return feature.geometry;
}