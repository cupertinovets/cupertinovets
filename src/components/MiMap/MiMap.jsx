import { useEffect, useRef, useState } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MlMap = () => {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [data, setData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("cons_jan");

  useEffect(() => {
    if (!mapRef.current) return;

    // 🧼 Clean up if map already exists on this DOM node
    if (mapRef.current._leaflet_map) {
      mapRef.current._leaflet_map.remove();
    }

    const map = L.map(mapRef.current).setView([55.75, 37.61], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    mapRef.current._leaflet_map = map; // Save it so we don’t double-init
    setMapInstance(map);
  }, []);

  useEffect(() => {
    if (!mapInstance || data.length === 0) return;

    mapInstance.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) mapInstance.removeLayer(layer);
    });

    data.forEach(async (row) => {
      const address = row.address;
      const value = parseFloat(row[selectedMonth]);
      if (!address || isNaN(value)) return;

      const coords = await geocode(address);
      if (!coords || !mapRef.current || !mapRef.current._leaflet_id) return;

      const color = value < 3000 ? "green" : "red";

      const marker = L.circleMarker(coords, {
        radius: 8,
        fillColor: color,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      });

      marker.addTo(mapInstance);
      marker.bindPopup(`<b>${address}</b><br/>${selectedMonth}: ${value}`);
    });
  }, [mapInstance, data, selectedMonth]);

  useEffect(() => {
    axios
      .get("http://176.113.83.14:3000/ml-result")
      .then((res) => setData(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!mapInstance || data.length === 0) return;

    mapInstance.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) mapInstance.removeLayer(layer);
    });

    data.forEach(async (row) => {
      const address = row.address;
      const value = parseFloat(row[selectedMonth]);
      if (!address || isNaN(value)) return;

      const coords = await geocode(address);
      if (!coords || !mapInstance || !mapRef.current) return; // ✅ extra safety

      const color = value < 3000 ? "green" : "red";

      const marker = L.circleMarker(coords, {
        radius: 8,
        fillColor: color,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      });

      if (mapInstance && mapRef.current) {
        marker.addTo(mapInstance);
        marker.bindPopup(`<b>${address}</b><br/>${selectedMonth}: ${value}`);
      }
    });
  });
  return (
    <div style={{ height: "100vh" }}>
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        style={{ position: "absolute", zIndex: 1000, margin: "10px" }}>
        <option value="cons_jan">Январь</option>
        <option value="cons_feb">Февраль</option>
        <option value="cons_mar">Март</option>
        {/* Add more months */}
      </select>
      <div ref={mapRef} id="map" style={{ height: "100%" }} />
    </div>
  );

  async function geocode(address) {
    const geoCache = {};
    if (geoCache[address]) return geoCache[address];

    const fallback = address
      .replace(/ул[^,]*/, "") // remove street
      .replace(/д\.[^,]*/, "") // remove house number
      .replace(/\s+/g, " ") // clean double spaces
      .trim()
      .replace(/,+$/, ""); // clean trailing commas

    const tryAddresses = [address, fallback];

    for (const query of tryAddresses) {
      try {
        const res = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
            query
          )}&key=33a2a957177e4eb9a667d2ff9887cf83&limit=1`
        );
        const data = await res.json();

        if (data.results.length) {
          const { lat, lng } = data.results[0].geometry;
          const coords = [lat, lng];
          geoCache[address] = coords;
          return coords;
        } else {
          console.warn(`❌ No geocode result for: ${query}`);
        }
      } catch (err) {
        console.error("Geocoding error:", err, query);
      }
    }

    return null;
  }
};
export default MlMap;
