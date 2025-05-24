import React from "react";
import Logo from "../../img/logoMain.png";
import Notification from "../../img/Notification.png";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {
    const [time, setTime] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const updateTime = () => {
            const moscowTime = new Date().toLocaleTimeString('ru-RU', {
                timeZone: 'Europe/Moscow',
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            });
            setTime(moscowTime);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);

        return () => clearInterval(interval);
    }, []);

    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, text: 'Новое сообщение', read: false },
        { id: 2, text: 'Напоминание: совещание в 18:00', read: false },
        { id: 3, text: 'Система обновлена', read: false },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const togglePopup = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        }
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const getActiveClass = (path) => {
        return location.pathname === path ? "active" : "";
    };

    return (
        <div className="navbar">
            <div className="navbarTop">
                <img 
                    src={Logo} 
                    className="logoNavbar" 
                    onClick={() => navigate("/mainPage")} 
                    alt="Логотип"
                />
                <div className="navbarContainer">
                    <p>{time}</p>
                    <div className="notifications-container">
                        <div className="notification-icon" onClick={togglePopup}>
                            <img src={Notification} alt="Уведомления"/>
                            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                        </div>

                        {isOpen && (
                            <div className="notification-popup">
                                <div className="popup-header">
                                    <h3>Уведомления</h3>
                                    <button onClick={clearAll} className="clear-btn">Очистить все</button>
                                </div>
                                
                                {notifications.length > 0 ? (
                                    <ul className="notification-list">
                                        {notifications.map(notification => (
                                            <li 
                                                key={notification.id} 
                                                className={notification.read ? 'read' : 'unread'}
                                            >
                                                {notification.text}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="empty-notifications">Нет новых уведомлений</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <hr/>

            <ul className="navbarLinks">
                <li 
                    className={getActiveClass('/statistics')} 
                    onClick={() => navigate('/statistics')}
                >
                    Статистика
                </li>
                <li 
                    className={getActiveClass('/MlMap')} 
                    onClick={() => navigate('/MlMap')}
                >
                    Карта потребления
                </li>
                <li 
                    className={getActiveClass('/reports')} 
                    onClick={() => navigate('/reports')}
                >
                    Отчеты
                </li>
                <li 
                    className={getActiveClass('/settings')} 
                    onClick={() => navigate('/settings')}
                >
                    Настройки
                </li>
            </ul>
        </div>
    )
}

export default Navbar;