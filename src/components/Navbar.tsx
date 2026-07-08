import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, Settings } from 'lucide-react';
import { useAuth } from '../App';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState({
    schoolName: 'SMP Maarif NU Pandaan',
    tagline: 'Unggul, Berakhlak, dan Berprestasi',
    logo1Url: 'https://drive.google.com/thumbnail?id=1KN1QnEPAmFVlxzDGvFO9Y1BsNx4TLGVJ&sz=w500',
    logo2Url: 'https://drive.google.com/thumbnail?id=1TapOEksA-W--GGSmN_e18hFTYE4YYTPU&sz=w500'
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
      if (doc.exists()) {
        setSettings(prev => ({ ...prev, ...doc.data() }));
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { 
      name: 'Profil', 
      path: '/profil',
      children: [
        { name: 'Visi & Misi', path: '/profil' },
        { name: 'Prestasi', path: '/profil/prestasi' },
        { name: 'Sarpras', path: '/profil/sarpras' },
      ]
    },
    { name: 'Berita', path: '/berita' },
    { 
      name: 'Galeri', 
      path: '/galeri',
      children: [
        { name: 'Galeri Foto', path: '/galeri' },
        { name: 'Galeri Video', path: '/galeri/video' },
      ]
    },
    { name: 'Kontak', path: '/kontak' },
  ];

  return (
    <nav 
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200 py-2" : "bg-white border-b border-slate-200 py-3"
      )}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-4">
            <div className="flex gap-3 md:gap-4 items-center">
              <img 
                src={settings.logo1Url || 'https://drive.google.com/thumbnail?id=1KN1QnEPAmFVlxzDGvFO9Y1BsNx4TLGVJ&sz=w500'} 
                alt="Logo NU" 
                className="h-10 md:h-14 w-auto object-contain transition-all hover:scale-105 duration-500"
                referrerPolicy="no-referrer"
              />
              <img 
                src={settings.logo2Url || 'https://drive.google.com/thumbnail?id=1TapOEksA-W--GGSmN_e18hFTYE4YYTPU&sz=w500'} 
                alt="Logo Sekolah" 
                className="h-10 md:h-14 w-auto object-contain transition-all hover:scale-105 duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-800 leading-tight uppercase tracking-tight">{settings.schoolName}</h1>
              <p className="text-[10px] text-slate-500 tracking-widest uppercase font-semibold">{settings.tagline}</p>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <div key={link.path} className="relative group">
                <Link
                  to={link.path}
                  className={cn(
                    "text-sm transition-all duration-200 pb-1 flex items-center gap-1",
                    location.pathname === link.path || (link.children && link.children.some(c => location.pathname === c.path))
                      ? "font-semibold text-emerald-700 border-b-2 border-emerald-700" 
                      : "font-medium text-slate-600 hover:text-emerald-700"
                  )}
                >
                  {link.name}
                  {link.children && (
                    <svg className="w-3 h-3 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>

                {/* Sub-menu Dropdown */}
                {link.children && (
                  <div className="absolute top-full left-0 mt-0 pt-3 hidden group-hover:block w-48">
                    <div className="bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                      {link.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={cn(
                            "block px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors",
                            location.pathname === child.path 
                              ? "bg-emerald-50 text-emerald-700" 
                              : "text-slate-600 hover:bg-slate-50 hover:text-emerald-700"
                          )}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-sm font-bold text-blue-700 hover:text-blue-800 px-3 py-1 rounded-md bg-blue-50 transition-colors"
                title="Admin Dashboard"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-slate-600 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-1 border-t border-slate-100 pt-4">
            {navLinks.map((link) => (
              <div key={link.path}>
                <Link
                  to={link.path}
                  className={cn(
                    "block py-2 text-base font-bold",
                    location.pathname === link.path ? "text-emerald-700" : "text-slate-600"
                  )}
                  onClick={() => !link.children && setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
                {link.children && (
                  <div className="pl-4 space-y-1 mt-1 border-l-2 border-slate-100 ml-1">
                    {link.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={cn(
                          "block py-2 text-sm font-semibold",
                          location.pathname === child.path ? "text-emerald-600" : "text-slate-500"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="block py-2 text-blue-700 font-bold border-t border-slate-100 mt-4 pt-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
