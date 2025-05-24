import React from "react";
import Navbar from "../navbar/Navbar";

function Settings(){
    return(
        <div className="settingsPage">
            <Navbar />
            <div>
                <div className="settingsTxt">
                    <h3>Личные данные</h3>
                    <p>Иванов Иван Иванович</p>
                    <p>email@mail.ru</p>
                    <p>Отдел эксплуатации систем учета электроэнергии<br/>Ведущий инженер отдела эксплуатации систем учета электроэнергии</p>
                    <button>Сменить аккаунт</button>
                </div>
                <div className="settingsTxt">
                    <h3>Привязать БД</h3>
                    <p>Вы можете привязать новое бд или же бд своего района и обновить пользовательские данные</p>
                    <button>Привязать БД</button>
                </div>
            </div>
        </div>
    )
}

export default Settings;
