import React, { useEffect, useState } from "react";

const Analysis = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("mlMapData");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.length > 0) {
        setUserData(parsed[0]);
      }
    }
  }, []);

  return (
    <div className="analysisPage">
      <div className="analysisPageTop">
        <h3>Анализ абонентов</h3>
        <div className="analysisPageSearch">
          <input placeholder="Введите адрес" />
          <button type="submit">Найти</button>
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
                  <p>Avito</p> 
                  <div>
                    <label>Найдена 1 ссылка</label>
                    <a href="/mainPage">Подробнее...</a>
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
              <label>1.27</label>
              <div className="SupSubA">
                <sup>МВт</sup>
                <sub>ч/сутки</sub>
              </div>
            </div>
            <div className="analysisAVG">
              <p>Среднее потребление в месяц</p>
              <label>1.27</label>
              <div className="SupSubA">
                <sup>МВт</sup>
                <sub>ч/сутки</sub>
              </div>
            </div>
            <div className="analysisAVG">
              <p>Среднее потребление в месяц</p>
              <label>1.27</label>
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
