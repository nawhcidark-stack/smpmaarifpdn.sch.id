import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Layout, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface SarprasItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
}

export default function Sarpras() {
  const [items, setItems] = useState<SarprasItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'sarpras'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SarprasItem[];
      setItems(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 pt-32 pb-16 px-6">
        <div className="container mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-6"
          >
            <Layout size={14} />
            School Infrastructure
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-slate-900 mb-6"
          >
            Sarana & <span className="text-emerald-600 underline decoration-8 decoration-emerald-100 underline-offset-8">Prasarana</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 max-w-2xl mx-auto font-medium"
          >
            Fasilitas pendukung kegiatan belajar mengajar yang modern dan lengkap untuk menunjang prestasi siswa.
          </motion.p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16">
        {loading ? (
          <div className="space-y-12">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="bg-white rounded-[3rem] h-[30rem] animate-pulse"></div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-24 max-w-6xl mx-auto">
            {items.map((item, idx) => (
              <motion.section
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-center`}
              >
                <div className="flex-1 w-full">
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-emerald-100/50 rounded-[4rem] -z-10 group-hover:scale-105 transition-transform duration-700"></div>
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full aspect-[4/3] object-cover rounded-[3.5rem] shadow-2xl relative z-10"
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-8">
                  <div className="inline-flex items-center gap-3 px-5 py-2 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                    <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Fasilitas Sekolah</span>
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 leading-tight">
                    {item.title}
                  </h2>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed">
                    {item.description}
                  </p>
                  <div className="pt-4 flex flex-wrap gap-4">
                     <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 text-sm">
                        Kondisi Baik
                     </div>
                     <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 text-sm">
                        Terawat
                     </div>
                     <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 text-sm">
                        Aman
                     </div>
                  </div>
                </div>
              </motion.section>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <Layout size={64} className="mx-auto text-slate-200 mb-6" />
            <h3 className="text-2xl font-bold text-slate-800">Belum ada data fasilitas</h3>
            <p className="text-slate-500 mt-2">Daftar sarana dan prasarana akan diperbarui segera.</p>
          </div>
        )}
      </main>
    </div>
  );
}
