import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Newspaper, Users, Award, BookOpen, ArrowRight, Send, CheckCircle2, AlertCircle, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '../lib/utils';

interface SliderItem {
  id: string | number;
  title: string;
  subtitle: string;
  imageUrl?: string;
  image?: string;
}

interface SchoolConfig {
  ppdbTitle?: string;
  ppdbContent?: string;
  ppdbImageUrl?: string;
  ppdbLink?: string;
  ppdbActive?: boolean;
  principalName?: string;
  principalNip?: string;
  principalTitle?: string;
  principalMessage?: string;
  principalImageUrl?: string;
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeSlides, setActiveSlides] = useState<SliderItem[]>(defaultSlides);
  const [news, setNews] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [config, setConfig] = useState<SchoolConfig | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const qSlides = query(collection(db, 'slides'), orderBy('order', 'asc'));
    const unsubSlides = onSnapshot(qSlides, (snapshot) => {
      const slidesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (slidesData.length > 0) {
        setActiveSlides(slidesData as SliderItem[]);
      } else {
        setActiveSlides(defaultSlides);
      }
    });

    const qNews = query(collection(db, 'articles'), orderBy('createdAt', 'desc'), limit(3));
    const unsubNews = onSnapshot(qNews, (snapshot) => {
      setNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qTeachers = query(collection(db, 'teachers'), orderBy('order', 'asc'), limit(2));
    const unsubTeachers = onSnapshot(qTeachers, (snapshot) => {
      setTeachers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qGallery = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'), limit(3));
    const unsubGallery = onSnapshot(qGallery, (snapshot) => {
      setGallery(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch config for PPDB
    const fetchConfig = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'config', 'school_profile'));
        if (docSnap.exists()) {
          setConfig(docSnap.data() as SchoolConfig);
        }
      } catch (err) {
        console.error("Error fetching config:", err);
      }
    };
    fetchConfig();

    return () => {
      unsubSlides();
      unsubNews();
      unsubTeachers();
      unsubGallery();
    };
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await addDoc(collection(db, 'messages'), {
        ...formData,
        subject: 'Pesan Kilat dari Beranda',
        createdAt: serverTimestamp()
      });
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      setSubmitStatus('error');
      handleFirestoreError(error, OperationType.WRITE, 'messages');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);

  useEffect(() => {
    if (activeSlides.length === 0) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen pb-20">
      {/* Hero Area */}
      <section className="relative h-[400px] bg-slate-900 shrink-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-transparent z-10" />
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${activeSlides[currentSlide]?.imageUrl || activeSlides[currentSlide]?.image})` }}
            />
            
            <div className="relative z-20 h-full flex flex-col justify-center px-6 md:px-12 text-white">
              <span className="bg-emerald-600 w-fit px-3 py-1 rounded text-[10px] font-bold uppercase mb-4 tracking-wider">
                SMP Maarif NU Pandaan
              </span>
              <h2 className="text-3xl md:text-5xl font-black mb-6 max-w-2xl leading-tight">
                {activeSlides[currentSlide]?.title}
              </h2>
              <p className="text-emerald-50/80 mb-8 max-w-xl text-lg hidden md:block">
                {activeSlides[currentSlide]?.subtitle}
              </p>
              <div className="flex gap-4">
                <Link to="/kontak" className="bg-emerald-600 px-8 py-3 rounded-lg font-bold text-sm hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20 text-center">
                  Daftar Sekarang
                </Link>
                <Link to="/profil" className="bg-white/20 backdrop-blur-sm px-8 py-3 rounded-lg font-bold text-sm border border-white/30 hover:bg-white/30 transition-colors text-center">
                  Tentang Kami
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slider Indicators */}
        <div className="absolute bottom-10 left-12 flex gap-3 z-30">
          {activeSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                currentSlide === i ? "w-10 bg-emerald-500" : "w-6 bg-white/30 hover:bg-white/50"
              )}
            />
          ))}
        </div>
      </section>

      {/* Sambutan Kepala Sekolah Section */}
      {config && (config.principalName || config.principalMessage) && (
        <section className="bg-white border-b border-slate-100 py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/20 rounded-[2.5rem] p-8 md:p-12 border border-emerald-100/40 shadow-xl shadow-slate-200/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="grid md:grid-cols-12 gap-10 items-center relative z-10">
                {/* Image panel */}
                <div className="md:col-span-4 flex justify-center">
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-emerald-600/10 rounded-[2rem] blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative w-56 h-72 md:w-64 md:h-80 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-slate-50 shrink-0">
                      <img 
                        src={config.principalImageUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop"} 
                        alt={config.principalName || "Kepala Sekolah"} 
                        className="w-full h-full object-cover rounded-[1.8rem] hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>

                {/* Narrative content panel */}
                <div className="md:col-span-8 flex flex-col justify-center text-left">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full w-fit mb-4">
                    {config.principalTitle || "Sambutan Kepala Sekolah"}
                  </span>
                  
                  <blockquote className="text-slate-700 text-sm md:text-base font-medium leading-relaxed italic mb-6 relative">
                    <span className="text-6xl text-emerald-500/30 font-serif absolute -top-8 -left-5">“</span>
                    <span className="whitespace-pre-line relative z-10">
                      {config.principalMessage || "Selamat datang di website resmi SMP Maarif NU Pandaan. Kami berdedikasi untuk mencetak generasi cerdas, berprestasi, dan berakhlak mulia berlandaskan nilai-nilai Ahlussunnah Wal Jama'ah."}
                    </span>
                  </blockquote>

                  <div>
                    <h4 className="text-lg md:text-xl font-extrabold text-slate-800">
                      {config.principalName || "H. Sholikhuddin, S.Ag., M.Pd."}
                    </h4>
                    {config.principalNip && (
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1 font-mono">
                        NIP. {config.principalNip}
                      </p>
                    )}
                    <p className="text-xs text-emerald-700 font-black uppercase tracking-widest mt-0.5">
                      Kepala Sekolah SMP Maarif NU Pandaan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Grid Content */}
      <main className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-12">
        
        {/* News & Events (col-span-5) */}
        <div className="md:col-span-5 flex flex-col gap-8">
          <div className="section-header">
            <h3 className="section-title">Berita & Pengumuman</h3>
            <Link to="/berita" className="text-xs text-emerald-700 font-bold hover:underline">Lihat Semua</Link>
          </div>
          <div className="space-y-4">
            {news.length > 0 ? (
              news.map((item) => (
                <Link key={item.id} to={`/berita/${item.id}`} className="flex gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                  <div className="w-24 h-24 bg-slate-200 rounded-xl shrink-0 overflow-hidden">
                    <img 
                      src={item.imageUrl || "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=2072&auto=format&fit=crop"} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex flex-col justify-center gap-1">
                    <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest">{item.category}</p>
                    <h4 className="text-base font-bold text-slate-800 leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">
                      {item.createdAt ? format(item.createdAt.toDate(), 'dd MMMM yyyy', { locale: id }) : 'Baru saja'}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              [1, 2, 3].map(i => <div key={i} className="animate-pulse bg-white rounded-2xl h-28 border border-slate-100 shadow-sm"></div>)
            )}
          </div>
        </div>

        {/* Middle Section (PPDB Promo or Features) (col-span-4) */}
        <div className="md:col-span-4 flex flex-col gap-10">
          
          {/* PPDB Promo Section */}
          {config?.ppdbActive && (
            <motion.div 
              initial={{ opacity: 0.5, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-rose-600 to-rose-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-rose-900/20"
            >
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Megaphone size={20} className="text-white/80 animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-100">Info Penerimaan</span>
                </div>
                <h3 className="text-2xl font-black mb-4 leading-tight">{config.ppdbTitle}</h3>
                
                {config.ppdbImageUrl && (
                  <div className="mb-6 rounded-2xl overflow-hidden shadow-lg border border-white/20">
                    <img src={config.ppdbImageUrl} alt="PPDB Brochure" className="w-full object-contain" />
                  </div>
                )}

                <p className="text-sm font-medium text-rose-50/90 mb-8 leading-relaxed">
                  {config.ppdbContent}
                </p>

                <div className="space-y-3">
                  {config.ppdbLink && (
                    <a 
                      href={config.ppdbLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full bg-white text-rose-700 py-4 rounded-2xl text-center font-black text-xs uppercase tracking-widest hover:bg-rose-50 transition-colors shadow-lg"
                    >
                      Daftar Via Online
                    </a>
                  )}
                  <Link 
                    to="/kontak"
                    className="block w-full bg-rose-500/30 text-white py-4 rounded-2xl text-center font-black text-xs uppercase tracking-widest hover:bg-rose-500/50 transition-colors border border-white/20"
                  >
                    Tanya Admin
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Teachers Mini Section (if PPDB is inactive or just as a small list) */}
          <div className="space-y-6">
            <div className="section-header">
              <h3 className="section-title">Tenaga Pendidik</h3>
              <Link to="/profil" className="text-xs text-emerald-700 font-bold hover:underline">Semua Guru</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm hover:border-emerald-200 transition-colors">
                  <div className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-emerald-500 p-0.5 overflow-hidden">
                    <img src={teacher.photoUrl} alt={teacher.name} className="w-full h-full object-cover rounded-full" />
                  </div>
                  <p className="text-xs font-black text-slate-800 truncate tracking-tight">{teacher.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{teacher.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Quick Form & Gallery (col-span-3) */}
        <div className="md:col-span-3 flex flex-col gap-10">
          
          {/* Quick Form */}
          <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100 shadow-inner">
            <div className="space-y-1 mb-8">
              <h3 className="font-black text-emerald-900 text-xl uppercase tracking-tight">Hubungi Kami</h3>
              <p className="text-[11px] text-emerald-700/80 font-medium">Ada pertanyaan? Kirim pesan cepat kepada kami.</p>
            </div>
            
            {submitStatus === 'success' ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-600 text-white p-6 rounded-3xl text-center">
                <CheckCircle2 className="mx-auto mb-4" size={32} />
                <p className="text-sm font-bold">Pesan Terkirim!</p>
                <p className="text-[10px] mt-1 opacity-80 font-medium">Terima kasih, tim kami akan segera membalas.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <input 
                  required
                  type="text" 
                  placeholder="Nama Lengkap" 
                  className="w-full bg-white border border-emerald-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <input 
                  required
                  type="text" 
                  placeholder="Email / WhatsApp" 
                  className="w-full bg-white border border-emerald-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <textarea 
                  required
                  placeholder="Pesan Anda..." 
                  rows={4} 
                  className="w-full bg-white border border-emerald-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 resize-none font-medium"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
                
                {submitStatus === 'error' && (
                  <div className="flex items-center gap-2 text-rose-600 text-[10px] font-bold">
                    <AlertCircle size={14} />
                    <span>Gagal kirim. Coba lagi.</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-emerald-700 text-white py-5 rounded-2xl text-xs font-black shadow-lg shadow-emerald-900/10 active:scale-95 transition-all uppercase tracking-[0.2em] hover:bg-emerald-800 disabled:bg-emerald-300 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Mengirim..." : (
                    <>
                      Kirim Pesan
                      <Send size={14} />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-emerald-200/60">
              <p className="text-[10px] text-emerald-800 leading-relaxed font-medium">
                <span className="font-extrabold text-emerald-900 uppercase tracking-widest mr-1 opacity-60">Alamat:</span> 
                Jl. Raya Pandaan No. 123, Pandaan, Pasuruan.
              </p>
            </div>
          </div>

          {/* Mini Gallery Section */}
          <div className="space-y-6">
             <div className="section-header">
                <h3 className="section-title font-bold text-slate-800">Momen Sekolah</h3>
             </div>
             <div className="grid grid-cols-2 gap-4">
               {gallery.slice(0, 2).map((item) => (
                 <Link key={item.id} to="/galeri" className="aspect-square bg-slate-200 rounded-2xl overflow-hidden group shadow-sm border border-slate-100">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" 
                    />
                 </Link>
               ))}
             </div>
          </div>
        </div>

      </main>

    </div>
  );
}

const defaultSlides: SliderItem[] = [
  {
    id: 1,
    title: "Selamat Datang di SMP Maarif NU Pandaan",
    subtitle: "Mewujudkan Generasi Unggul dengan Landasan Nilai Ahlussunnah Wal Jama'ah",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Kurikulum Modern & Karakter Islami",
    subtitle: "Pendidikan yang Menggabungkan Kecerdasan Intelektual, Emosional, dan Spiritual",
    image: "https://images.unsplash.com/photo-1577891729319-f69ea24d3cb8?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Fasilitas Belajar Lengkap & Nyaman",
    subtitle: "Lingkungan Pendidikan yang Mendukung Potensi Setiap Siswa",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070&auto=format&fit=crop"
  }
];

