import React, { useState, useEffect } from "react";
import Navbar from "../navbar/Navbar";
import HourlyEnergyChart from "../graphStatisticsFirst/graphStatisticsFirst";
import RegionPieChart from "../graphStatisticsSecond/GraphStatisticsSecond";
import StreetPieChart from "../graphStatisticsThird/GraphStatisticsSecond";
import Analysis from "../analysis/Analysis";

function Statistics() {
  const [activeGraph, setActiveGraph] = useState("graph4");
  const [mlData, setMlData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const graphMenuItems = [
    {
      id: "graph1",
      label: "Почасовая статистика",
      component: <HourlyEnergyChart />,
    },
    {
      id: "graph2",
      label: "Районная статистика",
      component: <RegionPieChart />,
    },
    {
      id: "graph3",
      label: "Месячная статистика",
      component: <StreetPieChart />,
    },
    { id: "graph4", label: "Подозрительная активность", component: null },
    { id: "graph5", label: "Анализ абонентов", component: <Analysis /> },
  ];

  const getBuildingType = (code) => {
    switch (parseInt(code)) {
      case 0:
        return "Гараж";
      case 1:
        return "Дача";
      case 2:
        return "Многоквартирный";
      case 3:
        return "Прочий";
      case 5:
        return "Частный";
      default:
        return "Неизвестно";
    }
  };

  useEffect(() => {
    if (activeGraph !== "graph4") return;

    fetch("http://176.113.83.14:3000/ml-result")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((row) => row.commercial == 1);
        setMlData(filtered);
      })
      .catch((err) => console.error("ML data fetch error:", err));
  }, [activeGraph]);

  return (
    <div className="statisticsPage">
      <Navbar />

      <div className="graphContainer">
        <div className="graphSelector">
          <ul className="graphMenu">
            {graphMenuItems.map((item) => (
              <li
                key={item.id}
                className={`menuItem ${
                  activeGraph === item.id ? "active" : ""
                }`}
                onClick={() => setActiveGraph(item.id)}>
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        {activeGraph === "graph4" && (
          <div className="suspiciousTableWrapper">
            <h3>Подозрительная активность в Центральном районе</h3>
            <div
              style={{
                maxHeight: "400px",
                overflowY: "scroll",
                border: "1px solid #ccc",
              }}>
              <table className="suspiciousTable">
                <thead>
                  <tr>
                    <th></th>
                    <th>id</th>
                    <th>адрес</th>
                    <th>КОЛ-ВО ЖИТЕЛЕЙ</th>
                    <th>тип</th>
                    <th>мес.стат</th>
                    <th>объем</th>
                    <th>вероятность</th>
                  </tr>
                </thead>
                <tbody>
                  {mlData.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="checkbox"
                          value={row.id}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows((prev) => [...prev, row]);
                            } else {
                              setSelectedRows((prev) =>
                                prev.filter((r) => r.id !== row.id)
                              );
                            }
                          }}
                        />
                      </td>
                      <td>{row.id}</td>
                      <td>{row.address}</td>
                      <td>{row.residents_count}</td>
                      <td>{getBuildingType(row.building_type)}</td>
                      <td>{parseFloat(row.cons_avg).toFixed(1)}</td>
                      <td>{row.cons_total}</td>
                      <td>{row.confidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => {
                localStorage.setItem("mlMapData", JSON.stringify(selectedRows));
                if (selectedRows.length === 1) {
                  setActiveGraph("graph5");
                } else {
                  window.location.href = "/mlmap";
                }
              }}
              disabled={selectedRows.length === 0}>
              Перейти к карте
            </button>
          </div>
        )}

        <div className="graphDisplay">
          {graphMenuItems.find((item) => item.id === activeGraph)?.component}
        </div>
      </div>
    </div>
  );
}

export default Statistics;
