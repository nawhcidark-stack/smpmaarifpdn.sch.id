import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  ChevronLeft,
  Save,
  Globe,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: 'SMP Maarif NU Pandaan',
    tagline: 'Unggul, Berakhlak, dan Berprestasi',
    address: 'Jl. Raya Pandaan No. 123, Pasuruan, Jawa Timur',
    phone: '(0343) 123456',
    email: 'info@smpmaarifpandaan.sch.id',
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    whatsappNumber: '628123456789'
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <div className="bg-white border-b border-neutral-200 px-8 py-6">
         <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
               <Link to="/admin" className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                  <ChevronLeft size={24} className="text-neutral-500" />
               </Link>
               <div>
                  <h1 className="text-2xl font-bold text-neutral-900">Pengaturan Umum</h1>
                  <p className="text-neutral-500 text-sm">Kelola informasi identitas sekolah di Header & Footer.</p>
               </div>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : (
                <>
                  <Save size={20} /> Simpan Perubahan
                </>
              )}
            </button>
         </div>
      </div>

      <div className="container mx-auto px-8 py-10">
         <div className="max-w-4xl mx-auto space-y-8">
            {success && (
               <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 font-bold text-center animate-bounce">
                  Pengaturan berhasil disimpan!
               </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Identitas Sekolah */}
               <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-neutral-200 space-y-6">
                  <div className="flex items-center gap-3 text-emerald-600 mb-2">
                     <Globe size={24} />
                     <h2 className="text-lg font-black uppercase tracking-widest">Identitas Sekolah</h2>
                  </div>
                  <div className="space-y-4">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Nama Sekolah</label>
                        <input 
                          type="text" 
                          className="w-full bg-neutral-50 border-neutral-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500" 
                          value={formData.schoolName}
                          onChange={e => setFormData({...formData, schoolName: e.target.value})}
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Slogan / Tagline</label>
                        <input 
                          type="text" 
                          className="w-full bg-neutral-50 border-neutral-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500" 
                          value={formData.tagline}
                          onChange={e => setFormData({...formData, tagline: e.target.value})}
                        />
                     </div>
                  </div>
               </div>

               {/* Kontak */}
               <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-neutral-200 space-y-6">
                  <div className="flex items-center gap-3 text-emerald-600 mb-2">
                     <Phone size={24} />
                     <h2 className="text-lg font-black uppercase tracking-widest">Kontak</h2>
                  </div>
                  <div className="space-y-4">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Nomor Telepon</label>
                        <div className="flex items-center bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-100">
                           <Phone size={16} className="text-neutral-400 mr-3" />
                           <input 
                             type="text" 
                             className="bg-transparent border-none p-0 focus:ring-0 w-full" 
                             value={formData.phone}
                             onChange={e => setFormData({...formData, phone: e.target.value})}
                           />
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Alamat Email</label>
                        <div className="flex items-center bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-100">
                           <Mail size={16} className="text-neutral-400 mr-3" />
                           <input 
                             type="email" 
                             className="bg-transparent border-none p-0 focus:ring-0 w-full" 
                             value={formData.email}
                             onChange={e => setFormData({...formData, email: e.target.value})}
                           />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Alamat Lengkap */}
               <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-neutral-200 space-y-6 md:col-span-2">
                  <div className="flex items-center gap-3 text-emerald-600 mb-2">
                     <MapPin size={24} />
                     <h2 className="text-lg font-black uppercase tracking-widest">Alamat</h2>
                  </div>
                  <textarea 
                    rows={2}
                    className="w-full bg-neutral-50 border-neutral-100 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500" 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
               </div>

               {/* Media Sosial */}
               <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-neutral-200 space-y-6 md:col-span-2">
                  <div className="flex items-center gap-3 text-emerald-600 mb-2">
                     <Instagram size={24} />
                     <h2 className="text-lg font-black uppercase tracking-widest">Sosial Media & WA</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Facebook URL</label>
                        <div className="flex items-center bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-100">
                           <Facebook size={16} className="text-neutral-400 mr-3" />
                           <input 
                             type="text" 
                             className="bg-transparent border-none p-0 focus:ring-0 w-full" 
                             placeholder="https://facebook.com/..."
                             value={formData.facebookUrl}
                             onChange={e => setFormData({...formData, facebookUrl: e.target.value})}
                           />
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Instagram URL</label>
                        <div className="flex items-center bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-100">
                           <Instagram size={16} className="text-neutral-400 mr-3" />
                           <input 
                             type="text" 
                             className="bg-transparent border-none p-0 focus:ring-0 w-full" 
                             placeholder="https://instagram.com/..."
                             value={formData.instagramUrl}
                             onChange={e => setFormData({...formData, instagramUrl: e.target.value})}
                           />
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">YouTube URL</label>
                        <div className="flex items-center bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-100">
                           <Youtube size={16} className="text-neutral-400 mr-3" />
                           <input 
                             type="text" 
                             className="bg-transparent border-none p-0 focus:ring-0 w-full" 
                             placeholder="https://youtube.com/..."
                             value={formData.youtubeUrl}
                             onChange={e => setFormData({...formData, youtubeUrl: e.target.value})}
                           />
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">WhatsApp (62...)</label>
                        <div className="flex items-center bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-100">
                           <MessageCircle size={16} className="text-neutral-400 mr-3" />
                           <input 
                             type="text" 
                             className="bg-transparent border-none p-0 focus:ring-0 w-full" 
                             placeholder="6281..."
                             value={formData.whatsappNumber}
                             onChange={e => setFormData({...formData, whatsappNumber: e.target.value})}
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
