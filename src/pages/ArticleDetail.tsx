import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import { Calendar, Tag, ChevronLeft, Share2 } from 'lucide-react';

export default function ArticleDetail() {
  const { id: articleId } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!articleId) return;
    const unsubscribe = onSnapshot(doc(db, 'articles', articleId), (docSnap) => {
      if (docSnap.exists()) {
        setArticle({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [articleId]);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20 animate-pulse space-y-12">
        <div className="h-[400px] bg-slate-200 rounded-[3rem] w-full border border-slate-100"></div>
        <div className="max-w-3xl mx-auto space-y-4">
           <div className="h-10 bg-slate-200 w-3/4 rounded-lg"></div>
           <div className="h-4 bg-slate-200 w-1/4 rounded"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-6 py-40 text-center space-y-6">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Artikel tidak ditemukan</h1>
        <p className="text-slate-500 font-medium">Link mungkin sudah kedaluwarsa atau artikel telah dihapus.</p>
        <Link to="/berita" className="inline-block bg-emerald-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/10 transition-all hover:bg-emerald-800">
          Kembali ke Berita
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Featured Header */}
      <div className="bg-white border-b border-slate-200 py-12">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex flex-col gap-6">
            <Link to="/berita" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-emerald-700 transition-all group">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Berita
            </Link>
            
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
                <span className="bg-emerald-50 px-3 py-1 rounded border border-emerald-100">{article.category}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400">{article.createdAt ? format(article.createdAt.toDate(), 'dd MMMM yyyy', { locale: id }) : 'Baru saja'}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-800 leading-[1.1] tracking-tight">
                {article.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <article className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-12">
          
          {/* Main Content (8 columns) */}
          <div className="lg:col-span-8 space-y-12">
            <div className="aspect-video rounded-[3rem] overflow-hidden shadow-2xl border border-white relative group">
              <img 
                src={article.imageUrl || "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=2072&auto=format&fit=crop"} 
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>

            <div className="prose prose-emerald prose-lg max-w-none text-slate-700 leading-relaxed bg-white p-10 md:p-16 rounded-[3rem] border border-slate-100 shadow-sm markdown-body">
              <ReactMarkdown>
                {article.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Sidebar / Info (4 columns) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6 sticky top-24">
               <div>
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Bagikan</h3>
                 <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: article.title, url: window.location.href });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 py-3 rounded-xl font-bold text-xs uppercase tracking-tight hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all flex items-center justify-center gap-3"
                    >
                      <Share2 size={16} /> Salin Tautan
                    </button>
                 </div>
               </div>

               <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Penulis</h3>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-emerald-700 flex items-center justify-center text-white font-black text-xs shadow-lg">
                        AD
                     </div>
                     <div>
                        <p className="font-black text-slate-800 text-sm">Humas Sekolah</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">SMP Maarif NU Pandaan</p>
                     </div>
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-100 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Informasi Terkait</h3>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[11px] text-slate-500 italic font-medium leading-relaxed">
                      Artikel ini diterbitkan sebagai bagian dari dokumentasi resmi kegiatan sekolah. Segala kutipan data harus mencantumkan sumber resmi.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
