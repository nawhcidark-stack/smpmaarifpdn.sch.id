import { useState, useEffect } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { 
  ChevronLeft,
  Plus,
  Trash2,
  X,
  Layout,
  ArrowUp,
  ArrowDown,
  Edit2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderBy, QueryConstraint } from 'firebase/firestore';

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  order: number;
}

export default function AdminSlides() {
  const { data: slides, fetchData, add, update, remove, loading } = useFirestore<Slide>('slides');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    order: 0
  });

  useEffect(() => {
    fetchData(orderBy('order', 'asc') as QueryConstraint);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await update(editingId, { ...formData });
    } else {
      await add({ ...formData, order: slides.length });
    }
    closeModal();
  };

  const openEdit = (slide: Slide) => {
    setEditingId(slide.id);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      imageUrl: slide.imageUrl,
      order: slide.order
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ title: '', subtitle: '', imageUrl: '', order: 0 });
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;

    const item1 = slides[index];
    const item2 = slides[newIndex];

    await update(item1.id, { order: item2.order });
    await update(item2.id, { order: item1.order });
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <div className="bg-white border-b border-neutral-200 px-8 py-6">
         <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
               <Link to="/admin" className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                  <ChevronLeft size={24} className="text-neutral-500" />
               </Link>
               <div>
                  <h1 className="text-2xl font-bold text-neutral-900">Slide Beranda</h1>
                  <p className="text-neutral-500 text-sm">Kelola gambar banner di halaman depan.</p>
               </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg"
            >
              <Plus size={20} /> Tambah Slide
            </button>
         </div>
      </div>

      <div className="container mx-auto px-8 py-10">
         {loading ? (
            <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="animate-pulse bg-white rounded-3xl h-40 border border-neutral-200"></div>)}
            </div>
         ) : slides.length > 0 ? (
            <div className="space-y-6 max-w-4xl mx-auto">
               {slides.map((slide, index) => (
                  <div key={slide.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-neutral-200 flex flex-col md:flex-row">
                     <div className="w-full md:w-60 h-40 shrink-0 relative group">
                        <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                           <button onClick={() => openEdit(slide)} className="p-2 bg-white rounded-full text-slate-800 hover:scale-110 transition-transform">
                              <Edit2 size={16} />
                           </button>
                           <button 
                             onClick={() => { if(confirm('Hapus slide ini?')) remove(slide.id) }}
                             className="p-2 bg-rose-500 rounded-full text-white hover:scale-110 transition-transform"
                           >
                              <Trash2 size={16} />
                           </button>
                        </div>
                     </div>
                     <div className="flex-grow p-6 flex flex-col justify-center">
                        <h3 className="text-lg font-black text-slate-800 leading-tight mb-2 tracking-tight">{slide.title}</h3>
                        <p className="text-slate-500 text-sm line-clamp-2">{slide.subtitle}</p>
                     </div>
                     <div className="px-6 py-4 md:py-0 border-t md:border-t-0 md:border-l border-slate-100 flex md:flex-col items-center justify-center gap-4">
                        <button 
                          disabled={index === 0}
                          onClick={() => moveOrder(index, 'up')}
                          className="p-2 hover:bg-slate-50 disabled:opacity-20 rounded-xl transition-colors"
                        >
                           <ArrowUp size={20} />
                        </button>
                        <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{slide.order + 1}</span>
                        <button 
                          disabled={index === slides.length - 1}
                          onClick={() => moveOrder(index, 'down')}
                          className="p-2 hover:bg-slate-50 disabled:opacity-20 rounded-xl transition-colors"
                        >
                           <ArrowDown size={20} />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="text-center py-40">
               <div className="text-neutral-200 flex justify-center mb-6">
                  <Layout size={80} strokeWidth={1} />
               </div>
               <h3 className="text-2xl font-bold text-neutral-800">Belum Ada Slide</h3>
               <p className="text-neutral-500 mt-2">Mulai dengan menambahkan slide perdana Anda.</p>
            </div>
         )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 relative my-4 md:my-10">
             <button onClick={closeModal} className="absolute top-8 right-8 p-2 text-neutral-500">
                <X size={24} />
             </button>
             <h2 className="text-2xl font-black text-neutral-900 mb-8">{editingId ? 'Edit Slide' : 'Tambah Slide'}</h2>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Judul Utama</label>
                   <input required type="text" className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Sub Judul / Penjelasan</label>
                   <textarea required rows={3} className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">URL Gambar</label>
                   <input required type="text" className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 shadow-xl">
                   {editingId ? 'Simpan Perubahan' : 'Tambahkan Slide'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
