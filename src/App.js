import './App.css';
import Auth from "./components/auth/Auth";
import Navbar from './components/navbar/Navbar';
import MainPage from './components/mainPage/MainPage';
import Statistics from "./components/statistics/Statistics";
import Settings from './components/settings/Settings';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path='/' element={<Auth />} />
          <Route path='/mainPage' element={<MainPage />} />
          <Route path='/statistics' element={<Statistics />} />
          <Route path='/settings' element={<Settings />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
