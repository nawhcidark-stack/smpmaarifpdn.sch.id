import { useState, useEffect, useRef } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { 
  ChevronLeft,
  Plus,
  Trash2,
  X,
  Award,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trophy,
  Upload,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderBy, QueryConstraint } from 'firebase/firestore';
import Papa from 'papaparse';

interface Achievement {
  id: string;
  name: string;
  competition: string;
  date: string;
  location: string;
  award: string;
  level: string;
  evidence: string;
  order: number;
}

export default function AdminAchievements() {
  const { data: achievements, fetchData, add, update, remove, loading } = useFirestore<Achievement>('achievements');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<{current: number, total: number} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    competition: '',
    date: '',
    location: '',
    award: '',
    level: '',
    evidence: '',
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
        order: achievements.length,
        createdAt: new Date().toISOString()
      });
    }
    closeModal();
  };

  const openEdit = (item: Achievement) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      competition: item.competition,
      date: item.date,
      location: item.location,
      award: item.award,
      level: item.level,
      evidence: item.evidence,
      order: item.order
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ 
      name: '', 
      competition: '', 
      date: '', 
      location: '', 
      award: '', 
      level: '', 
      evidence: '', 
      order: 0 
    });
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= achievements.length) return;

    const item1 = achievements[index];
    const item2 = achievements[newIndex];

    await update(item1.id, { order: item2.order });
    await update(item2.id, { order: item1.order });
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data as any[];
        setImportStatus({ current: 0, total: data.length });
        
        // Start from current max order
        const startOrder = achievements.length;

        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          // Map CSV headers to achievement fields
          // Headers from provided file: No,Nama,"Lomba yang Diikuti","Waktu Kegiatan","Tempat Kegiatan",Penghargaan,Tingkat,Bukti
          const achievementData = {
            name: row['Nama'] || '',
            competition: row['Lomba yang Diikuti'] || '',
            date: row['Waktu Kegiatan'] || '',
            location: row['Tempat Kegiatan'] || '',
            award: row['Penghargaan'] || '',
            level: row['Tingkat'] || '',
            evidence: row['Bukti'] || '',
            order: startOrder + i,
            createdAt: new Date().toISOString()
          };

          await add(achievementData);
          setImportStatus({ current: i + 1, total: data.length });
        }
        
        setImportStatus(null);
        setIsImportModalOpen(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
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
                  <h1 className="text-2xl font-bold text-neutral-900">Data Prestasi</h1>
                  <p className="text-neutral-500 text-sm">Kelola daftar prestasi siswa SMP Maarif NU Pandaan.</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 bg-neutral-100 text-neutral-700 px-6 py-3 rounded-full font-bold hover:bg-neutral-200 transition-all"
              >
                <Upload size={20} /> Import CSV
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg"
              >
                <Plus size={20} /> Tambah Prestasi
              </button>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-8 py-10">
         {loading ? (
            <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="animate-pulse bg-white rounded-3xl h-24 border border-neutral-200"></div>)}
            </div>
         ) : achievements.length > 0 ? (
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-neutral-200">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-100">
                           <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Urutan</th>
                           <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Nama & Lomba</th>
                           <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Penghargaan</th>
                           <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Aksi</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-neutral-100">
                        {achievements.map((item, index) => (
                           <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-2">
                                    <div className="flex flex-col">
                                       <button 
                                          disabled={index === 0}
                                          onClick={() => moveOrder(index, 'up')}
                                          className="p-1 hover:bg-neutral-200 disabled:opacity-20 rounded-md"
                                       >
                                          <ArrowUp size={14} />
                                       </button>
                                       <button 
                                          disabled={index === achievements.length - 1}
                                          onClick={() => moveOrder(index, 'down')}
                                          className="p-1 hover:bg-neutral-200 disabled:opacity-20 rounded-md"
                                       >
                                          <ArrowDown size={14} />
                                       </button>
                                    </div>
                                    <span className="font-bold text-neutral-400">{index + 1}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="font-bold text-neutral-900">{item.name}</div>
                                 <div className="text-xs text-neutral-500">{item.competition}</div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-emerald-600">{item.award}</span>
                                    <span className="text-[10px] uppercase font-black text-neutral-400 tracking-wider bg-neutral-100 px-1.5 py-0.5 rounded w-fit">{item.level}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-2">
                                    <button onClick={() => openEdit(item)} className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg">
                                       <Edit2 size={16} />
                                    </button>
                                    <button 
                                      onClick={() => { if(confirm('Hapus data prestasi ini?')) remove(item.id) }}
                                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                                    >
                                       <Trash2 size={16} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         ) : (
            <div className="text-center py-40">
               <div className="text-neutral-200 flex justify-center mb-6">
                  <Trophy size={80} strokeWidth={1} />
               </div>
               <h3 className="text-2xl font-bold text-neutral-800">Belum Ada Data Prestasi</h3>
               <p className="text-neutral-500 mt-2">Mulai dengan menambahkan data prestasi siswa.</p>
            </div>
         )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 relative my-4 md:my-10">
             <button onClick={closeModal} className="absolute top-8 right-8 p-2 text-neutral-500">
                <X size={24} />
             </button>
             <h2 className="text-2xl font-black text-neutral-900 mb-8">{editingId ? 'Edit Prestasi' : 'Tambah Prestasi'}</h2>
             <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                   <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Nama Siswa</label>
                   <input required type="text" className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2">
                   <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Lomba yang Diikuti</label>
                   <input required type="text" className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" value={formData.competition} onChange={(e) => setFormData({...formData, competition: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Penghargaan (Contoh: Juara I)</label>
                   <input required type="text" className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" value={formData.award} onChange={(e) => setFormData({...formData, award: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Tingkat (Contoh: Kabupaten)</label>
                   <input required type="text" className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Waktu Kegiatan</label>
                   <input required type="text" className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Tempat Kegiatan</label>
                   <input type="text" className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2">
                   <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Bukti (Piala, Sertifikat, dll)</label>
                   <input type="text" className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" value={formData.evidence} onChange={(e) => setFormData({...formData, evidence: e.target.value})} />
                </div>
                <button type="submit" className="col-span-2 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 shadow-xl mt-4">
                   {editingId ? 'Simpan Perubahan' : 'Tambahkan Prestasi'}
                </button>
             </form>
          </div>
        </div>
      )}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 relative my-4 md:my-10">
             <button onClick={() => setIsImportModalOpen(false)} className="absolute top-8 right-8 p-2 text-neutral-500">
                <X size={24} />
             </button>
             <h2 className="text-2xl font-black text-neutral-900 mb-4">Import Data CSV</h2>
             <p className="text-neutral-500 mb-8 text-sm">Upload file CSV dengan kolom: No, Nama, Lomba yang Diikuti, Waktu Kegiatan, Tempat Kegiatan, Penghargaan, Tingkat, Bukti.</p>
             
             {importStatus ? (
               <div className="space-y-4">
                 <div className="h-4 bg-neutral-100 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-emerald-500 transition-all duration-300" 
                    style={{ width: `${(importStatus.current / importStatus.total) * 100}%` }}
                   ></div>
                 </div>
                 <p className="text-center font-bold text-emerald-600">Mengimport: {importStatus.current} / {importStatus.total}</p>
               </div>
             ) : (
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="border-2 border-dashed border-neutral-200 rounded-[2rem] p-12 text-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer group"
               >
                 <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                   <FileText size={32} className="text-emerald-600" />
                 </div>
                 <p className="font-bold text-neutral-700">Klik untuk pilih file CSV</p>
                 <p className="text-xs text-neutral-400 mt-1">Hanya mendukung format .csv</p>
                 <input 
                   ref={fileInputRef}
                   type="file" 
                   accept=".csv" 
                   className="hidden" 
                   onChange={handleCsvImport}
                 />
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
