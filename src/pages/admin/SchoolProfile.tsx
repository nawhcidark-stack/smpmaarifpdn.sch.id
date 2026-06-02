import { useState, useEffect, useRef } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileText,
  History,
  Image as ImageIcon,
  Quote,
  User,
  Upload
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminSchoolProfile() {
  const [vision, setVision] = useState('');
  const [mission, setMission] = useState<string[]>([]);
  const [tagline, setTagline] = useState('');
  const [historyTitle, setHistoryTitle] = useState('');
  const [historyContent, setHistoryContent] = useState('');
  const [historyImageUrl, setHistoryImageUrl] = useState('');
  
  const [ppdbTitle, setPpdbTitle] = useState('');
  const [ppdbContent, setPpdbContent] = useState('');
  const [ppdbImageUrl, setPpdbImageUrl] = useState('');
  const [ppdbLink, setPpdbLink] = useState('');
  const [ppdbActive, setPpdbActive] = useState(false);

  const [principalName, setPrincipalName] = useState('');
  const [principalNip, setPrincipalNip] = useState('');
  const [principalTitle, setPrincipalTitle] = useState('');
  const [principalMessage, setPrincipalMessage] = useState('');
  const [principalImageUrl, setPrincipalImageUrl] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // File Input Refs
  const fileInputPpdbRef = useRef<HTMLInputElement>(null);
  const fileInputHistoryRef = useRef<HTMLInputElement>(null);
  const fileInputPrincipalRef = useRef<HTMLInputElement>(null);

  // Resize and compress files to base64
  const processImageFile = (file: File, callback: (base64: string) => void) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'File harus berupa gambar (PNG, JPG, WEBP).' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
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
          callback(compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'Gagal membaca file gambar.' });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'config', 'school_profile');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setVision(data.vision || '');
          setMission(data.mission || []);
          setTagline(data.tagline || '');
          setHistoryTitle(data.historyTitle || '');
          setHistoryContent(data.historyContent || '');
          setHistoryImageUrl(data.historyImageUrl || '');
          setPpdbTitle(data.ppdbTitle || '');
          setPpdbContent(data.ppdbContent || '');
          setPpdbImageUrl(data.ppdbImageUrl || '');
          setPpdbLink(data.ppdbLink || '');
          setPpdbActive(data.ppdbActive || false);
          setPrincipalName(data.principalName || '');
          setPrincipalNip(data.principalNip || '');
          setPrincipalTitle(data.principalTitle || '');
          setPrincipalMessage(data.principalMessage || '');
          setPrincipalImageUrl(data.principalImageUrl || '');
        }
      } catch (error) {
        console.error("Error fetching config:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleAddMission = () => {
    setMission([...mission, '']);
  };

  const handleUpdateMission = (index: number, value: string) => {
    const newMission = [...mission];
    newMission[index] = value;
    setMission(newMission);
  };

  const handleRemoveMission = (index: number) => {
    setMission(mission.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await setDoc(doc(db, 'config', 'school_profile'), {
        vision,
        mission: mission.filter(item => item.trim() !== ''),
        tagline,
        historyTitle,
        historyContent,
        historyImageUrl,
        ppdbTitle,
        ppdbContent,
        ppdbImageUrl,
        ppdbLink,
        ppdbActive,
        principalName,
        principalNip,
        principalTitle,
        principalMessage,
        principalImageUrl,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setMessage({ type: 'success', text: 'Profil Sekolah berhasil diperbarui!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error saving config:", error);
      setMessage({ type: 'error', text: 'Gagal menyimpan perubahan.' });
    } finally {
      setSaving(false);
    }
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
                  <h1 className="text-2xl font-bold text-neutral-900">Profil Sekolah</h1>
                  <p className="text-neutral-500 text-sm">Kelola informasi publik sekolah.</p>
               </div>
            </div>
            <button 
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg disabled:opacity-50"
            >
              <Save size={20} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
         </div>
      </div>

      <div className="container mx-auto px-8 py-10">
         {message && (
            <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
               {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
               <span className="font-bold">{message.text}</span>
            </div>
         )}

         {loading ? (
            <div className="space-y-6">
              <div className="h-40 bg-white rounded-3xl animate-pulse"></div>
              <div className="h-80 bg-white rounded-3xl animate-pulse"></div>
            </div>
         ) : (
            <div className="max-w-4xl space-y-10">
               {/* Tagline Section */}
               <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-neutral-200">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                        <Quote size={20} />
                     </div>
                     <h2 className="text-xl font-black text-neutral-900 uppercase tracking-widest text-sm">Tagline / Slogan</h2>
                  </div>
                  <input 
                    type="text"
                    className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium text-neutral-700"
                    placeholder="Masukkan tagline sekolah..."
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                  />
                  <p className="text-xs text-neutral-400 mt-2 ml-1 italic">Tagline akan muncul di header halaman profil.</p>
               </section>

               {/* Vision Section */}
               <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-neutral-200">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                        <FileText size={20} />
                     </div>
                     <h2 className="text-xl font-black text-neutral-900 uppercase tracking-widest text-sm">Visi Sekolah</h2>
                  </div>
                  <textarea 
                    className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all h-32 resize-none font-medium text-neutral-700"
                    placeholder="Masukkan visi sekolah..."
                    value={vision}
                    onChange={(e) => setVision(e.target.value)}
                  />
               </section>

               {/* Mission Section */}
               <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-neutral-200">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                          <CheckCircle2 size={20} />
                       </div>
                       <h2 className="text-xl font-black text-neutral-900 uppercase tracking-widest text-sm">Misi Sekolah</h2>
                    </div>
                    <button 
                      onClick={handleAddMission}
                      className="flex items-center gap-2 text-emerald-600 font-bold hover:bg-emerald-50 px-4 py-2 rounded-xl transition-all"
                    >
                      <Plus size={20} /> Tambah Misi
                    </button>
                  </div>

                  <div className="space-y-4">
                     {mission.length > 0 ? mission.map((item, index) => (
                        <div key={index} className="flex gap-4 group">
                           <div className="flex-none pt-4">
                              <span className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center font-bold text-neutral-400 text-xs">{index + 1}</span>
                           </div>
                           <textarea 
                             className="flex-grow bg-neutral-50 border-2 border-neutral-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all h-20 resize-none font-medium text-neutral-700"
                             value={item}
                             onChange={(e) => handleUpdateMission(index, e.target.value)}
                           />
                           <button 
                             onClick={() => handleRemoveMission(index)}
                             className="flex-none self-start mt-2 p-3 text-neutral-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                           >
                             <Trash2 size={20} />
                           </button>
                        </div>
                     )) : (
                        <div className="text-center py-10 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200">
                           <p className="text-neutral-400 font-medium italic">Belum ada butir misi yang ditambahkan.</p>
                        </div>
                     )}
                  </div>
               </section>

               {/* History Section */}
               <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-neutral-200">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <History size={20} />
                     </div>
                     <h2 className="text-xl font-black text-neutral-900 uppercase tracking-widest text-sm">Sejarah Sekolah</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Judul Sejarah</label>
                       <input 
                         type="text" 
                         className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" 
                         value={historyTitle} 
                         onChange={(e) => setHistoryTitle(e.target.value)}
                         placeholder="Contoh: Sejarah Singkat" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Konten Sejarah</label>
                       <textarea 
                         className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500 h-64 resize-none" 
                         value={historyContent} 
                         onChange={(e) => setHistoryContent(e.target.value)}
                         placeholder="Tuliskan sejarah sekolah di sini..." 
                       />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Foto Sejarah Sekolah</label>
                       
                       {historyImageUrl ? (
                          <div className="relative group border border-neutral-200 rounded-[2rem] p-4 bg-neutral-50/50 flex flex-col items-center">
                            <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-100 flex items-center justify-center border border-neutral-200 shadow-inner">
                              <img 
                                src={historyImageUrl} 
                                alt="Foto Sejarah" 
                                className="h-full object-contain"
                              />
                            </div>
                            <div className="flex gap-3 mt-4 w-full justify-center">
                              <button
                                type="button"
                                onClick={() => fileInputHistoryRef.current?.click()}
                                className="flex items-center gap-2 text-xs font-bold bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 px-4 py-2.5 rounded-xl transition-all"
                              >
                                <Upload size={14} /> Ganti Gambar
                              </button>
                              <button
                                type="button"
                                onClick={() => setHistoryImageUrl('')}
                                className="flex items-center gap-2 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2.5 rounded-xl transition-all"
                              >
                                <Trash2 size={14} /> Hapus
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            onClick={() => fileInputHistoryRef.current?.click()}
                            className="border-2 border-dashed border-neutral-200 rounded-[2rem] p-8 text-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                          >
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                              <Upload size={24} className="text-blue-600" />
                            </div>
                            <p className="font-bold text-neutral-700 text-sm">Upload Foto Sejarah</p>
                            <p className="text-[10px] text-neutral-400 mt-1">Klik untuk memilih file gambar dari komputer Anda</p>
                          </div>
                        )}
                        <input 
                          ref={fileInputHistoryRef}
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              processImageFile(file, (base64) => setHistoryImageUrl(base64));
                            }
                          }}
                        />

                        {/* Collapsible/Optional text input for Image URL */}
                        <div className="pt-2">
                          <details className="group">
                            <summary className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest cursor-pointer list-none select-none flex items-center gap-1 hover:text-neutral-600">
                              <span className="transition-transform group-open:rotate-90">▶</span>
                              Atau gunakan URL Link Gambar
                            </summary>
                            <div className="pt-2">
                              <div className="relative">
                                 <input 
                                   type="text" 
                                   className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-emerald-500 text-sm" 
                                   value={historyImageUrl} 
                                   onChange={(e) => setHistoryImageUrl(e.target.value)}
                                   placeholder="https://images.unsplash.com/..." 
                                 />
                                 <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                              </div>
                            </div>
                          </details>
                        </div>
                    </div>
                  </div>
               </section>

               {/* PPDB Section */}
               <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-neutral-200">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                          <ImageIcon size={20} />
                       </div>
                       <h2 className="text-xl font-black text-neutral-900 uppercase tracking-widest text-sm">Promosi PPDB / SPMB</h2>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={ppdbActive}
                        onChange={(e) => setPpdbActive(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      <span className="ml-3 text-sm font-bold text-neutral-500">{ppdbActive ? 'Aktif' : 'Nonaktif'}</span>
                    </label>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Judul Promosi</label>
                       <input 
                         type="text" 
                         className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" 
                         value={ppdbTitle} 
                         onChange={(e) => setPpdbTitle(e.target.value)}
                         placeholder="Contoh: Penerimaan Peserta Didik Baru 2024/2025" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Informasi / Uraian</label>
                       <textarea 
                         className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500 h-40 resize-none font-medium" 
                         value={ppdbContent} 
                         onChange={(e) => setPpdbContent(e.target.value)}
                         placeholder="Tuliskan detail pendaftaran, syarat, dsb..." 
                       />
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1 font-bold">Gambar Brosur PPDB / SPMB</label>
                        
                        {ppdbImageUrl ? (
                          <div className="relative group border border-neutral-200 rounded-[2rem] p-4 bg-neutral-50/50 flex flex-col items-center">
                            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 flex items-center justify-center border border-neutral-200 shadow-inner">
                              <img 
                                src={ppdbImageUrl} 
                                alt="Brosur PPDB" 
                                className="h-full object-contain"
                              />
                            </div>
                            <div className="flex gap-3 mt-4 w-full justify-center">
                              <button
                                type="button"
                                onClick={() => fileInputPpdbRef.current?.click()}
                                className="flex items-center gap-2 text-xs font-bold bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 px-4 py-2.5 rounded-xl transition-all"
                              >
                                <Upload size={14} /> Ganti Gambar
                              </button>
                              <button
                                type="button"
                                onClick={() => setPpdbImageUrl('')}
                                className="flex items-center gap-2 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2.5 rounded-xl transition-all"
                              >
                                <Trash2 size={14} /> Hapus
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            onClick={() => fileInputPpdbRef.current?.click()}
                            className="border-2 border-dashed border-neutral-200 rounded-[2rem] p-8 text-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                          >
                            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                              <Upload size={24} className="text-rose-600" />
                            </div>
                            <p className="font-bold text-neutral-700 text-sm">Upload Gambar Brosur</p>
                            <p className="text-[10px] text-neutral-400 mt-1">Klik untuk memilih file gambar dari komputer Anda</p>
                          </div>
                        )}
                        <input 
                          ref={fileInputPpdbRef}
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              processImageFile(file, (base64) => setPpdbImageUrl(base64));
                            }
                          }}
                        />

                        {/* Collapsible/Optional text input for Image URL */}
                        <div className="pt-2">
                          <details className="group">
                            <summary className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest cursor-pointer list-none select-none flex items-center gap-1 hover:text-neutral-600">
                              <span className="transition-transform group-open:rotate-90">▶</span>
                              Atau gunakan URL Link Gambar
                            </summary>
                            <div className="pt-2">
                              <div className="relative">
                                 <input 
                                   type="text" 
                                   className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-emerald-500 text-sm" 
                                   value={ppdbImageUrl} 
                                   onChange={(e) => setPpdbImageUrl(e.target.value)}
                                   placeholder="https://..." 
                                 />
                                 <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                              </div>
                            </div>
                          </details>
                        </div>
                      </div>

                      <div className="flex flex-col justify-start space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">URL Link Pendaftaran (Online)</label>
                           <div className="relative">
                              <input 
                                type="text" 
                                className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-emerald-500" 
                                value={ppdbLink} 
                                onChange={(e) => setPpdbLink(e.target.value)}
                                placeholder="https://form.google.com/..." 
                              />
                              <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
               </section>

               {/* Kepala Sekolah Section */}
               <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-neutral-200">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                        <User size={20} />
                     </div>
                     <h2 className="text-xl font-black text-neutral-900 uppercase tracking-widest text-sm">Profil / Sambutan Kepala Sekolah</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Judul Bagian</label>
                         <input 
                           type="text" 
                           className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" 
                           value={principalTitle} 
                           onChange={(e) => setPrincipalTitle(e.target.value)}
                           placeholder="Contoh: Sambutan Kepala Sekolah" 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Nama Kepala Sekolah</label>
                         <input 
                           type="text" 
                           className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" 
                           value={principalName} 
                           onChange={(e) => setPrincipalName(e.target.value)}
                           placeholder="Contoh: H. Sholikhuddin, S.Ag., M.Pd." 
                         />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">NIP (Opsional)</label>
                         <input 
                           type="text" 
                           className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500" 
                           value={principalNip} 
                           onChange={(e) => setPrincipalNip(e.target.value)}
                           placeholder="Contoh: 19700101 200003 1 001" 
                         />
                      </div>
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1 font-bold">Foto Kepala Sekolah</label>
                         
                         {principalImageUrl ? (
                           <div className="relative group border border-neutral-200 rounded-[2rem] p-4 bg-neutral-50/50 flex flex-col items-center">
                             <div className="w-48 h-60 rounded-2xl overflow-hidden bg-neutral-100 flex items-center justify-center border border-neutral-200 shadow-inner">
                               <img 
                                 src={principalImageUrl} 
                                 alt="Kepala Sekolah" 
                                 className="h-full w-full object-cover"
                               />
                             </div>
                             <div className="flex gap-3 mt-4 w-full justify-center">
                               <button
                                 type="button"
                                 onClick={() => fileInputPrincipalRef.current?.click()}
                                 className="flex items-center gap-2 text-xs font-bold bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 px-4 py-2.5 rounded-xl transition-all"
                               >
                                 <Upload size={14} /> Ganti Gambar
                               </button>
                               <button
                                 type="button"
                                 onClick={() => setPrincipalImageUrl('')}
                                 className="flex items-center gap-2 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2.5 rounded-xl transition-all"
                               >
                                 <Trash2 size={14} /> Hapus
                               </button>
                             </div>
                           </div>
                         ) : (
                           <div 
                             onClick={() => fileInputPrincipalRef.current?.click()}
                             className="border-2 border-dashed border-neutral-200 rounded-[2rem] p-8 text-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                           >
                             <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                               <Upload size={24} className="text-emerald-600" />
                             </div>
                             <p className="font-bold text-neutral-700 text-sm">Upload Foto Kepala Sekolah</p>
                             <p className="text-[10px] text-neutral-400 mt-1">Klik untuk memilih file gambar dari komputer Anda</p>
                           </div>
                         )}
                         <input 
                           ref={fileInputPrincipalRef}
                           type="file" 
                           accept="image/*" 
                           className="hidden" 
                           onChange={(e) => {
                             const file = e.target.files?.[0];
                             if (file) {
                               processImageFile(file, (base64) => setPrincipalImageUrl(base64));
                             }
                           }}
                         />

                         {/* Collapsible/Optional text input for Image URL */}
                         <div className="pt-2">
                           <details className="group">
                             <summary className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest cursor-pointer list-none select-none flex items-center gap-1 hover:text-neutral-600">
                               <span className="transition-transform group-open:rotate-90">▶</span>
                               Atau gunakan URL Link Gambar
                             </summary>
                             <div className="pt-2">
                               <div className="relative">
                                  <input 
                                    type="text" 
                                    className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-emerald-500 text-sm" 
                                    value={principalImageUrl} 
                                    onChange={(e) => setPrincipalImageUrl(e.target.value)}
                                    placeholder="https://images.unsplash.com/..." 
                                  />
                                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                               </div>
                             </div>
                           </details>
                         </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Uraian Sambutan / Pesan</label>
                       <textarea 
                         className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500 h-48 resize-none font-medium text-neutral-700" 
                         value={principalMessage} 
                         onChange={(e) => setPrincipalMessage(e.target.value)}
                         placeholder="Tuliskan kata sambutan atau ringkasan profil kepala sekolah..." 
                       />
                    </div>
                  </div>
               </section>
            </div>
         )}
      </div>
    </div>
  );
}
