import { useState, useEffect } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { 
  ChevronLeft,
  Plus,
  Trash2,
  X,
  Video,
  Edit2,
  Youtube,
  Play
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderBy, QueryConstraint } from 'firebase/firestore';

interface VideoItem {
  id: string;
  title: string;
  youtubeId: string;
  description: string;
  order: number;
  showOnHomepage?: boolean;
}

export default function AdminVideos() {
  const { data: videos, fetchData, add, update, remove, loading } = useFirestore<VideoItem>('videos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    youtubeId: '',
    description: '',
    order: 0,
    showOnHomepage: false
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
        order: videos.length,
        createdAt: new Date().toISOString()
      });
    }
    closeModal();
  };

  const openEdit = (item: VideoItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      youtubeId: item.youtubeId,
      description: item.description || '',
      order: item.order,
      showOnHomepage: !!item.showOnHomepage
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ 
      title: '', 
      youtubeId: '', 
      description: '',
      order: 0,
      showOnHomepage: false
    });
  };

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
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
                  <h1 className="text-2xl font-bold text-neutral-900">Galeri Video</h1>
                  <p className="text-neutral-500 text-sm">Kelola video kegiatan sekolah dari YouTube.</p>
               </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg"
            >
              <Plus size={20} /> Tambah Video
            </button>
         </div>
      </div>

      <div className="container mx-auto px-8 py-10">
         {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1,2,3].map(i => <div key={i} className="animate-pulse bg-white rounded-3xl h-64 border border-neutral-200"></div>)}
            </div>
         ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {videos.map((item) => (
                  <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-neutral-200 group">
                     <div className="aspect-video bg-neutral-100 relative group-hover:bg-neutral-200 transition-colors">
                        {item.showOnHomepage && (
                           <div className="absolute top-4 left-4 z-10 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                              ● Beranda
                           </div>
                        )}
                        <img 
                          src={`https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`} 
                          alt={item.title} 
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play size={20} className="text-rose-600 fill-rose-600 ml-1" />
                           </div>
                        </div>
                     </div>
                     <div className="p-6">
                        <h3 className="font-bold text-neutral-900 line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-neutral-500 mt-2 line-clamp-2 min-h-[2.5rem]">{item.description}</p>
                        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-neutral-50">
                           <button onClick={() => openEdit(item)} className="flex-grow flex items-center justify-center gap-2 py-2.5 bg-neutral-50 text-neutral-600 font-bold text-xs rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all">
                              <Edit2 size={14} /> Edit
                           </button>
                           <button onClick={() => { if(confirm('Hapus video ini?')) remove(item.id) }} className="p-2.5 text-neutral-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
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
                  <Video size={80} strokeWidth={1} />
               </div>
               <h3 className="text-2xl font-bold text-neutral-800">Belum Ada Video</h3>
               <p className="text-neutral-500 mt-2">Daftar video kegiatan sekolah akan tampil di sini.</p>
            </div>
         )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 relative my-4 md:my-10">
             <button onClick={closeModal} className="absolute top-8 right-8 p-2 text-neutral-500">
                <X size={24} />
             </button>
             <h2 className="text-2xl font-black text-neutral-900 mb-8">{editingId ? 'Edit Video' : 'Tambah Video'}</h2>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Judul Video</label>
                   <input required type="text" className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">YouTube URL / ID</label>
                   <div className="relative">
                      <input 
                        required 
                        type="text" 
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full bg-neutral-100 border-none rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-emerald-500" 
                        value={formData.youtubeId} 
                        onChange={(e) => setFormData({...formData, youtubeId: extractYoutubeId(e.target.value)})} 
                      />
                      <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Keterangan Singkat</label>
                   <textarea className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500 h-24 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="flex items-center gap-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200 hover:bg-neutral-100/50 transition-all cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, showOnHomepage: !prev.showOnHomepage }))}>
                   <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-neutral-300 transition-colors cursor-pointer"
                      checked={formData.showOnHomepage} 
                      onChange={(e) => {
                         e.stopPropagation();
                         setFormData({...formData, showOnHomepage: e.target.checked});
                      }} 
                   />
                   <div>
                      <p className="text-xs font-bold text-neutral-800">Tampilkan di Beranda</p>
                      <p className="text-[10px] text-neutral-500">Video ini akan ditampilkan di halaman utama.</p>
                   </div>
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 shadow-xl mt-4">
                   {editingId ? 'Simpan Perubahan' : 'Tambahkan Video'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
