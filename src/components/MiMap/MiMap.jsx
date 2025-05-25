import { useEffect, useRef, useState } from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import Navbar from "../navbar/Navbar";

const MlMap = () => {
  const [data, setData] = useState([]);
  const [points, setPoints] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("cons_jan");

  const mapRef = useRef(null);
  const ymapsRef = useRef(null);
  const [userCoords, setUserCoords] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("mlMapData");
    if (raw) {
      const parsed = JSON.parse(raw);
      setData(parsed);
    }
  }, []);

  useEffect(() => {
    // Get user's location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserCoords(coords);
      },
      (err) => {
        console.warn("Geolocation denied or failed", err);
        setUserCoords([55.75, 37.61]); // fallback: Moscow
      }
    );
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
          result.push({ coords, address, value });
        }
      }

      setPoints(result);
    };

    if (data.length > 0) {
      fetchCoords();
    }
  }, [data, selectedMonth]);

  useEffect(() => {
    if (
      !userCoords ||
      !ymapsRef.current ||
      !mapRef.current ||
      points.length === 0
    )
      return;

    // Sort by distance from user
    const sorted = [...points].sort(
      (a, b) =>
        getDistance(userCoords, a.coords) - getDistance(userCoords, b.coords)
    );

    const refPoints = [
      userCoords,
      ...sorted.map((p) => p.coords),
      userCoords, // return back
    ];

    const multiRoute = new ymapsRef.current.multiRouter.MultiRoute(
      {
        referencePoints: refPoints,
        params: { routingMode: "auto" },
      },
      {
        boundsAutoApply: true,
        routeActiveStrokeColor: "#ff0000",
        routeActiveStrokeWidth: 5,
      }
    );

    mapRef.current.geoObjects.removeAll();
    mapRef.current.geoObjects.add(multiRoute);
  }, [userCoords, points]);

  function getDistance(a, b) {
    const [lat1, lon1] = a;
    const [lat2, lon2] = b;
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const rLat1 = lat1 * rad;
    const rLat2 = lat2 * rad;
    const aHarv =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(aHarv)); // km
  }

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
        <YMaps query={{ apikey: "2f6fb731-4e78-422f-984e-5182bc91df11" }}>
          <Map
            defaultState={{ center: [55.75, 37.61], zoom: 6 }}
            width="100%"
            height="100%"
            modules={["multiRouter.MultiRoute"]}
            instanceRef={(ref) => {
              mapRef.current = ref;
            }}
            onLoad={(ymaps) => {
              ymapsRef.current = ymaps;
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
            {userCoords && (
              <Placemark
                geometry={userCoords}
                properties={{ balloonContent: "📍 Вы здесь" }}
                options={{ preset: "islands#bluePersonIcon" }}
              />
            )}
          </Map>
        </YMaps>
      </div>
    </div>
  );
};

export default MlMap;
