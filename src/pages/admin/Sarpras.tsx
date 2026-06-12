import { useState, useEffect } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { 
  ChevronLeft,
  Plus,
  Trash2,
  X,
  Edit2,
  Image as ImageIcon,
  Layout,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderBy, QueryConstraint } from 'firebase/firestore';

interface SarprasItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
}

export default function AdminSarpras() {
  const { data: sarpras, fetchData, add, update, remove, loading } = useFirestore<SarprasItem>('sarpras');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
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
      await add({ 
        ...formData, 
        order: sarpras.length,
        createdAt: new Date().toISOString()
      });
    }
    closeModal();
  };

  const openEdit = (item: SarprasItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      order: item.order
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ 
      title: '', 
      description: '', 
      imageUrl: '', 
      order: 0 
    });
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sarpras.length) return;

    const item1 = sarpras[index];
    const item2 = sarpras[newIndex];

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
                  <h1 className="text-2xl font-bold text-neutral-900">Sarana & Prasarana</h1>
                  <p className="text-neutral-500 text-sm">Kelola fasilitas dan infrastruktur sekolah.</p>
               </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg"
            >
              <Plus size={20} /> Tambah Fasilitas
            </button>
         </div>
      </div>

      <div className="container mx-auto px-8 py-10">
         {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1,2,3].map(i => <div key={i} className="animate-pulse bg-white rounded-3xl h-64 border border-neutral-200"></div>)}
            </div>
         ) : sarpras.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {sarpras.map((item, index) => (
                  <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-neutral-200 group">
                     {item.imageUrl && (
                        <div className="aspect-video relative overflow-hidden">
                           <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                           <div className="absolute top-4 left-4 flex gap-1">
                              <button 
                                 disabled={index === 0}
                                 onClick={() => moveOrder(index, 'up')}
                                 className="bg-white/90 p-1.5 rounded-lg text-neutral-600 hover:text-emerald-600 disabled:opacity-30 disabled:hover:text-neutral-600"
                              >
                                 <ArrowUp size={14} />
                              </button>
                              <button 
                                 disabled={index === sarpras.length - 1}
                                 onClick={() => moveOrder(index, 'down')}
                                 className="bg-white/90 p-1.5 rounded-lg text-neutral-600 hover:text-emerald-600 disabled:opacity-30 disabled:hover:text-neutral-600"
                              >
                                 <ArrowDown size={14} />
                              </button>
                           </div>
                        </div>
                     )}
                     <div className="p-8">
                        <h3 className="font-bold text-neutral-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-neutral-500 line-clamp-2 min-h-[2.5rem]">{item.description}</p>
                        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-neutral-50">
                           <button onClick={() => openEdit(item)} className="flex-grow flex items-center justify-center gap-2 py-3 bg-neutral-50 text-neutral-600 font-bold text-xs rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all">
                              <Edit2 size={14} /> Edit
                           </button>
                           <button onClick={() => { if(confirm('Hapus fasilitas ini?')) remove(item.id) }} className="p-3 text-neutral-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                              <Trash2 size={16} />
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="text-center py-40">
               <div className="text-neutral-200 flex justify-center mb-6">
                  <Layout size={80} strokeWidth={1} />
               </div>
               <h3 className="text-2xl font-bold text-neutral-800">Belum Ada Fasilitas</h3>
               <p className="text-neutral-500 mt-2">Daftar sarana dan prasarana sekolah akan tampil di sini.</p>
            </div>
         )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 relative my-4 md:my-10">
             <button onClick={closeModal} className="absolute top-8 right-8 p-2 text-neutral-500">
                <X size={24} />
             </button>
             <h2 className="text-2xl font-black text-neutral-900 mb-8">{editingId ? 'Edit Fasilitas' : 'Tambah Fasilitas'}</h2>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Nama Fasilitas</label>
                   <input required type="text" className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Deskripsi</label>
                   <textarea required className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500 h-32 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">URL Foto Fasilitas</label>
                   <div className="relative">
                      <input 
                        required 
                        type="text" 
                        className="w-full bg-neutral-100 border-none rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-emerald-500" 
                        value={formData.imageUrl} 
                        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} 
                      />
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                   </div>
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 shadow-xl mt-4">
                   {editingId ? 'Simpan Perubahan' : 'Tambahkan Fasilitas'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
