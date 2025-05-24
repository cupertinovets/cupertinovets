import React, { useState } from "react";
import Logo from "../../img/logoAuth.png";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Введите email и пароль");
      return;
    }

    try {
      const response = await fetch("http://176.113.83.14:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, location }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ошибка регистрации");
        return;
      }

      localStorage.setItem("token", data.token); // optional if backend returns it
      navigate("/mainPage");
    } catch (err) {
      console.error("Register error:", err);
      setError("Ошибка сервера");
    }
  };

  return (
    <form className="authPage" onSubmit={handleRegister}>
      <div className="authNavbar">
        <img src={Logo} alt="Логотип" />
        <p>
          Единый контактный центр <br /> 8 (861) 991-07-63
        </p>
      </div>
      <hr />
      <div className="authForm">
        <h2>Регистрация</h2>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Пароль"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Регион (опционально)"
        />
        {error && <div style={{ color: "red" }}>{error}</div>}
        <button type="submit">Зарегистрироваться</button>
      </div>
    </form>
  );
}

export default Register;
