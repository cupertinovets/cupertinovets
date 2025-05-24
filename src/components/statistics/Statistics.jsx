import React, { useState } from "react";
import Navbar from "../navbar/Navbar";
import HourlyEnergyChart from "../graphStatisticsFirst/graphStatisticsFirst";
import RegionPieChart from "../graphStatisticsSecond/GraphStatisticsSecond";
import StreetPieChart from "../graphStatisticsThird/GraphStatisticsSecond";
import Analysis from "../analysis/Analysis";


function Statistics() {
    const [activeGraph, setActiveGraph] = useState('graph5');
  
    const graphMenuItems = [
        { id: 'graph1', label: 'Почасовая статистика', component: <HourlyEnergyChart /> },
        { id: 'graph2', label: 'Районная статистика', component: <RegionPieChart /> },
        { id: 'graph3', label: 'Месячная статистика', component: <StreetPieChart /> },
        { id: 'graph4', label: 'Подозрительная активность', component: <HourlyEnergyChart /> },
        { id: 'graph5', label: 'Анализ абонентов', component: <Analysis /> }
    ];

    return (
        <div className="statisticsPage">
            <Navbar />
            
            <div className="graphContainer">
                <div className="graphSelector">
                    <ul className="graphMenu">
                        {graphMenuItems.map((item) => (
                            <li
                                key={item.id}
                                className={`menuItem ${activeGraph === item.id ? 'active' : ''}`}
                                onClick={() => setActiveGraph(item.id)}
                            >
                                {item.label}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="graphDisplay">
                    {graphMenuItems.find(item => item.id === activeGraph)?.component}
                </div>
            </div>
        </div>
    );
}

export default Statistics;