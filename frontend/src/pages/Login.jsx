import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal. Coba lagi.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background:'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)' }}>
      <motion.div initial={{ opacity:0, y:30, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }}
        className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div className="text-7xl mb-3"
            animate={{ y:[0,-10,0] }} transition={{ duration:2, repeat:Infinity }}>🧠</motion.div>
          <h1 className="text-3xl font-black text-white">Quiz<span className="text-indigo-400">Genius</span> AI</h1>
          <p className="text-white/50 text-sm mt-1">Belajar lebih pintar dengan AI</p>
        </div>

        {/* Form */}
        <div className="glass rounded-3xl p-6">
          <h2 className="text-xl font-black text-white mb-5 text-center">Login</h2>
          {error && (
            <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 mb-4 text-red-300 text-sm font-semibold">
              ⚠️ {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1.5 block">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="email@kamu.com"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-indigo-400 transition-colors font-semibold"
              />
            </div>
            <div>
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1.5 block">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-indigo-400 transition-colors font-semibold"
              />
            </div>
            <motion.button type="submit" disabled={loading}
              whileTap={{ scale:0.97 }}
              className="btn-primary w-full py-4 text-lg mt-2 disabled:opacity-60">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span animate={{ rotate:360 }} transition={{ duration:0.8, repeat:Infinity, ease:'linear' }}
                    className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"/>
                  Loading...
                </span>
              ) : '🚀 Masuk'}
            </motion.button>
          </form>
          <p className="text-center text-white/50 text-sm mt-4 font-semibold">
            Belum punya akun?{' '}
            <Link to="/register" className="text-indigo-400 font-black hover:text-indigo-300">Daftar</Link>
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">© Abiyyu Rafa Ramadhan</p>
      </motion.div>
    </div>
  );
}
