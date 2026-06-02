import { useState, useEffect } from 'react';
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
  User
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
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">URL Foto Sejarah</label>
                       <div className="relative">
                          <input 
                            type="text" 
                            className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-emerald-500" 
                            value={historyImageUrl} 
                            onChange={(e) => setHistoryImageUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/..." 
                          />
                          <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
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
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">URL Gambar Brosur</label>
                         <div className="relative">
                            <input 
                              type="text" 
                              className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-emerald-500" 
                              value={ppdbImageUrl} 
                              onChange={(e) => setPpdbImageUrl(e.target.value)}
                              placeholder="https://..." 
                            />
                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                         </div>
                      </div>
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
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">URL Foto Kepala Sekolah</label>
                         <div className="relative">
                            <input 
                              type="text" 
                              className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-emerald-500" 
                              value={principalImageUrl} 
                              onChange={(e) => setPrincipalImageUrl(e.target.value)}
                              placeholder="https://images.unsplash.com/..." 
                            />
                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
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
