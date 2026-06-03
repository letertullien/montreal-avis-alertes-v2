 
export const ARRONDISSEMENTS = [
  "Ahuntsic-Cartierville",
  "Anjou",
  "Côte-des-Neiges–Notre-Dame-de-Grâce",
  "Lachine",
  "LaSalle",
  "Le Plateau-Mont-Royal",
  "Le Sud-Ouest",
  "Mercier–Hochelaga-Maisonneuve",
  "Montréal-Nord",
  "Outremont",
  "Pierrefonds-Roxboro",
  "Rivière-des-Prairies–Pointe-aux-Trembles",
  "Rosemont–La Petite-Patrie",
  "Saint-Laurent",
  "Saint-Léonard",
  "Verdun",
  "Ville-Marie",
  "Villeray–Saint-Michel–Parc-Extension",
];

 
function normaliserPourComparaison(texte) {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // enlève les accents
    .replace(/[–—]/g, "-")           // tirets longs → tiret simple
    .replace(/\s+/g, " ")            // espaces multiples → un seul
    .trim();
}

 
export function extraireArrondissement(titre) {
  const titreNormalise = normaliserPourComparaison(titre);

 
  for (const arrondissement of ARRONDISSEMENTS) {
    const arrNormalise = normaliserPourComparaison(arrondissement);
    if (titreNormalise.includes(arrNormalise)) {
      return arrondissement; // retourne le nom officiel exact
    }
  }

 
  const motifArr = /\barr\.\s+(?:du\s+|de\s+l['']|de\s+|d[''])?(.+)/i;
  const match = motifArr.exec(titre);
  if (match) {
    const candidatNormalise = normaliserPourComparaison(match[1].trim());
    for (const arrondissement of ARRONDISSEMENTS) {
      const arrNormalise = normaliserPourComparaison(arrondissement);
      if (candidatNormalise.includes(arrNormalise) || arrNormalise.includes(candidatNormalise)) {
        return arrondissement;
      }
    }
  }

  return "Non spécifié";
}

 
export async function getSujets() {
  const url =
    "https://donnees.montreal.ca/api/3/action/datastore_search_sql" +
    "?sql=SELECT%20DISTINCT%20type%20FROM%20%22fc6e5f85-7eba-451c-8243-bdf35c2ab336%22";

  const reponse = await fetch(url);

  if (!reponse.ok) {
    throw new Error(`Erreur API sujets : ${reponse.status} ${reponse.statusText}`);
  }

  const json = await reponse.json();

  if (!json.success) {
    throw new Error("L'API a retourné une erreur pour les sujets.");
  }

  return json.result.records.map((r) => r.type).sort();
}