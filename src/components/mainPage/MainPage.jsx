import React from "react";
import Warning from "../../img/warning.png"
import Navbar from "../navbar/Navbar";
import Graph from "../mainPageGraph/MainPageGraph";

function MainPage(){
     const items = [
    { id: 1, content: 'На объекте [адрес/ID] зафиксирован рост потребления на 350% за последние 24 часа.' },
    { id: 2, content: 'На объекте [адрес/ID] зафиксирован рост потребления на 350% за последние 24 часа.' },
    { id: 3, content: 'На объекте [адрес/ID] зафиксирован рост потребления на 350% за последние 24 часа.' },
    { id: 4, content: 'На объекте [адрес/ID] зафиксирован рост потребления на 350% за последние 24 часа.' },
    { id: 5, content: 'На объекте [адрес/ID] зафиксирован рост потребления на 350% за последние 24 часа.' },
    { id: 6, content: 'На объекте [адрес/ID] зафиксирован рост потребления на 350% за последние 24 часа.' },
    { id: 7, content: 'На объекте [адрес/ID] зафиксирован рост потребления на 350% за последние 24 часа.' },
  ];

    return(
        <div className="mainPage">
            <Navbar />
            <div className="mainPageBody">
                <div className="mainPageBodyLeft">
                    <div className="mainPageBodyLeftTxt">
                        <h3>Личные данные</h3>
                        <p>Иванов Иван Иванович</p>
                        <p>email@mail.ru</p>
                        <p>Отдел эксплуатации систем учета электроэнергии<br/>Ведущий инженер отдела эксплуатации систем учета электроэнергии</p>
                    </div>
                    <h3>События</h3>
                    <div className="verticalCarouselContainer">
                        <div className="verticalCarousel">
                            {items.map((item) => (
                            <div key={item.id} className="carouselItem">
                                <img src={Warning} alt="WARNNIG"/>
                                <div>
                                    <h4>Подозрительная активность</h4>
                                    <p>{item.content}</p>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mainPageBodyRight">
                    <div className="mainPageBodyRightBlocks">
                        <div className="mainPageBodyRightBlock1">
                            <p>Кол-во активных инцидентов (подозрений)</p>
                            <label>42</label>
                        </div>
                        <div className="mainPageBodyRightBlock2">
                            <p>Суммарное аномальное потребление</p>
                            <div className="SupSubBlock">
                                <label>1.27</label>
                                <div className="SupSub">
                                    <sup>МВт</sup><sub>ч/сутки</sub>
                                </div>
                            </div>
                        </div>
                        <div className="mainPageBodyRightBlock3">
                            <p>Оценка потерь по подозреваемым абонентам</p>
                            <div className="SupSubBlock">
                                <label>846т </label>
                                <div className="SupSub">
                                    <sup>₽ в </sup><sub> мес</sub>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mainPageBodyRightGraph">
                        <h4>График: динамика нарушений по районам<br/> 
                        (линии или гистограмма)</h4>
                        <div className="mainPageBodyRightGraphDiv">
                            <Graph />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default MainPage;
