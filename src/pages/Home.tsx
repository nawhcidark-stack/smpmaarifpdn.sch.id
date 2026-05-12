import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Newspaper, Users, Award, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
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

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeSlides, setActiveSlides] = useState<SliderItem[]>(defaultSlides);
  const [news, setNews] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);

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

    return () => {
      unsubSlides();
      unsubNews();
      unsubTeachers();
      unsubGallery();
    };
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);

  useEffect(() => {
    if (activeSlides.length === 0) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
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
                <Link to="/kontak" className="bg-emerald-600 px-8 py-3 rounded-lg font-bold text-sm hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20">
                  Daftar Sekarang
                </Link>
                <Link to="/profil" className="bg-white/20 backdrop-blur-sm px-8 py-3 rounded-lg font-bold text-sm border border-white/30 hover:bg-white/30 transition-colors">
                  Lihat Fasilitas
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

      {/* Main Grid Content */}
      <main className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* News & Events (col-span-5) */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="section-header">
            <h3 className="section-title">Berita Terbaru</h3>
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

        {/* Teachers & Gallery (col-span-4) */}
        <div className="md:col-span-4 flex flex-col gap-8">
          {/* Teachers Section */}
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

          {/* Gallery Section */}
          <div className="space-y-4">
             <div className="section-header">
                <h3 className="section-title font-bold text-slate-800">Galeri Sekolah</h3>
             </div>
             <div className="grid grid-cols-3 gap-3">
               {gallery.map((item) => (
                 <Link key={item.id} to="/galeri" className="aspect-square bg-slate-200 rounded-xl overflow-hidden group shadow-sm border border-slate-100">
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

        {/* Contact Quick Form (col-span-3) */}
        <div className="md:col-span-3 flex flex-col gap-6 bg-emerald-50 rounded-[2rem] p-6 border border-emerald-100 shadow-inner">
          <div className="space-y-1">
            <h3 className="font-bold text-emerald-900 text-lg">Hubungi Kami</h3>
            <p className="text-xs text-emerald-700/80 mb-2 font-medium">Ada pertanyaan? Kirim pesan cepat kepada kami.</p>
          </div>
          <form className="space-y-3">
            <input type="text" placeholder="Nama Lengkap" className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium" />
            <input type="email" placeholder="Email / WA" className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium" />
            <textarea placeholder="Pesan Anda..." rows={4} className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 resize-none font-medium"></textarea>
            <button type="button" className="w-full bg-emerald-700 text-white py-3.5 rounded-xl text-sm font-black shadow-lg shadow-emerald-900/10 active:scale-95 transition-all uppercase tracking-widest hover:bg-emerald-800">
              Kirim Pesan
            </button>
          </form>
          <div className="mt-2 pt-4 border-t border-emerald-200">
            <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
              <span className="font-bold text-emerald-900 uppercase tracking-tighter mr-1">Alamat:</span> Jl. Raya Pandaan No. 123, Pandaan, Pasuruan.
            </p>
          </div>
        </div>

      </main>

      {/* CTA / Quick Stats Overlay? I'll move stats to a secondary section if needed, but the design focuses on the grid above */}
    </div>
  );
}
