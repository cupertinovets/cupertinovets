import React from "react";
import Logo from "../../img/logoAuth.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Auth() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!login.trim()) {
            setError('Введите логин');
            return;
        }

        if (!password.trim()) {
            setError('Введите пароль');
            return;
        }

        navigate('/mainPage');
    };

    return (
        <form className="authPage" onSubmit={handleSubmit}>
            <div className="authNavbar">
                <img src={Logo} alt="Логотип" />
                <p>Единый контактный центр <br /> 8 (861) 991-07-63</p>
            </div>
            <hr />
            <div className="authForm">
                <h2>Вход</h2>
                <input
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    name="login"
                    placeholder="Логин"
                />
                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    name="password"
                    type="password"
                    placeholder="Пароль"
                />
                {error && <div style={{ color: 'red' }}>{error}</div>}
                <button type="submit">Войти</button>
            </div>
        </form>
    );
}

export default Auth;