import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { useAuth } from '../../App';
import { useNavigate, Navigate } from 'react-router-dom';
import { LogIn, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export default function Login() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  if (loading) return null;
  if (user && isAdmin) return <Navigate to="/admin" replace />;

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // User is checked in App.tsx via useAuth
      const adminEmails = ['nawhci.dark@gmail.com', 'smpmaarifpandaan@gmail.com'];
      if (!result.user.email || !adminEmails.includes(result.user.email)) {
        setError("Maaf, akun Anda tidak terdaftar sebagai admin.");
        await signOut(auth);
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain') {
        setError("Domain ini belum diizinkan di Firebase Console. Harap tambahkan domain hosting Anda ke 'Authorized Domains' di Authentication > Settings > Authorized domains di Firebase Console.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("Login dibatalkan (popup ditutup).");
      } else if (err.code === 'auth/cancelled-by-user') {
        setError("Login dibatalkan.");
      } else {
        setError("Terjadi kesalahan saat login: " + (err.message || "Unknown error"));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3.5rem] p-12 md:p-16 shadow-2xl space-y-12 text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-600" />
        
        <div className="space-y-6">
          <div className="bg-slate-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto text-slate-800 border border-slate-100 shadow-inner">
             <LogIn size={40} strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Admin Portal</h1>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">Akses terbatas untuk pengelolaan infrastruktur digital SMP Maarif NU Pandaan.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-5 rounded-2xl flex items-start gap-3 text-left text-xs font-bold border border-red-100 animate-shake">
            <ShieldAlert className="shrink-0 mt-0.5" size={16} />
            <p>{error}</p>
          </div>
        )}

        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-4 bg-white border border-slate-200 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:border-emerald-500 hover:text-emerald-700 transition-all shadow-sm active:scale-[0.98] group"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" />
          Otentikasi Google
        </button>

        <div className="pt-8 border-t border-slate-100">
           <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Sistem Informasi Akademik</p>
        </div>
      </div>
    </div>
  );
}
