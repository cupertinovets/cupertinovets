import { useEffect, useRef, useState } from "react";
import { YMaps, Map as YMap, Placemark } from "@pbe/react-yandex-maps";
import Navbar from "../navbar/Navbar";

const MlMap = () => {
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [allPoints, setAllPoints] = useState([]);
  const [userCoords, setUserCoords] = useState(null);
  const [showCityPoints, setShowCityPoints] = useState(false);

  const mapRef = useRef(null);
  const ymapsRef = useRef(null);
  const routeRef = useRef(null);
  const geocodeCache = useRef(new Map());

  const geocodeYandex = async (address) => {
    if (geocodeCache.current.has(address))
      return geocodeCache.current.get(address);
    try {
      const res = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?format=json&apikey=01f48e43-929b-4be1-b910-a9dd112ec7dd&geocode=${encodeURIComponent(
          address
        )}`
      );
      const json = await res.json();
      const pos =
        json.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject?.Point
          ?.pos;
      if (!pos) return null;
      const [lng, lat] = pos.split(" ").map(parseFloat);
      const coords = [lat, lng];
      geocodeCache.current.set(address, coords);
      return coords;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCoords([pos.coords.latitude, pos.coords.longitude]),
      () => setUserCoords([55.75, 37.61])
    );
  }, []);

  useEffect(() => {
    const load = async () => {
      const raw = localStorage.getItem("mlMapData");
      if (!raw) return;

      const selected = JSON.parse(raw);
      const selectedWithCoords = [];

      for (const row of selected) {
        const coords = await geocodeYandex(row.address);
        if (!coords) continue;
        selectedWithCoords.push({ ...row, coords, fromRoute: true });
      }

      setSelectedPoints(selectedWithCoords);
      setAllPoints(selectedWithCoords);

      if (!showCityPoints) return;

      const city = selected[0]?.location?.toLowerCase().trim();
      if (!city) return;

      try {
        const res = await fetch("http://176.113.83.14:3000/ml-result");
        const all = await res.json();

        for (const row of all) {
          const loc = row.location?.toLowerCase().trim();
          const confidence = parseFloat(row.confidence);
          if (!loc || loc !== city) continue;
          if (confidence <= 0.65) continue;
          if (selected.some((s) => s.address === row.address)) continue;

          const coords = await geocodeYandex(row.address);
          if (!coords) continue;

          const point = { ...row, coords, fromRoute: false };
          setAllPoints((prev) => [...prev, point]);
        }
      } catch (err) {
        console.error("Ошибка загрузки точек:", err);
      }
    };

    load();
  }, [showCityPoints]);

  const buildRoute = () => {
    if (!mapRef.current || !ymapsRef.current || !userCoords) return;

    if (routeRef.current && typeof routeRef.current.destroy === "function") {
      try {
        routeRef.current.destroy();
      } catch {}
    }

    const refPoints = [
      userCoords,
      ...selectedPoints.map((p) => p.coords),
      userCoords,
    ];

    const route = new ymapsRef.current.multiRouter.MultiRoute(
      { referencePoints: refPoints, params: { routingMode: "auto" } },
      {
        boundsAutoApply: true,
        routeActiveStrokeColor: "#ff0000",
        routeActiveStrokeWidth: 5,
      }
    );

    mapRef.current.geoObjects.removeAll();
    mapRef.current.geoObjects.add(route);
    routeRef.current = route;
  };

  const addPointToRoute = async (point) => {
    const current = JSON.parse(localStorage.getItem("mlMapData") || "[]");
    const alreadyIn = current.some(
      (p) =>
        p.address.toLowerCase().trim() === point.address.toLowerCase().trim()
    );
    if (alreadyIn) return;

    const updated = [...current, point];
    localStorage.setItem("mlMapData", JSON.stringify(updated));

    const coords = await geocodeYandex(point.address);
    if (!coords) return;

    const newPoint = { ...point, coords, fromRoute: true };
    const updatedRoute = [...selectedPoints, newPoint];
    setSelectedPoints(updatedRoute);
    setAllPoints((prev) =>
      prev.map((p) => (p.address === point.address ? newPoint : p))
    );
    buildRoute(updatedRoute);
  };

  const getIcon = (confidence, fromRoute) => {
    if (fromRoute) {
      return "islands#redCircleDotIcon";
    } else {
      return "islands#orangeDotIcon";
    }
  };

  return (
    <div className="mlMapPage">
      <Navbar />
      <div style={{ height: "80vh", position: "relative" }}>
        <YMaps query={{ apikey: "01f48e43-929b-4be1-b910-a9dd112ec7dd" }}>
          <YMap
            defaultState={{ center: [55.75, 37.61], zoom: 6 }}
            width="100%"
            height="100%"
            modules={["multiRouter.MultiRoute"]}
            instanceRef={(ref) => (mapRef.current = ref)}
            onLoad={(ymaps) => {
              ymapsRef.current = ymaps;
              setTimeout(() => {
                if (mapRef.current) {
                  mapRef.current.behaviors.disable("scrollZoom");
                  mapRef.current.behaviors.enable("scrollZoom");
                }
              }, 300);
            }}>
            {allPoints.map((point, i) => (
              <Placemark
                key={i}
                geometry={point.coords}
                properties={{
                  balloonContent: `
                    <div style="font-size:${point.fromRoute ? "13px" : "10px"}">
                      <b>${point.address}</b><br/>
                      Уверенность: ${(
                        parseFloat(point.confidence) * 100
                      ).toFixed(1)}%
                      ${
                        !point.fromRoute
                          ? `<br/><button id="add-${i}" style="font-size:10px;margin-top:4px;">➕ Добавить точку</button>`
                          : ""
                      }
                    </div>
                  `,
                }}
                options={{
                  preset: getIcon(point.confidence, point.fromRoute),
                  iconImageSize: point.fromRoute ? [30, 30] : [20, 20],
                  balloonPanelMaxMapArea: 0,
                }}
                onBalloonOpen={() => {
                  setTimeout(() => {
                    const btn = document.getElementById(`add-${i}`);
                    if (btn) btn.onclick = () => addPointToRoute(point);
                  }, 300);
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
          </YMap>
        </YMaps>

        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            display: "flex",
            gap: "10px",
            zIndex: 1000,
          }}>
          <button
            onClick={() => setShowCityPoints((prev) => !prev)}
            style={{
              padding: "10px 20px",
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
            }}>
            {showCityPoints
              ? "Скрыть подозрительные"
              : "Показать подозрительные"}
          </button>

          <button
            onClick={buildRoute}
            style={{
              padding: "10px 20px",
              background: "#eee",
              border: "1px solid #aaa",
              borderRadius: "4px",
              cursor: "pointer",
            }}>
            Построить маршрут
          </button>
        </div>
      </div>
    </div>
  );
};

export default MlMap;
