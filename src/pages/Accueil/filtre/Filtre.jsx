import BoutonSupprime from '../BoutonSupprimer/BoutonSupprime';
import loupe from '../../../assets/loupe.png';
import styles from './Filtre.module.css';

function Filtre({
  recherche, setRecherche,
  filtresArrondissement, setFiltresArrondissement,
  filtresSujet, setFiltresSujet,
  filtreDateDebut, setFiltreDateDebut,
  filtreDateFin, setFiltreDateFin,
  handleReinitialiser,
  retirerArrondissement,
  retirerSujet,
  aFiltresActifs,
  ARRONDISSEMENTS,
  SUJETS
}) {

  function toggleArrondissement(valeur) {
    setFiltresArrondissement((prev) =>
      prev.includes(valeur)
        ? prev.filter((a) => a !== valeur)
        : [...prev, valeur]
    );
  }

  function toggleSujet(valeur) {
    setFiltresSujet((prev) =>
      prev.includes(valeur)
        ? prev.filter((s) => s !== valeur)
        : [...prev, valeur]
    );
  }

  return (
    <section className={styles.filtres}>

      <h2 className={styles.filtresTitre}>Trouver un avis</h2>

      {/*  Recherche par mot-clé  */}
      <div className={styles.ligneRecherche}>

        <label htmlFor="recherche" className={styles.labelRecherche}>
          Rechercher par mot-clé
        </label>

        <div className={styles.champRecherche}>
          <div className={styles.inputWrapper}>
            <img className={styles.loupeIcone} src={loupe} alt="" width={24} height={24} />
            <input
              type="text"
              id="recherche"
              name="recherche"
              className={styles.recherche}
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Que cherchez-vous?"
            />
          </div>

          <button className={styles.btnEffacer} onClick={handleReinitialiser}>
            Effacer
          </button>
        </div>

      </div>

      {/* Filtres arrondissement */}
      <div className={styles.groupeFiltre}>
        <p className={styles.labelGroupe}>Arrondissement</p>
        <div className={styles.boutons}>
          {ARRONDISSEMENTS.map((a) => (
            <button
              key={a}
              className={`${styles.btnFiltre} ${
                filtresArrondissement.includes(a) ? styles.actif : ""
              }`}
              onClick={() => toggleArrondissement(a)}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Filtres sujet */}
      <div className={styles.groupeFiltre}>
        <p className={styles.labelGroupe}>Sujet</p>
        <div className={styles.boutons}>
          {SUJETS.map((s) => (
            <button
              key={s}
              className={`${styles.btnFiltre} ${
                filtresSujet.includes(s) ? styles.actif : ""
              }`}
              onClick={() => toggleSujet(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Filtres par date */}
      <div className={styles.filtresDates}>
        <label htmlFor="date-debut" className={styles.labelDate}>
          Date de début :
          <input
            type="date"
            id="date-debut"
            name="date-debut"
            className={styles.inputDate}
            value={filtreDateDebut}
            onChange={(e) => setFiltreDateDebut(e.target.value)}
          />
        </label>

        <label htmlFor="date-fin" className={styles.labelDate}>
          Date de fin :
          <input
            type="date"
            id="date-fin"
            name="date-fin"
            className={styles.inputDate}
            value={filtreDateFin}
            onChange={(e) => setFiltreDateFin(e.target.value)}
          />
        </label>
      </div>

      {/* Zone filtres actifs */}
      {aFiltresActifs && (
        <div className={styles.filtresActifs}>
          <p className={styles.labelFiltresActifs}>Filtres actifs :</p>

          <div className={styles.chips}>

            {filtresArrondissement.map((a) => (
              <span key={a} className={styles.chip}>
                {a}
                <button
                  className={styles.chipSupprimer}
                  onClick={() => retirerArrondissement(a)}
                  aria-label={`Retirer le filtre ${a}`}
                >
                  ×
                </button>
              </span>
            ))}

            {filtresSujet.map((s) => (
              <span key={s} className={styles.chip}>
                {s}
                <button
                  className={styles.chipSupprimer}
                  onClick={() => retirerSujet(s)}
                  aria-label={`Retirer le filtre ${s}`}
                >
                  ×
                </button>
              </span>
            ))}

            {filtreDateDebut && (
              <span className={styles.chip}>
                Depuis : {filtreDateDebut}
                <button
                  className={styles.chipSupprimer}
                  onClick={() => setFiltreDateDebut("")}
                  aria-label="Retirer le filtre date de début"
                >
                  ×
                </button>
              </span>
            )}

            {filtreDateFin && (
              <span className={styles.chip}>
                Jusqu'au : {filtreDateFin}
                <button
                  className={styles.chipSupprimer}
                  onClick={() => setFiltreDateFin("")}
                  aria-label="Retirer le filtre date de fin"
                >
                  ×
                </button>
              </span>
            )}

          </div>

          <BoutonSupprime handleReinitialiser={handleReinitialiser} />
        </div>
      )}

    </section>
  );
}

export default Filtre;