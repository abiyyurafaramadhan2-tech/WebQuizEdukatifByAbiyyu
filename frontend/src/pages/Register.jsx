import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registrasi gagal.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background:'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)' }}>
      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🎓</div>
          <h1 className="text-3xl font-black text-white">Daftar Gratis!</h1>
          <p className="text-white/50 text-sm mt-1">Mulai perjalanan belajarmu</p>
        </div>

        <div className="glass rounded-3xl p-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 mb-4 text-red-300 text-sm font-semibold">
              ⚠️ {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              { label:'Nama', type:'text',     value:name,     set:setName,     ph:'Nama lengkapmu' },
              { label:'Email',type:'email',    value:email,    set:setEmail,    ph:'email@kamu.com' },
              { label:'Password',type:'password',value:password,set:setPassword,ph:'Min. 6 karakter' },
            ].map(f => (
              <div key={f.label}>
                <label className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1.5 block">{f.label}</label>
                <input type={f.type} required value={f.value} onChange={e => f.set(e.target.value)}
                  placeholder={f.ph}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-indigo-400 transition-colors font-semibold"
                />
              </div>
            ))}
            <motion.button type="submit" disabled={loading} whileTap={{ scale:0.97 }}
              className="btn-primary w-full py-4 text-lg mt-2 disabled:opacity-60">
              {loading ? 'Mendaftar...' : '🎉 Daftar Sekarang!'}
            </motion.button>
          </form>
          <p className="text-center text-white/50 text-sm mt-4 font-semibold">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-indigo-400 font-black hover:text-indigo-300">Login</Link>
          </p>
        </div>
        <p className="text-center text-white/20 text-xs mt-6">© Abiyyu Rafa Ramadhan</p>
      </motion.div>
    </div>
  );
}
