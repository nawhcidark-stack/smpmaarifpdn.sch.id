import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, MessageCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Footer() {
  const year = new Date().getFullYear();
  const [settings, setSettings] = useState({
    schoolName: 'SMP Maarif NU Pandaan',
    tagline: 'Unggul, Berakhlak, dan Berprestasi',
    address: 'Jl. Raya Pandaan No. 123, Pandaan, Pasuruan, Jawa Timur 67156',
    phone: '(0343) 123456',
    email: 'info@sparifda.sch.id',
    facebookUrl: '#',
    instagramUrl: '#',
    youtubeUrl: '#',
    whatsappNumber: '628123456789'
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
      if (doc.exists()) {
        setSettings(prev => ({ ...prev, ...doc.data() }));
      }
    });
    return () => unsub();
  }, []);

  return (
    <footer className="bg-slate-950 text-slate-400 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Section (col-5) */}
          <div className="md:col-span-5 space-y-8">
            <div className="flex items-center gap-6">
               <div className="flex gap-4 items-center">
                 <img 
                   src="https://drive.google.com/thumbnail?id=1KN1QnEPAmFVlxzDGvFO9Y1BsNx4TLGVJ&sz=w500" 
                   alt="Logo NU" 
                   className="h-12 w-auto object-contain brightness-0 invert opacity-70 hover:opacity-100 transition-all"
                   referrerPolicy="no-referrer"
                 />
                 <img 
                   src="https://drive.google.com/thumbnail?id=1TapOEksA-W--GGSmN_e18hFTYE4YYTPU&sz=w500" 
                   alt="Logo Sekolah" 
                   className="h-12 w-auto object-contain brightness-0 invert opacity-70 hover:opacity-100 transition-all"
                   referrerPolicy="no-referrer"
                 />
               </div>
               <div>
                 <h2 className="text-xl font-black text-white tracking-tight uppercase">{settings.schoolName}</h2>
                 <p className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase mt-0.5">{settings.tagline}</p>
               </div>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              Lembaga pendidikan menengah yang berdedikasi menciptakan lulusan cerdas, berkarakter, dan religius berlandaskan nilai-nilai Ahlussunnah wal Jama'ah An-Nahdliyah.
            </p>
            <div className="flex gap-4">
              <a href={settings.facebookUrl} className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center hover:bg-emerald-700 hover:text-white transition-all">
                <Facebook size={18} />
              </a>
              <a href={settings.instagramUrl} className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center hover:bg-emerald-700 hover:text-white transition-all">
                <Instagram size={18} />
              </a>
              <a href={settings.youtubeUrl} className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center hover:bg-emerald-700 hover:text-white transition-all">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Navigation (col-2) */}
          <div className="md:col-span-2 space-y-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Navigasi</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/" className="hover:text-emerald-500 transition-colors">Beranda</Link></li>
              <li><Link to="/profil" className="hover:text-emerald-500 transition-colors">Profil</Link></li>
              <li><Link to="/berita" className="hover:text-emerald-500 transition-colors">Berita</Link></li>
              <li><Link to="/galeri" className="hover:text-emerald-500 transition-colors">Galeri</Link></li>
              <li><Link to="/kontak" className="hover:text-emerald-500 transition-colors">Kontak</Link></li>
            </ul>
          </div>

          {/* Contact (col-5) */}
          <div className="md:col-span-5 space-y-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Hubungi Kami</h3>
            <div className="grid gap-6">
               <div className="flex gap-4 p-4 bg-slate-900/50 border border-slate-900 rounded-2xl">
                  <div className="w-10 h-10 bg-emerald-700/10 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <p className="text-sm leading-relaxed">
                    {settings.address}
                  </p>
               </div>
               <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px] flex gap-4 p-4 bg-slate-900/50 border border-slate-900 rounded-2xl">
                    <div className="w-10 h-10 bg-blue-700/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Telepon</p>
                      <p className="text-sm font-bold text-slate-200">{settings.phone}</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px] flex gap-4 p-4 bg-slate-900/50 border border-slate-900 rounded-2xl">
                    <div className="w-10 h-10 bg-emerald-700/10 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Email</p>
                      <p className="text-sm font-bold text-slate-200">{settings.email}</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
            &copy; {year} {settings.schoolName}. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
            <a href={`https://wa.me/${settings.whatsappNumber}`} className="flex items-center gap-2 text-emerald-500 hover:text-emerald-400">
               <MessageCircle size={14} />
               <span>WhatsApp Center</span>
            </a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
