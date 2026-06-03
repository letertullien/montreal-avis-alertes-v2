import { useState, useEffect } from "react";
import styles from "./BandeauHorsLigne.module.css";

function BandeauHorsLigne() {

 
  const [horsLigne, setHorsLigne] = useState(!navigator.onLine);

  useEffect(() => {
 
    function handleOnline()  { setHorsLigne(false); } // on est de retour en ligne
    function handleOffline() { setHorsLigne(true);  } // on passe hors-ligne
 
    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);

     
    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
    };

  }, []);  

 
  if (!horsLigne) return null;

 
  return (
    <div className={styles.bandeau} role="alert">
      Vous êtes hors connexion. Les dernières alertes téléchargées sont affichées.
    </div>
  );
}

export default BandeauHorsLigne;