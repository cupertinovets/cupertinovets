import React, { useEffect, useState } from "react";

const Analysis = () => {
  const [userData, setUserData] = useState(null);
  const [mlData, setMlData] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem("mlMapData");
    if (raw) {
      const parsed = JSON.parse(raw);
      setMlData(parsed);
      if (parsed.length > 0) {
        setUserData(parsed[0]);
      }
    }
  }, []);

  return (
    <div className="analysisPage">
      <div className="analysisPageTop">
        <h3>Анализ абонентов</h3>
        <div className="analysisPageSearch" style={{ position: "relative" }}>
          <input
            placeholder="Введите адрес"
            value={query}
            onChange={(e) => {
              const value = e.target.value;
              setQuery(value);
              setSuggestions(
                value.length > 1
                  ? mlData.filter((item) =>
                      item.address.toLowerCase().includes(value.toLowerCase())
                    )
                  : []
              );
            }}
          />
          <button
            type="submit"
            onClick={() => {
              const match = mlData.find(
                (row) => row.address.toLowerCase() === query.toLowerCase()
              );
              if (match) {
                setUserData(match);
                setSuggestions([]);
              }
            }}>
            Найти
          </button>

          {suggestions.length > 0 && (
            <ul
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #ccc",
                zIndex: 1000,
                listStyle: "none",
                margin: 0,
                padding: 0,
                maxHeight: "150px",
                overflowY: "auto",
              }}>
              {suggestions.map((sug, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setUserData(sug);
                    setQuery(sug.address);
                    setSuggestions([]);
                  }}
                  style={{
                    padding: "8px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}>
                  {sug.address}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="analysisPageMain">
        <div className="analysisPageLeft">
          <div>
            <h3>Личная информация</h3>
            <div className="analysisPageInf">
              <div>
                <p>ID</p> <label>{userData?.id || "—"}</label>
              </div>
              <div>
                <p>Адрес</p> <label>{userData?.address || "—"}</label>
              </div>
              <div>
                <p>Email</p> <label>mail@mail.com</label>
              </div>
              <div>
                <p>Телефон</p> <label>+7 (904) 245-45-45</label>
              </div>
            </div>
          </div>

          <div className="analysisPageDown">
            <div>
              <h3>Дополнительная информация</h3>
              <div className="analysisPageLinks">
                <div className="LinksItem">
                  <p>2gis</p>
                  <div>
                    <label>Найдена 1 ссылка</label>
                    <a href="/mainPage">Подробнее...</a>
                  </div>
                </div>
                <div className="LinksItem">
                  <p>YandexMaps</p>
                  <div>
                    <label>Найдена 1 ссылка</label>
                    <a href="/mainPage">Подробнее...</a>
                  </div>
                </div>
                <div className="LinksItem">
                  <p>YandexMaps</p>
                  <div>
                    <label>Найдена 1 ссылка</label>
                    <a href="/mainPage">Подробнее...</a>
                  </div>
                </div>
                <div className="LinksItem">
                  <p>Avito</p>
                  <div>
                    <label>Найдена 1 ссылка</label>
                    <a>Подробнее...</a>
                  </div>
                </div>
                <div className="LinksItem">
                  <p>VK</p>
                  <div>
                    <label>Найдена 1 ссылка</label>
                    <a href="/mainPage">Подробнее...</a>
                  </div>
                </div>
              </div>
            </div>
            <button className="analysisPageBtn">В избранное</button>
          </div>
        </div>
        <div className="analysisPageRight">
          <div className="analysisPageRight1">
            <div className="analysisAVG">
              <p>Среднее потребление в месяц</p>
              <label>{parseFloat(userData?.cons_avg).toFixed(1) || "—"}</label>
              <div className="SupSubA">
                <sup>МВт</sup>
                <sub>ч/сутки</sub>
              </div>
            </div>
            <div className="analysisAVG">
              <p>Общий объем энергосбыта</p>
              <label>{userData?.cons_total || "—"}</label>
              <div className="SupSubA">
                <sup>МВт</sup>
                <sub>ч/сутки</sub>
              </div>
            </div>
            <div className="analysisAVG">
              <p>Суммарное аномальное потребление</p>
              <label>{userData?.deviation || "—"}</label>
              <div className="SupSubA">
                <sup>МВт</sup>
                <sub>ч/сутки</sub>
              </div>
            </div>
          </div>
          <div className="analysisBTN">
            <button>Посмотреть на карте</button>
            <button>Сформировать отчет</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
