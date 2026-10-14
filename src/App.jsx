import { Route, Routes, useLocation } from 'react-router-dom';
import { firebaseConfigError } from './firebase/firebase';
import Navbar from './components/Navbar';
import FruitRain from './components/FruitRain';
import ProtectedRoute from './components/ProtectedRoute';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Level from './pages/Level';
import Completion from './pages/Completion';

const guard = (el) => <ProtectedRoute>{el}</ProtectedRoute>;

export default function App() {
  const location = useLocation();
  return (
    <div className="app-shell">
      <FruitRain />
      {!firebaseConfigError && <Navbar />}
      <main className="page" key={location.pathname}>
        {firebaseConfigError ? (
          <div className="card msg error">{firebaseConfigError}</div>
        ) : (
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={guard(<Dashboard />)} />
            <Route path="/profile" element={guard(<Profile />)} />
            <Route path="/leaderboard" element={guard(<Leaderboard />)} />
            <Route path="/level/:id" element={guard(<Level />)} />
            <Route path="/completion" element={guard(<Completion />)} />
            <Route path="*" element={<div className="card"><h1>404</h1><p>This jungle path does not exist.</p></div>} />
          </Routes>
        )}
      </main>
      <footer className="site-footer">©2026 Developed by Kisara Perera. All rights reserved.</footer>
    </div>
  );
}
