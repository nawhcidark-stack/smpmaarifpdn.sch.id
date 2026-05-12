import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Maximize2 } from 'lucide-react';

export default function Gallery() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const selectedItem = items.find(item => item.id === selectedId);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-slate-200 py-16">
        <div className="container mx-auto px-6 text-center">
          <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded tracking-widest mb-4 inline-block shadow-sm">Koleksi Visual</span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 leading-tight">Galeri Aktivitas</h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-2xl mx-auto italic">
            "Mengabadikan setiap momen berharga dari perjalanan pendidikan dan pengembangan diri siswa."
          </p>
        </div>
      </section>

      <section className="container mx-auto px-6 py-12">
        {loading ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-3xl h-64 shadow-sm border border-slate-100"></div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {items.map((item) => (
              <motion.div 
                layoutId={item.id}
                key={item.id}
                className="relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all cursor-pointer group break-inside-avoid border border-slate-100"
                onClick={() => setSelectedId(item.id)}
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                   <div className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30 scale-75 group-hover:scale-100 transition-transform">
                      <Maximize2 size={24} />
                   </div>
                </div>
                <div className="p-4 bg-white">
                  <p className="text-[10px] text-emerald-700 font-black uppercase tracking-widest mb-1">{item.category || 'Aktivitas'}</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{item.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 space-y-4 bg-white rounded-[3rem] shadow-sm border border-slate-100">
            <div className="text-slate-200 flex justify-center mb-6">
              <Search size={80} strokeWidth={1} />
            </div>
             <h3 className="text-2xl font-black text-slate-800">Galeri belum tersedia</h3>
             <p className="text-slate-500 font-medium max-w-sm mx-auto">Kami sedang mempersiapkan dokumentasi kegiatan terbaru untuk Anda.</p>
          </div>
        )}
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedId && selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm"
            onClick={() => setSelectedId(null)}
          >
            <button 
              className="absolute top-8 right-8 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-[110]"
              onClick={() => setSelectedId(null)}
            >
              <X size={32} />
            </button>
            <motion.div 
              layoutId={selectedId}
              className="max-w-6xl w-full max-h-[90vh] relative p-1 bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="overflow-auto flex-grow flex items-center justify-center bg-slate-100/50 rounded-t-[1.8rem]">
                <img 
                  src={selectedItem.imageUrl} 
                  alt={selectedItem.title} 
                  className="max-w-full max-h-[70vh] object-contain shadow-sm"
                />
              </div>
              <div className="p-8 text-center bg-white">
                <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded tracking-widest mb-2 inline-block">Detail Foto</span>
                <h3 className="text-2xl font-black text-slate-800">{selectedItem.title}</h3>
                {selectedItem.description && (
                   <p className="text-slate-500 mt-4 leading-relaxed font-medium max-w-2xl mx-auto">{selectedItem.description}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
