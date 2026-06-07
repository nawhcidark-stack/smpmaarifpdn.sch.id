import { useState, useEffect, useRef } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { 
  ChevronLeft,
  Plus,
  Trash2,
  X,
  Users,
  Edit,
  Camera,
  Upload,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderBy } from 'firebase/firestore';
import Papa from 'papaparse';

interface Teacher {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  bio: string;
  order: number;
}

export default function AdminTeachers() {
  const { data: teachers, fetchData, add, update, remove, loading } = useFirestore<Teacher>('teachers');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<{current: number, total: number} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputTeacherRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const processImageFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('File harus berupa gambar (PNG, JPG, WEBP).');
      return;
    }
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          setFormData(prev => ({ ...prev, photoUrl: compressedBase64 }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setUploadError('Gagal membaca file gambar.');
    };
    reader.readAsDataURL(file);
  };
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    photoUrl: '',
    bio: '',
    order: 0
  });

  useEffect(() => {
    fetchData(orderBy('order', 'asc'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      await update(editingTeacher.id, { ...formData });
    } else {
      await add({ ...formData });
    }
    setIsModalOpen(false);
    setEditingTeacher(null);
    setFormData({ name: '', role: '', photoUrl: '', bio: '', order: 0 });
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      role: teacher.role,
      photoUrl: teacher.photoUrl,
      bio: teacher.bio,
      order: teacher.order
    });
    setIsModalOpen(true);
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
        
        const startOrder = teachers.length;

        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const teacherData = {
            name: row['Nama'] || row['name'] || '',
            role: row['Jabatan'] || row['role'] || '',
            photoUrl: row['Foto'] || row['photoUrl'] || '',
            bio: row['Bio'] || row['bio'] || '',
            order: startOrder + i
          };

          await add(teacherData);
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
                  <h1 className="text-2xl font-bold text-neutral-900">Profil Guru & Staf</h1>
                  <p className="text-neutral-500 text-sm">Kelola data tenaga pendidik.</p>
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
                onClick={() => { setEditingTeacher(null); setIsModalOpen(true); }}
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg"
              >
                <Plus size={20} /> Tambah Guru
              </button>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-8 py-10">
         {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-white rounded-3xl h-64 border border-neutral-200"></div>)}
            </div>
         ) : teachers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {teachers.map((teacher) => (
                  <div key={teacher.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-neutral-200 flex flex-col items-center text-center">
                     <img src={teacher.photoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"} alt={teacher.name} className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-emerald-100" />
                     <div className="flex-grow">
                        <h3 className="font-bold text-neutral-800">{teacher.name}</h3>
                        <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest">{teacher.role}</p>
                     </div>
                     <div className="mt-6 flex gap-2 w-full pt-4 border-t border-neutral-50">
                        <button onClick={() => handleEdit(teacher)} className="flex-grow flex items-center justify-center gap-2 p-2 bg-neutral-50 text-neutral-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all">
                           <Edit size={16} /> Edit
                        </button>
                        <button onClick={() => { if(confirm('Hapus data guru ini?')) remove(teacher.id) }} className="p-2 text-neutral-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="text-center py-40">
               <div className="text-neutral-200 flex justify-center mb-6">
                  <Users size={80} strokeWidth={1} />
               </div>
               <h3 className="text-2xl font-bold text-neutral-800">Daftar Guru Kosong</h3>
            </div>
         )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 relative my-8">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 text-neutral-500">
                <X size={24} />
             </button>
             <h2 className="text-2xl font-black text-neutral-900 mb-8">{editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}</h2>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Nama Lengkap & Gelar</label>
                   <input required type="text" className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Jabatan / Mapel</label>
                   <input required type="text" className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Bio Singkat</label>
                   <textarea className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500 h-24 resize-none" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})}></textarea>
                </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Foto Profil Guru</label>
                    <div 
                       onClick={() => fileInputTeacherRef.current?.click()}
                       className="border-2 border-dashed border-neutral-200 hover:border-emerald-500 rounded-[2rem] p-6 text-center hover:bg-emerald-50/20 transition-all cursor-pointer group relative flex flex-col items-center justify-center min-h-[140px]"
                    >
                       {formData.photoUrl ? (
                          <div className="flex flex-col items-center gap-2">
                             <img 
                                src={formData.photoUrl} 
                                alt="Preview Guru" 
                                className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                             />
                             <p className="text-xs text-neutral-500 font-bold group-hover:text-emerald-600 transition-colors">Klik untuk Mengganti Foto</p>
                          </div>
                       ) : (
                          <div className="space-y-2">
                             <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all">
                                <Camera size={24} className="text-emerald-600" />
                             </div>
                             <div>
                                <p className="font-bold text-neutral-700 text-sm">Upload Foto Langsung</p>
                                <p className="text-[10px] text-neutral-400 mt-0.5">Pilih file gambar dari penyimpanan computer/HP Anda</p>
                             </div>
                          </div>
                       )}
                       
                       <input 
                          ref={fileInputTeacherRef}
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                             const file = e.target.files?.[0];
                             if (file) {
                                processImageFile(file);
                             }
                          }}
                       />
                    </div>
                    {uploadError && (
                       <p className="text-xs text-rose-500 font-semibold px-2">{uploadError}</p>
                    )}

                    <div className="pt-2">
                       <details className="group">
                          <summary className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest cursor-pointer list-none select-none flex items-center gap-1 hover:text-neutral-600">
                             <span className="transition-transform group-open:rotate-90 text-[8px]">▶</span>
                             Atau gunakan link URL Foto
                          </summary>
                          <div className="pt-2">
                             <input 
                                type="text"
                                placeholder="https://example.com/foto-guru.jpg"
                                className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500 text-sm" 
                                value={formData.photoUrl} 
                                onChange={(e) => setFormData({...formData, photoUrl: e.target.value})} 
                             />
                          </div>
                       </details>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Urutan Tampil</label>
                    <input type="number" className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" value={formData.order} onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})} />
                 </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 shadow-xl">
                   Simpan Data Guru
                </button>
             </form>
          </div>
        </div>
      )}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 relative">
             <button onClick={() => setIsImportModalOpen(false)} className="absolute top-8 right-8 p-2 text-neutral-500">
                <X size={24} />
             </button>
             <h2 className="text-2xl font-black text-neutral-900 mb-4">Import Data Guru</h2>
             <p className="text-neutral-500 mb-8 text-sm">Upload file CSV dengan kolom: Nama, Jabatan, Bio, Foto.</p>
             
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
