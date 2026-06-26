import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (response.ok && result.token) {
        localStorage.setItem('admin_token', result.token);
        navigate('/admin');
      } else {
        setError(result.error || 'Mot de passe incorrect');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <img
            src="/Le_logo_1_-removebg-preview_(1).png"
            alt="Sam Cars Shop"
            className="h-16 w-auto mx-auto mb-6"
          />
          <div className="flex items-center justify-center gap-3 mb-3">
            <Shield size={20} className="text-gold" />
            <h1 className="font-serif text-2xl font-light text-white tracking-wide">Espace Admin</h1>
          </div>
          <p className="font-sans text-xs text-gray-500 tracking-widest uppercase">
            Sam Cars Shop — Administration
          </p>
        </div>

        <div className="bg-black-700 border border-black-400 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="font-sans text-xs text-gray-400 tracking-wider uppercase block mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Saisissez le mot de passe"
                  required
                  className="input-luxury pl-11"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-sans py-2 px-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full gap-2 disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black-900/30 border-t-black-900 rounded-full animate-spin" />
                  Connexion...
                </span>
              ) : (
                <>
                  <span className="font-sans text-xs tracking-widest uppercase">Se connecter</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="font-sans text-xs text-gray-500 hover:text-gold transition-colors duration-300"
            >
              Retour au site
            </button>
          </div>
        </div>

        <p className="text-center font-sans text-xs text-gray-600 mt-6">
          Mot de passe par défaut : <span className="text-gold">admin123</span>
        </p>
      </div>
    </div>
  );
}
