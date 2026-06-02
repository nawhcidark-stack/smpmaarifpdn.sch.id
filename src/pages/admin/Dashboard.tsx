import { Link, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Newspaper, 
  Image as ImageIcon, 
  Users, 
  Mail, 
  LogOut, 
  PlusCircle, 
  ExternalLink,
  ChevronRight,
  Layout,
  Settings,
  Trophy,
  Video,
  Package,
  FileText
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useEffect, useState } from 'react';
import { collection, query, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    articles: 0,
    gallery: 0,
    teachers: 0,
    messages: 0,
    slides: 0,
    achievements: 0,
    videos: 0,
    sarpras: 0
  });
  const [recentMessages, setRecentMessages] = useState<any[]>([]);

  useEffect(() => {
    const collections = ['articles', 'gallery', 'teachers', 'messages', 'slides', 'achievements', 'videos', 'sarpras'];
    const unsubscribes = collections.map(col => 
      onSnapshot(collection(db, col), (snap) => {
        setStats(prev => ({ ...prev, [col]: snap.size }));
      })
    );

    const qMessages = query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(5));
    const unsubMessages = onSnapshot(qMessages, (snap) => {
      setRecentMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
      unsubMessages();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  const menuItems = [
    { label: 'Berita & Info', icon: Newspaper, count: stats.articles, path: '/admin/articles', color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Galeri Foto', icon: ImageIcon, count: stats.gallery, path: '/admin/gallery', color: 'bg-blue-50 text-blue-700' },
    { label: 'Galeri Video', icon: Video, count: stats.videos, path: '/admin/videos', color: 'bg-rose-50 text-rose-700' },
    { label: 'Slide Beranda', icon: Layout, count: stats.slides, path: '/admin/slides', color: 'bg-amber-50 text-amber-700' },
    { label: 'Penghargaan', icon: Trophy, count: stats.achievements, path: '/admin/achievements', color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Profil Sekolah', icon: FileText, count: null, path: '/admin/profile', color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Profil Guru', icon: Users, count: stats.teachers, path: '/admin/teachers', color: 'bg-slate-50 text-slate-700' },
    { label: 'Sarpras', icon: Package, count: stats.sarpras, path: '/admin/sarpras', color: 'bg-cyan-50 text-cyan-700' },
    { label: 'Pesan Masuk', icon: Mail, count: stats.messages, path: '/admin/messages', color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Pengaturan', icon: Settings, count: null, path: '/admin/settings', color: 'bg-rose-50 text-rose-700' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-slate-950 text-slate-400 flex flex-col p-8 space-y-12">
        <div className="flex items-center gap-4">
           <div className="flex gap-2">
              <img 
                src="https://drive.google.com/thumbnail?id=1KN1QnEPAmFVlxzDGvFO9Y1BsNx4TLGVJ&sz=w500" 
                alt="Logo NU" 
                className="h-12 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
           </div>
           <div>
             <h2 className="font-black text-white uppercase text-sm tracking-widest leading-none">Admin Hub</h2>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">v1.2.4</p>
           </div>
        </div>

        <nav className="flex-grow space-y-1">
           <Link to="/admin" className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-900/50">
              <BarChart3 size={18} /> Dashboard
           </Link>
           {menuItems.map(item => (
              <Link key={item.path} to={item.path} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-900 hover:text-white transition-all text-xs font-black uppercase tracking-widest group">
                 <div className="flex items-center gap-3">
                    <item.icon size={18} /> {item.label}
                 </div>
                 <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
           ))}
        </nav>

        <div className="pt-10 border-t border-slate-900 space-y-4">
           <Link to="/" className="flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-colors">
              <ExternalLink size={18} /> Kunjungi Main Site
           </Link>
           <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 rounded-2xl border border-rose-900/20 text-rose-500 hover:bg-rose-950 font-black text-xs uppercase tracking-widest transition-all"
           >
              <LogOut size={18} /> Keluar Sistem
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-14 space-y-14 overflow-y-auto">
        <header className="flex flex-col gap-2">
           <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded tracking-widest w-fit">Administrator</span>
           <h1 className="text-4xl font-black text-slate-800 tracking-tight">Selamat Datang Panel Kendali</h1>
           <p className="text-slate-500 font-medium">Monitoring performa platform digital SMP Maarif NU Pandaan.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {menuItems.map(item => (
              <div key={item.label} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200/60 relative overflow-hidden group hover:border-emerald-200 transition-all">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-12 -translate-y-12 transition-transform group-hover:scale-110" />
                 <div className="relative z-10 space-y-6">
                    <div className={`${item.color} w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner`}>
                       <item.icon size={22} />
                    </div>
                    <div>
                       <p className="text-5xl font-black text-slate-800 tracking-tighter mb-1">{item.count}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</p>
                    </div>
                 </div>
              </div>
           ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
           {/* Recent Messages */}
           <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200/60 p-10 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xl font-black text-slate-800 tracking-tight">Inbox Terbaru</h3>
                 <Link to="/admin/messages" className="text-emerald-700 text-[10px] font-black uppercase tracking-widest hover:underline">Semua Pesan</Link>
              </div>
              <div className="flex-grow space-y-4">
                 {recentMessages.length > 0 ? (
                    recentMessages.map(msg => (
                      <div key={msg.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center hover:border-emerald-200 transition-colors group cursor-default">
                         <div className="space-y-1">
                            <p className="font-black text-slate-800 text-sm">{msg.name}</p>
                            <p className="text-xs text-slate-500 font-medium line-clamp-1">{msg.subject || "Tanpa Subjek"}</p>
                         </div>
                         <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200 group-hover:bg-emerald-700 group-hover:text-white transition-all shadow-sm">
                            <ChevronRight size={14} />
                         </div>
                      </div>
                    ))
                 ) : (
                    <div className="text-center py-16 text-slate-300 font-black text-xs uppercase tracking-widest italic border-2 border-dashed border-slate-100 rounded-3xl">Inbox Kosong</div>
                 )}
              </div>
           </div>

           {/* Quick Actions */}
           <div className="bg-slate-900 rounded-[3rem] shadow-2xl p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
              <div className="relative z-10 space-y-10">
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight">Aksi Cepat</h3>
                    <p className="text-slate-400 text-sm font-medium">Bantu kelola informasi secara efisien.</p>
                 </div>
                 <div className="grid grid-cols-1 gap-6">
                    <Link to="/admin/articles" className="flex items-center gap-6 bg-slate-800/50 hover:bg-slate-800 p-6 rounded-2xl border border-white/5 transition-all group">
                       <div className="bg-emerald-600 p-4 rounded-xl shadow-lg shadow-emerald-900/50">
                          <PlusCircle size={22} />
                       </div>
                       <div className="flex-grow">
                          <p className="font-black text-sm uppercase tracking-widest">Buat Berita</p>
                          <p className="text-xs text-slate-400 font-medium mt-1">Publikasikan artikel, kabar, atau pengumuman baru.</p>
                       </div>
                       <ChevronRight className="group-hover:translate-x-2 transition-transform text-slate-600" />
                    </Link>
                    <Link to="/admin/gallery" className="flex items-center gap-6 bg-slate-800/50 hover:bg-slate-800 p-6 rounded-2xl border border-white/5 transition-all group">
                       <div className="bg-blue-600 p-4 rounded-xl shadow-lg shadow-blue-900/50">
                          <ImageIcon size={22} />
                       </div>
                       <div className="flex-grow">
                          <p className="font-black text-sm uppercase tracking-widest">Update Galeri</p>
                          <p className="text-xs text-slate-400 font-medium mt-1">Tambahkan koleksi foto dokumentasi kegiatan sekolah.</p>
                       </div>
                       <ChevronRight className="group-hover:translate-x-2 transition-transform text-slate-600" />
                    </Link>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
