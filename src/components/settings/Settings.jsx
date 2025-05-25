import React, { useState } from "react";
import Navbar from "../navbar/Navbar";
import { ALL_LOCATIONS } from "../../constants/locations";

function Settings() {
  const [location, setLocation] = useState(
    localStorage.getItem("userLocation") || ""
  );
  const [suggestions, setSuggestions] = useState([]);

  const saveLocation = () => {
    localStorage.setItem("userLocation", location);
    alert("Локация сохранена!");
  };

  const handleChange = (value) => {
    setLocation(value);
    if (value.length > 1) {
      setSuggestions(
        ALL_LOCATIONS.filter((loc) =>
          loc.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 10)
      );
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="settingsPage">
      <Navbar />
      <div>
        <div className="settingsTxt">
          <h3>Личные данные</h3>
          <p>Иванов Иван Иванович</p>
          <p>email@mail.ru</p>
          <p>
            Отдел эксплуатации систем учета электроэнергии
            <br />
            Ведущий инженер отдела эксплуатации систем учета электроэнергии
          </p>
          <button>Сменить аккаунт</button>
        </div>

        <div className="settingsTxt" style={{ position: "relative" }}>
          <h3>Привязать БД</h3>
          <p>
            Вы можете привязать новое бд или же бд своего района и обновить
            пользовательские данные
          </p>
          <input
            className="location-input"
            type="text"
            placeholder="Введите локацию (например: Центральный район)"
            value={location}
            onChange={(e) => handleChange(e.target.value)}
          />
          {suggestions.length > 0 && (
            <ul
              style={{
                position: "absolute",
                background: "#fff",
                border: "1px solid #ccc",
                listStyle: "none",
                padding: 0,
                marginTop: 0,
                zIndex: 1000,
                width: "100%",
                maxHeight: "150px",
                overflowY: "auto",
              }}>
              {suggestions.map((sug, idx) => (
                <li
                  key={idx}
                  style={{
                    padding: "6px 10px",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setLocation(sug);
                    setSuggestions([]);
                  }}>
                  {sug}
                </li>
              ))}
            </ul>
          )}
          <button onClick={saveLocation}>Сохранить локацию</button>
        </div>

        <div>
          <a href="cupertinovets\\src\\img\\mpdf.pdf" download="mpdf.pdf">
            Скачать инструкцию пользователя
          </a>
        </div>
      </div>
    </div>
  );
}

export default Settings;
