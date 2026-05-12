import { useState, useEffect } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { useAuth } from '../../App';
import { 
  Newspaper, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  X, 
  Image as ImageIcon,
  ChevronLeft,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { orderBy, query } from 'firebase/firestore';

interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  category: string;
  createdAt: any;
}

export default function AdminArticles() {
  const { user } = useAuth();
  const { data: articles, fetchData, add, update, remove, loading } = useFirestore<Article>('articles');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    category: 'berita',
  });

  useEffect(() => {
    fetchData(orderBy('createdAt', 'desc'));
  }, []);

  const resetForm = () => {
    setFormData({ title: '', content: '', imageUrl: '', category: 'berita' });
    setEditingArticle(null);
  };

  const handleOpenModal = (article?: Article) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        content: article.content,
        imageUrl: article.imageUrl,
        category: article.category,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingArticle) {
      await update(editingArticle.id, { ...formData });
    } else {
      await add({ ...formData, authorId: user?.uid });
    }
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-neutral-200 px-8 py-6">
         <div className="container mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <Link to="/admin" className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                  <ChevronLeft size={24} className="text-neutral-500" />
               </Link>
               <div>
                  <h1 className="text-2xl font-bold text-neutral-900">Kelola Berita</h1>
                  <p className="text-neutral-500 text-sm">Update informasi dan pengumuman sekolah.</p>
               </div>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
            >
              <Plus size={20} /> Posting Berita
            </button>
         </div>
      </div>

      <div className="container mx-auto px-8 py-10">
         {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1,2,3].map(i => <div key={i} className="animate-pulse bg-white rounded-3xl h-64 border border-neutral-200"></div>)}
            </div>
         ) : articles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {articles.map((article) => (
                  <div key={article.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-neutral-200 group flex flex-col">
                     <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={article.imageUrl || "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=2072&auto=format&fit=crop"} 
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                        />
                        <div className="absolute top-4 left-4">
                           <span className="bg-white/90 backdrop-blur-md text-emerald-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                              {article.category}
                           </span>
                        </div>
                     </div>
                     <div className="p-6 flex-grow space-y-4">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                           {article.createdAt ? format(article.createdAt.toDate(), 'dd MMM yyyy', { locale: id }) : 'Loading...'}
                        </p>
                        <h3 className="font-bold text-lg text-neutral-800 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors">
                           {article.title}
                        </h3>
                     </div>
                     <div className="p-4 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                        <div className="flex gap-2">
                           <button onClick={() => handleOpenModal(article)} className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit">
                              <Edit size={18} />
                           </button>
                           <button onClick={() => { if(confirm('Hapus berita ini?')) remove(article.id) }} className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Hapus">
                              <Trash2 size={18} />
                           </button>
                        </div>
                        <Link to={`/berita/${article.id}`} target="_blank" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                          Pratinjau <Plus size={12} className="rotate-45" />
                        </Link>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="text-center py-40 space-y-4">
               <div className="text-neutral-200 flex justify-center mb-6">
                  <Newspaper size={80} strokeWidth={1} />
               </div>
               <h3 className="text-2xl font-bold text-neutral-800">Belum ada berita</h3>
               <p className="text-neutral-500">Mulai posting berita pertama sekolah Anda sekarang.</p>
            </div>
         )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-8 md:p-12 relative my-8">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 hover:bg-neutral-100 rounded-full text-neutral-500">
                <X size={24} />
             </button>
             
             <h2 className="text-3xl font-black text-neutral-900 uppercase tracking-tighter mb-8">
                {editingArticle ? 'Edit Posting' : 'Buat Posting Baru'}
             </h2>

             <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Judul Berita</label>
                         <input 
                           required
                           type="text"
                           placeholder="Judul Berita"
                           className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-neutral-800"
                           value={formData.title}
                           onChange={(e) => setFormData({...formData, title: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Kategori</label>
                         <select 
                           className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500 transition-all appearance-none font-bold"
                           value={formData.category}
                           onChange={(e) => setFormData({...formData, category: e.target.value})}
                         >
                            <option value="berita">Berita</option>
                            <option value="pengumuman">Pengumuman</option>
                            <option value="informasi">Informasi</option>
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">URL Gambar (Opsional)</label>
                         <input 
                           type="text"
                           placeholder="https://images.unsplash.com/..."
                           className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500 transition-all"
                           value={formData.imageUrl}
                           onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="flex flex-col gap-2">
                      <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Konten Berita (Markdown)</label>
                      <textarea 
                        required
                        className="flex-grow bg-neutral-100 border-none rounded-3xl px-6 py-6 focus:ring-2 focus:ring-emerald-500 transition-all resize-none min-h-[200px]"
                        placeholder="Gunakan Markdown untuk format text..."
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                      ></textarea>
                   </div>
                </div>

                <div className="pt-4 flex justify-end gap-4">
                   <button 
                     type="button"
                     onClick={() => setIsModalOpen(false)}
                     className="px-8 py-3 rounded-full font-bold text-neutral-500 hover:bg-neutral-100 transition-all"
                   >
                     Batal
                   </button>
                   <button 
                     type="submit"
                     className="bg-emerald-600 text-white px-10 py-3 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
                   >
                     {editingArticle ? 'Update Berita' : 'Publikasikan'}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
