import { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./CarteAlerteDetail.module.css";

 
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function CarteAlerteDetail({ geometrie, titre }) {

  // Vérifie si les coordonnées sont valides (pas [0,0])
  function coordonneesValides(coords) {
    if (!coords || coords.length === 0) return false;
     
    if (typeof coords[0] === "number") {
      return coords[0] !== 0 && coords[1] !== 0;
    }
     
    return coords[0][0] !== 0 && coords[0][1] !== 0;
  }

  if (!geometrie || !coordonneesValides(geometrie.coordinates)) {
    return (
      <p className={styles.sansLocalisation}>
        Aucune localisation disponible pour cette alerte.
      </p>
    );
  }

 
  function inverser(coord) {
    return [coord[1], coord[0]];
  }

  
  function calculerCentre() {
    if (geometrie.type === "Point") {
      return inverser(geometrie.coordinates);
    }
    const milieu = Math.floor(geometrie.coordinates.length / 2);
    return inverser(geometrie.coordinates[milieu]);
  }

  const centre = calculerCentre();

  return (
    <div className={styles.conteneurCarte}>
      <MapContainer
        center={centre}
        zoom={16}
        className={styles.carte}
        scrollWheelZoom={false}
      >
 
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Point : marqueur */}
        {geometrie.type === "Point" && (
          <Marker position={centre}>
            <Popup>{titre}</Popup>
          </Marker>
        )}

        {/* LineString : tracé de la rue */}
        {geometrie.type === "LineString" && (
          <Polyline
            positions={geometrie.coordinates.map(inverser)}
            color="#fe0217"
            weight={10}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default CarteAlerteDetail;