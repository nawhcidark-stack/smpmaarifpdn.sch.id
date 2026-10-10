import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  KeyRound, 
  LogIn, 
  LayoutDashboard, 
  LogOut, 
  X, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../App';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AdminShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolName?: string;
}

export default function AdminShortcutModal({ isOpen, onClose, schoolName = 'SMP Maarif NU Pandaan' }: AdminShortcutModalProps) {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavigateToLogin = () => {
    onClose();
    navigate('/admin/login');
  };

  const handleNavigateToDashboard = () => {
    onClose();
    navigate('/admin');
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden text-left animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Tutup (Esc)"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
            <KeyRound size={26} strokeWidth={2} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sparkles size={11} className="text-emerald-700" />
              <span>Shortcut Terdeteksi (2x Klik)</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Pintasan Akses Admin
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Portal pengelolaan {schoolName}
            </p>
          </div>
        </div>

        {/* Status & Content Body */}
        {user && isAdmin ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Status: Terautentikasi sebagai Admin</p>
                <p className="text-emerald-700 truncate max-w-[240px] font-mono text-[11px]">
                  {user.email || 'Administrator'}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleNavigateToDashboard}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-700/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={18} />
                  <span>Buka Dashboard Admin</span>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                <LogOut size={15} />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-600 text-xs leading-relaxed space-y-2">
              <p className="font-semibold text-slate-800">
                Menu akses cepat khusus administrator.
              </p>
              <p className="text-[11px] text-slate-500">
                Gunakan kredensial resmi (username <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-bold">admin</code> atau email terdaftar beserta kata sandi) untuk masuk ke panel pengelolaan website.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleNavigateToLogin}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <LogIn size={18} />
                  <span>Masuk ke Halaman Login</span>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Kembali ke Website
              </button>
            </div>
          </div>
        )}

        {/* Tip / Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Tip: Klik 2x logo di bilah atas kapan saja</span>
          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-500">ESC</span>
        </div>
      </div>
    </div>
  );
}
