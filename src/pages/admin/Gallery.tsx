import { useState, useEffect } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { 
  ChevronLeft,
  Plus,
  Trash2,
  X,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderBy } from 'firebase/firestore';

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
}

export default function AdminGallery() {
  const { data: items, fetchData, add, remove, loading } = useFirestore<GalleryItem>('gallery');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchData(orderBy('createdAt', 'desc'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await add({ ...formData });
    setIsModalOpen(false);
    setFormData({ title: '', imageUrl: '' });
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
                  <h1 className="text-2xl font-bold text-neutral-900">Galeri Foto</h1>
                  <p className="text-neutral-500 text-sm">Kelola dokumentasi visual sekolah.</p>
               </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg"
            >
              <Plus size={20} /> Tambah Foto
            </button>
         </div>
      </div>

      <div className="container mx-auto px-8 py-10">
         {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-white rounded-3xl h-48 border border-neutral-200"></div>)}
            </div>
         ) : items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {items.map((item) => (
                  <div key={item.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-sm border border-neutral-200">
                     <div className="aspect-square">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                     </div>
                     <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                        <p className="text-xs font-bold truncate pr-4">{item.title}</p>
                        <button 
                          onClick={() => { if(confirm('Hapus foto ini?')) remove(item.id) }}
                          className="bg-rose-500 p-2 rounded-xl hover:bg-rose-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="text-center py-40">
               <div className="text-neutral-200 flex justify-center mb-6">
                  <ImageIcon size={80} strokeWidth={1} />
               </div>
               <h3 className="text-2xl font-bold text-neutral-800">Album Foto Kosong</h3>
            </div>
         )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 relative my-4 md:my-10">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 text-neutral-500">
                <X size={24} />
             </button>
             <h2 className="text-2xl font-black text-neutral-900 mb-8">Tambah Foto</h2>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Judul / Deskripsi Singkat</label>
                   <input required type="text" className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">URL Gambar</label>
                   <input required type="text" className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 shadow-xl">
                   Simpan ke Galeri
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
