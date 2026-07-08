import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Search, ChevronRight, FileText } from 'lucide-react';

export default function News() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header Section */}
      <section className="bg-white border-b border-slate-200 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div>
              <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded tracking-widest mb-4 inline-block shadow-sm">Kabar Pandaan</span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
                Informasi & Berita Terbaru
              </h1>
            </div>
            
            <div className="relative max-w-2xl mx-auto group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Cari berita, pengumuman, atau artikel..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-16 py-4 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="container mx-auto px-6 py-16">
        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-[2rem] h-[400px] border border-slate-100 shadow-sm"></div>
            ))}
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <Link 
                key={article.id}
                to={`/berita/${article.id}`}
                className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col h-full"
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img 
                    src={article.imageUrl || "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=2072&auto=format&fit=crop"} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded shadow-lg">
                      {article.category}
                    </span>
                  </div>
                  {article.pdfUrl && (
                    <div className="absolute top-4 right-4" title="Memiliki Lampiran PDF">
                      <span className="bg-white/95 backdrop-blur text-slate-800 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded shadow-lg flex items-center gap-1.5 border border-slate-100">
                        <FileText size={12} className="text-emerald-700" /> PDF
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-8 flex flex-col flex-grow gap-4">
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    {article.createdAt ? format(article.createdAt.toDate(), 'dd MMMM yyyy', { locale: id }) : 'Baru saja'}
                  </p>
                  <h2 className="text-xl font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors">
                    {article.title}
                  </h2>
                  <div className="mt-auto pt-6 flex items-center text-xs font-black uppercase tracking-widest text-emerald-700 gap-2 opacity-50 group-hover:opacity-100 transition-all">
                    Detail <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="text-slate-200 flex justify-center mb-6">
              <Search size={80} strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-black text-slate-800">Tidak ada berita</h3>
            <p className="text-slate-500 font-medium">Coba gunakan kata kunci pencarian yang lebih umum.</p>
          </div>
        )}
      </section>
    </div>
  );
}
