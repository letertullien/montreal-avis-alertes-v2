import { useState, useEffect } from "react";
import { getAlertes } from "../../services/alertes";
import { getSujets, ARRONDISSEMENTS } from "../../services/listes";
import CarteAlerte from "../../components/CarteAlerte/CarteAlerte";
import Chargement from "../../components/Chargement/Chargement";
import Abonnement from "../../components/Abonnement/Abonnement";
import BandeauHorsLigne from "../../components/BandeauHorsLigne/BandeauHorsLigne";
import Filtre from "./filtre/Filtre";
import normaliser from "../../utils/Normaliser";
import styles from "./Accueil.module.css";

const PAR_PAGE = 10;

function Accueil() {
   
  const [alertes, setAlertes] = useState([]);
  const [total, setTotal] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [chargementPlus, setChargementPlus] = useState(false);
  const [erreur, setErreur] = useState(null);

   
  const [toutesLesAlertes, setToutesLesAlertes] = useState([]);
  const [toutCharge, setToutCharge] = useState(false);
  const [chargementTotal, setChargementTotal] = useState(false);

  
  const [nbVisibles, setNbVisibles] = useState(PAR_PAGE);

   
  const [sujets, setSujets] = useState([]);

   
  const [recherche, setRecherche] = useState("");
  const [filtresArrondissement, setFiltresArrondissement] = useState([]);
  const [filtresSujet, setFiltresSujet] = useState([]);
  const [filtreDateDebut, setFiltreDateDebut] = useState("");
  const [filtreDateFin, setFiltreDateFin] = useState("");

  // Chargement initial — 10 premières alertes + sujets
  useEffect(() => {
    Promise.all([getAlertes(0, PAR_PAGE), getSujets()])
      .then(([{ alertes, total }, sujets]) => {
        setAlertes(alertes);
        setTotal(total);
        setSujets(sujets);
      })
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, []);

 
  const aFiltresActifs =
    filtresArrondissement.length > 0 ||
    filtresSujet.length > 0 ||
    filtreDateDebut !== "" ||
    filtreDateFin !== "";

  const filtreOuRecherche = aFiltresActifs || recherche !== "";

  useEffect(() => {
    if (filtreOuRecherche && !toutCharge && !chargementTotal) {
      setChargementTotal(true);
      getAlertes(0, 1000)
        .then(({ alertes }) => {
          setToutesLesAlertes(alertes);
          setToutCharge(true);
        })
        .catch((err) => setErreur(err.message))
        .finally(() => setChargementTotal(false));
    }
  }, [filtreOuRecherche, toutCharge, chargementTotal]);

   
  useEffect(() => {
    setNbVisibles(PAR_PAGE);
  }, [recherche, filtresArrondissement, filtresSujet, filtreDateDebut, filtreDateFin]);

  
  function handleChargerPlus() {
    if (filtreOuRecherche) {
      // Mode filtré : pagination locale sur le cache complet
      setNbVisibles((prev) => prev + PAR_PAGE);
    } else {
      // Mode normal : appel API pour la page suivante
      setChargementPlus(true);
      getAlertes(alertes.length, PAR_PAGE)
        .then(({ alertes: nouvelles }) => {
          setAlertes((prev) => [...prev, ...nouvelles]);
        })
        .catch((err) => setErreur(err.message))
        .finally(() => setChargementPlus(false));
    }
  }

  function handleReinitialiser() {
    setRecherche("");
    setFiltresArrondissement([]);
    setFiltresSujet([]);
    setFiltreDateDebut("");
    setFiltreDateFin("");
  }

  function retirerArrondissement(valeur) {
    setFiltresArrondissement((prev) => prev.filter((a) => a !== valeur));
  }

  function retirerSujet(valeur) {
    setFiltresSujet((prev) => prev.filter((s) => s !== valeur));
  }

  function alerteCorrespond(alerte) {
    const rechercheOk =
      recherche === "" ||
      normaliser(alerte.titre).includes(normaliser(recherche));

    const arrondissementOk =
      filtresArrondissement.length === 0 ||
      filtresArrondissement.includes(alerte.arrondissement);

    const sujetOk =
      filtresSujet.length === 0 ||
      filtresSujet.includes(alerte.sujet);

    const dateDebutOk =
      filtreDateDebut === "" || alerte.dateEmission >= filtreDateDebut;

    const dateFinOk =
      filtreDateFin === "" || alerte.dateEmission <= filtreDateFin;

    return rechercheOk && arrondissementOk && sujetOk && dateDebutOk && dateFinOk;
  }

  if (chargement) {
    return <Chargement />;
  }

  if (erreur) {
    return (
      <div className={styles.page}>
        <p className={styles.erreur}>
          Impossible de charger les alertes. Vérifiez votre connexion ou réessayez plus tard.
        </p>
      </div>
    );
  }

  // Source de données selon le mode
  const sourceAlertes = filtreOuRecherche ? toutesLesAlertes : alertes;

  // Alertes filtrées
  const alertesFiltrees = sourceAlertes.filter(alerteCorrespond);

  // Alertes affichées selon le mode
  let alertesAffichees;
  let ilResteDesAlertes;

  if (filtreOuRecherche) {
    // Mode filtré : pagination locale
    alertesAffichees = alertesFiltrees.slice(0, nbVisibles);
    ilResteDesAlertes = nbVisibles < alertesFiltrees.length;
  } else {
    // Mode normal : toutes les alertes chargées sont affichées
    alertesAffichees = alertesFiltrees;
    ilResteDesAlertes = alertes.length < total;
  }

  let contenuListe;

  // Pendant le chargement du cache complet
  if (filtreOuRecherche && chargementTotal) {
    contenuListe = <Chargement />;
  } else if (alertesAffichees.length === 0) {
    contenuListe = (
      <p className={styles.aucunResultat}>
        Aucune alerte ne correspond à votre recherche.
      </p>
    );
  } else {
    contenuListe = (
      <ul className={styles.liste}>
        {alertesAffichees.map((alerte) => (
          <CarteAlerte key={alerte.id} alerte={alerte} />
        ))}
      </ul>
    );
  }

  return (
    <div className={styles.page}>

      <BandeauHorsLigne />

      <h1 className={styles.titre}>Avis et alertes</h1>

      <Filtre
        recherche={recherche}
        setRecherche={setRecherche}
        filtresArrondissement={filtresArrondissement}
        setFiltresArrondissement={setFiltresArrondissement}
        filtresSujet={filtresSujet}
        setFiltresSujet={setFiltresSujet}
        filtreDateDebut={filtreDateDebut}
        setFiltreDateDebut={setFiltreDateDebut}
        filtreDateFin={filtreDateFin}
        setFiltreDateFin={setFiltreDateFin}
        handleReinitialiser={handleReinitialiser}
        retirerArrondissement={retirerArrondissement}
        retirerSujet={retirerSujet}
        aFiltresActifs={aFiltresActifs}
        ARRONDISSEMENTS={ARRONDISSEMENTS}
        SUJETS={sujets}
      />

      <div className={styles.contenu}>

        <div className={styles.colonnePrincipale}>
          <p className={styles.resultats}>{alertesFiltrees.length} résultat(s)</p>

          {contenuListe}

          {/* Charger plus */}
          {ilResteDesAlertes && (
            <button
              className={styles.btnChargerPlus}
              onClick={handleChargerPlus}
              disabled={chargementPlus}
            >
              {chargementPlus ? "Chargement…" : "Charger plus"}
            </button>
          )}
        </div>

        <aside className={styles.sidebar}>
          <Abonnement />
        </aside>

      </div>

    </div>
  );
}

export default Accueil;