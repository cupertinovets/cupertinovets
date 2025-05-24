import { useEffect, useState } from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import Navbar from "../navbar/Navbar";

const MlMap = () => {
  const [data, setData] = useState([]);
  const [points, setPoints] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("cons_jan");

  useEffect(() => {
    const raw = localStorage.getItem("mlMapData");
    if (raw) {
      const parsed = JSON.parse(raw);
      setData(parsed);
    }
  }, []);

  useEffect(() => {
    const fetchCoords = async () => {
      const result = [];

      for (const row of data) {
        const address = row.address;
        const value = parseFloat(row[selectedMonth]);
        if (!address || isNaN(value)) continue;

        const coords = await geocodeYandex(address);
        if (coords) {
          result.push({
            coords,
            address,
            value,
          });
        }
      }

      setPoints(result);
    };

    if (data.length > 0) {
      fetchCoords();
    }
  }, [data, selectedMonth]);

  async function geocodeYandex(address) {
    try {
      const res = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?format=json&apikey=2f6fb731-4e78-422f-984e-5182bc91df11&geocode=${encodeURIComponent(
          address
        )}`
      );
      const json = await res.json();
      const pos =
        json.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject?.Point
          ?.pos;

      if (!pos) return null;

      const [lng, lat] = pos.split(" ").map(parseFloat);
      return [lat, lng];
    } catch (err) {
      console.warn("Geocode failed:", address, err);
      return null;
    }
  }

  return (
    <div className="mlMapPage">
      <Navbar />
      <div style={{ height: "80vh" }}>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{ position: "absolute", zIndex: 1000, margin: "10px" }}>
          <option value="cons_jan">Январь</option>
          <option value="cons_feb">Февраль</option>
          <option value="cons_mar">Март</option>
        </select>

        <YMaps query={{ apikey: "2f6fb731-4e78-422f-984e-5182bc91df11" }}>
          <Map
            defaultState={{ center: [55.75, 37.61], zoom: 6 }}
            width="100%"
            height="100%"
            instanceRef={(ref) => {
              if (ref && points.length > 0) {
                const bounds = points.map((p) => p.coords);
                ref.setBounds(bounds, { checkZoomRange: true });
              }
            }}>
            {points.map((point, i) => (
              <Placemark
                key={i}
                geometry={point.coords}
                properties={{
                  balloonContent: `<b>${point.address}</b><br/>${selectedMonth}: ${point.value}`,
                }}
                options={{
                  preset:
                    point.value < 3000
                      ? "islands#greenDotIcon"
                      : "islands#redDotIcon",
                }}
              />
            ))}
          </Map>
        </YMaps>
      </div>
    </div>
  );
};

export default MlMap;
