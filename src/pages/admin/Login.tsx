import React, { useState } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut 
} from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { useAuth, ADMIN_EMAILS } from '../../App';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
  LogIn, 
  ShieldAlert, 
  User as UserIcon, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  KeyRound,
  Loader2,
  Sparkles
} from 'lucide-react';

export default function Login() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (loading) return null;
  if (user && isAdmin) return <Navigate to="/admin" replace />;

  const resolveAdminEmail = (input: string): string => {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return '';
    if (trimmed === 'admin' || trimmed === 'smpmaarif' || trimmed === 'smpmaarifpandaan') {
      return 'smpmaarifpandaan@gmail.com';
    }
    if (trimmed === 'nawhci' || trimmed === 'nawhci.dark') {
      return 'nawhci.dark@gmail.com';
    }
    return trimmed;
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const targetEmail = resolveAdminEmail(usernameOrEmail);
    if (!targetEmail) {
      setError("Silakan masukkan username atau email admin.");
      return;
    }

    if (!password) {
      setError("Silakan masukkan kata sandi.");
      return;
    }

    if (!ADMIN_EMAILS.includes(targetEmail)) {
      setError(`Akses ditolak: Akun "${usernameOrEmail}" tidak terdaftar sebagai administrator resmi.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
      const email = userCredential.user.email?.toLowerCase().trim();
      if (!email || !ADMIN_EMAILS.includes(email)) {
        setError("Akun Anda tidak memiliki hak akses administrator.");
        await signOut(auth);
        setIsSubmitting(false);
        return;
      }
      navigate('/admin');
    } catch (err: any) {
      console.error("Login error:", err);
      // If user is not yet created in Firebase Auth for this authorized admin email, try creating it
      if (err.code === 'auth/user-not-found' && password.length >= 6) {
        try {
          const newCredential = await createUserWithEmailAndPassword(auth, targetEmail, password);
          if (newCredential.user) {
            navigate('/admin');
            return;
          }
        } catch (createErr: any) {
          console.error("Auto-provisioning error:", createErr);
        }
      }

      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Kata sandi atau username salah. Silakan periksa kembali.");
      } else if (err.code === 'auth/user-not-found') {
        setError("Akun belum terdaftar. Masukkan kata sandi minimal 6 karakter untuk mendaftarkan akun administrator pertama kali.");
      } else if (err.code === 'auth/weak-password') {
        setError("Kata sandi minimal 6 karakter.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Format username atau email tidak valid.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Terlalu banyak percobaan gagal. Silakan tunggu beberapa menit sebelum mencoba lagi.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Login Email/Password belum diaktifkan di Firebase Console Authentication. Anda dapat menggunakan tombol Otentikasi Google.");
      } else {
        setError("Terjadi kesalahan: " + (err.message || "Gagal masuk."));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const targetEmail = resolveAdminEmail(usernameOrEmail);
    if (!targetEmail) {
      setError("Ketikkan username atau email admin terlebih dahulu untuk mereset kata sandi.");
      return;
    }
    if (!ADMIN_EMAILS.includes(targetEmail)) {
      setError(`Email "${targetEmail}" bukan email administrator yang terdaftar.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setSuccessMsg(`Tautan reset kata sandi telah dikirim ke ${targetEmail}. Silakan periksa kotak masuk atau folder spam email Anda.`);
    } catch (err: any) {
      setError("Gagal mengirim email reset: " + (err.message || "Periksa kembali username/email Anda."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email?.toLowerCase().trim();
      if (!email || !ADMIN_EMAILS.includes(email)) {
        setError("Maaf, akun Google Anda tidak terdaftar sebagai administrator.");
        await signOut(auth);
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain') {
        setError("Domain ini belum diizinkan di Firebase Console. Harap tambahkan domain hosting ke 'Authorized Domains' di Firebase Authentication.");
      } else if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-by-user') {
        setError("Login dengan Google dibatalkan.");
      } else {
        setError("Terjadi kesalahan saat login Google: " + (err.message || "Unknown error"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-md w-full bg-white rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-12 shadow-2xl space-y-8 relative overflow-hidden border border-slate-100">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700" />
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="bg-emerald-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto text-emerald-700 border border-emerald-100 shadow-sm transition-transform hover:scale-105 duration-300">
            <KeyRound size={36} strokeWidth={1.75} />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">Portal Admin</h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm leading-relaxed">
              Masuk untuk mengelola data dan konten SMP Maarif NU Pandaan.
            </p>
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl flex items-start gap-3 text-left text-xs font-semibold border border-red-100 animate-in fade-in duration-200">
            <ShieldAlert className="shrink-0 mt-0.5 text-red-500" size={16} />
            <p className="leading-snug">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl flex items-start gap-3 text-left text-xs font-semibold border border-emerald-100 animate-in fade-in duration-200">
            <CheckCircle2 className="shrink-0 mt-0.5 text-emerald-600" size={16} />
            <p className="leading-snug">{successMsg}</p>
          </div>
        )}

        {/* Username & Password Form */}
        <form onSubmit={handlePasswordLogin} className="space-y-4 text-left">
          {/* Username / Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block ml-1">
              Username atau Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <UserIcon size={18} />
              </div>
              <input 
                type="text"
                required
                autoComplete="username"
                placeholder="admin atau smpmaarifpandaan@gmail.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Kata Sandi
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
              >
                Lupa sandi?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Masukkan kata sandi..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-11 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Quick autofill helper tag */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setUsernameOrEmail('admin');
              }}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors border border-slate-200/60"
            >
              <Sparkles size={12} className="text-emerald-600" />
              <span>Gunakan username: <strong className="text-slate-800 font-bold">admin</strong></span>
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Masuk Sekarang</span>
                <ArrowRight size={16} className="ml-0.5" />
              </>
            )}
          </button>
        </form>

        {/* Alternative Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            atau
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {/* Google Authentication Alternative */}
        <button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-700 hover:bg-slate-50 hover:border-emerald-500 hover:text-emerald-700 transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed group"
        >
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google" 
            className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" 
          />
          <span>Masuk dengan Akun Google</span>
        </button>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">
            Sistem Informasi SMP Maarif NU Pandaan
          </p>
        </div>
      </div>
    </div>
  );
}
