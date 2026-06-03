

import { Link } from "react-router-dom";
import styles from "./Abonnement.module.css";

function Abonnement() {
  function handleClick(e) {
    e.preventDefault();
    alert("Cette fonctionnalité n'est pas encore disponible.");
  }

  return (
    <section className={styles.abonnement}>
      <h2>S'abonner aux alertes</h2>
      <p>
        Pour recevoir des avis et alertes par courriel ou texto, vous devez
        avoir créé un compte.
      </p>
      <Link to="#" className={styles.lienAbonner} onClick={handleClick}>
        M'abonner →
      </Link>
    </section>
  );
}

export default Abonnement;