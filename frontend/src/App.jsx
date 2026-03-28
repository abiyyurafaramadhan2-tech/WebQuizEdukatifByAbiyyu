import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute  from './components/ProtectedRoute';
import Login           from './pages/Login';
import Register        from './pages/Register';
import Dashboard       from './pages/Dashboard';
import CategorySelect  from './pages/CategorySelect';
import SubCategorySelect from './pages/SubCategorySelect';
import ModeSelect      from './pages/ModeSelect';
import QuizArena       from './pages/QuizArena';
import QuizResult      from './pages/QuizResult';
import Leaderboard     from './pages/Leaderboard';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl animate-bounce">🧠</div>
          <p className="text-white/60 font-bold tracking-widest text-sm uppercase">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login"    element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/category"    element={<ProtectedRoute><CategorySelect /></ProtectedRoute>} />
      <Route path="/subcategory" element={<ProtectedRoute><SubCategorySelect /></ProtectedRoute>} />
      <Route path="/mode"        element={<ProtectedRoute><ModeSelect /></ProtectedRoute>} />
      <Route path="/quiz"        element={<ProtectedRoute><QuizArena /></ProtectedRoute>} />
      <Route path="/result"      element={<ProtectedRoute><QuizResult /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
