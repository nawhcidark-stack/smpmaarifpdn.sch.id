import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ChevronLeft,
  Plus,
  Trash2,
  X,
  Image as ImageIcon,
  ExternalLink,
  Facebook,
  RefreshCw,
  Folder,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { syncFacebookGallery, SyncStats } from '../../services/facebookSync';

interface Album {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  photoCount?: number;
  source?: string;
  createdAt?: any;
}

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  albumId?: string;
  facebookId?: string;
  source?: string;
  createdAt?: any;
}

export default function AdminGallery() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Active states
  const [activeTab, setActiveTab] = useState<'albums' | 'facebook'>('albums');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  
  // Facebook Sync Configuration state
  const [fbConfig, setFbConfig] = useState({
    facebookPageId: '',
    facebookAccessToken: '',
  });
  const [showToken, setShowToken] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Sync Progress state
  const [syncing, setSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [syncResult, setSyncResult] = useState<SyncStats | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Add Item States
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  
  const [photoForm, setPhotoForm] = useState({
    title: '',
    imageUrl: '',
    albumId: 'umum',
  });
  
  const [albumForm, setAlbumForm] = useState({
    name: '',
    description: '',
    coverUrl: '',
  });

  // Listen to Albums & Photos from Firestore
  useEffect(() => {
    setLoading(true);
    
    // Listen to Photos
    const qPhotos = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubPhotos = onSnapshot(qPhotos, (snapshot) => {
      const photoItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem));
      setPhotos(photoItems);
      setLoading(false);
    });

    // Listen to Albums
    const qAlbums = query(collection(db, 'gallery_albums'), orderBy('createdAt', 'desc'));
    const unsubAlbums = onSnapshot(qAlbums, (snapshot) => {
      const albumItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Album));
      setAlbums(albumItems);
    });

    // Load FB Config
    async function loadFbConfig() {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFbConfig({
            facebookPageId: data.facebookPageId || '',
            facebookAccessToken: data.facebookAccessToken || '',
          });
        }
      } catch (err) {
        console.error('Error loading FB settings:', err);
      }
    }
    loadFbConfig();

    return () => {
      unsubPhotos();
      unsubAlbums();
    };
  }, []);

  // Save FB Config to Firestore
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const docRef = doc(db, 'settings', 'general');
      await setDoc(docRef, { ...fbConfig }, { merge: true });
      setConfigSuccess(true);
      setTimeout(() => setConfigSuccess(false), 3000);
    } catch (err: any) {
      alert('Gagal menyimpan konfigurasi: ' + err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  // Run Facebook Sync execution
  const handleRunSync = async () => {
    if (!fbConfig.facebookPageId || !fbConfig.facebookAccessToken) {
      setSyncError('Masukkan ID Halaman dan Token Akses terlebih dahulu.');
      return;
    }
    setSyncing(true);
    setSyncError(null);
    setSyncResult(null);
    setSyncLogs([]);
    
    try {
      const results = await syncFacebookGallery(
        fbConfig.facebookPageId,
        fbConfig.facebookAccessToken,
        (msg) => setSyncLogs(prev => [...prev, msg])
      );
      setSyncResult(results);
    } catch (err: any) {
      setSyncError(err.message || 'Terjadi kesalahan tidak dikenal saat sinkronisasi.');
    } finally {
      setSyncing(false);
    }
  };

  // Create Local Manual Album
  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const albumId = 'local_' + Date.now();
      await setDoc(doc(db, 'gallery_albums', albumId), {
        name: albumForm.name,
        description: albumForm.description,
        coverUrl: albumForm.coverUrl || '',
        photoCount: 0,
        source: 'local',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setIsAlbumModalOpen(false);
      setAlbumForm({ name: '', description: '', coverUrl: '' });
      setSelectedAlbumId(albumId); // open it right away
    } catch (err: any) {
      alert('Gagal membuat album: ' + err.message);
    }
  };

  // Create Local Manual Photo
  const handleCreatePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const photoId = 'photo_' + Date.now();
      await setDoc(doc(db, 'gallery', photoId), {
        title: photoForm.title,
        imageUrl: photoForm.imageUrl,
        albumId: photoForm.albumId,
        category: 'Sekolah',
        source: 'local',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update album photoCount if it is a local album
      if (photoForm.albumId && photoForm.albumId !== 'umum') {
        const albumRef = doc(db, 'gallery_albums', photoForm.albumId);
        const albumSnap = await getDoc(albumRef);
        if (albumSnap.exists()) {
          const currentCount = albumSnap.data().photoCount || 0;
          await setDoc(albumRef, { photoCount: currentCount + 1 }, { merge: true });
        }
      }

      setIsPhotoModalOpen(false);
      setPhotoForm(prev => ({ ...prev, title: '', imageUrl: '' }));
    } catch (err: any) {
      alert('Gagal menambahkan foto: ' + err.message);
    }
  };

  // Remove Photo Handler
  const handleRemovePhoto = async (photo: GalleryItem) => {
    if (!confirm('Hapus foto ini dari galeri?')) return;
    try {
      await deleteDoc(doc(db, 'gallery', photo.id));
      
      // Decrement photoCount in Album
      if (photo.albumId && photo.albumId !== 'umum') {
        const albumRef = doc(db, 'gallery_albums', photo.albumId);
        const albumSnap = await getDoc(albumRef);
        if (albumSnap.exists()) {
          const currentCount = albumSnap.data().photoCount || 0;
          const newCount = Math.max(0, currentCount - 1);
          await setDoc(albumRef, { photoCount: newCount }, { merge: true });
        }
      }
    } catch (err: any) {
      alert('Gagal menghapus foto: ' + err.message);
    }
  };

  // Remove Album Handler
  const handleRemoveAlbum = async (albumId: string) => {
    if (!confirm('Hapus album ini? Semua referensi foto di dalam album ini juga akan diubah.')) return;
    try {
      await deleteDoc(doc(db, 'gallery_albums', albumId));
      
      // Update photos belonging to this album to 'umum'
      const albumPhotos = photos.filter(p => p.albumId === albumId);
      for (const photo of albumPhotos) {
        await setDoc(doc(db, 'gallery', photo.id), { albumId: 'umum' }, { merge: true });
      }

      setSelectedAlbumId(null);
    } catch (err: any) {
      alert('Gagal menghapus album: ' + err.message);
    }
  };

  // Render variables
  const selectedAlbum = albums.find(a => a.id === selectedAlbumId);
  const displayedPhotos = selectedAlbumId 
    ? photos.filter(p => p.albumId === selectedAlbumId)
    : photos.filter(p => !p.albumId || p.albumId === 'umum');

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 font-sans">
      {/* Header Bar */}
      <div className="bg-white border-b border-neutral-200 px-8 py-6">
         <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
               <Link to="/admin" className="p-2 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer">
                  <ChevronLeft size={24} className="text-neutral-500" />
               </Link>
               <div>
                  <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Kelola Galeri & Facebook Sync</h1>
                  <p className="text-neutral-500 text-sm font-medium">Atur dokumentasi, buat album manual, atau sinkronisasikan langsung dengan Facebook.</p>
               </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setIsAlbumModalOpen(true)}
                className="flex items-center gap-2 bg-neutral-100 text-neutral-700 px-6 py-3 rounded-full font-bold hover:bg-neutral-200 transition-all cursor-pointer text-sm"
              >
                <Folder size={18} /> Buat Album Baru
              </button>
              <button 
                onClick={() => {
                  setPhotoForm(p => ({ ...p, albumId: selectedAlbumId || 'umum' }));
                  setIsPhotoModalOpen(true);
                }}
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95 cursor-pointer text-sm"
              >
                <Plus size={18} /> Unggah Foto
              </button>
            </div>
         </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="container mx-auto px-8 mt-8">
        <div className="flex border-b border-neutral-200 gap-6">
          <button
            onClick={() => {
              setActiveTab('albums');
              setSelectedAlbumId(null);
            }}
            className={`pb-4 text-sm font-black uppercase tracking-wider relative transition-colors cursor-pointer ${
              activeTab === 'albums' ? 'text-emerald-600' : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            Daftar Album & Hasil Upload
            {activeTab === 'albums' && <span className="absolute bottom-0 inset-x-0 h-1 bg-emerald-600 rounded-full" />}
          </button>
          
          <button
            onClick={() => setActiveTab('facebook')}
            className={`pb-4 text-sm font-black uppercase tracking-wider relative transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'facebook' ? 'text-blue-600' : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            <Facebook size={16} fill="currentColor" /> Integrasi Facebook Page Sync
            {activeTab === 'facebook' && <span className="absolute bottom-0 inset-x-0 h-1 bg-blue-600 rounded-full" />}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-8 py-8">
        {activeTab === 'albums' && (
          <div>
            {/* 1. ALBUMS SELECTION VIEW */}
            {!selectedAlbumId && (
              <div className="space-y-8">
                <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-neutral-200">
                  <div className="flex items-center gap-3 text-neutral-800">
                    <Folder size={24} className="text-emerald-600" />
                    <div>
                      <h3 className="font-extrabold text-lg">Direktori Album Sekolah</h3>
                      <p className="text-xs text-neutral-400 font-medium font-mono uppercase tracking-wider mt-0.5">Automated Grouping / Manual</p>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-bold">
                    {albums.length} Album Tersedia
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {/* Generic 'Foto Umum' Album */}
                  <div 
                    onClick={() => setSelectedAlbumId('umum')}
                    className="bg-white rounded-3xl overflow-hidden border border-neutral-300 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="aspect-[4/3] bg-neutral-100 flex items-center justify-center text-neutral-300">
                      <ImageIcon size={48} strokeWidth={1} />
                    </div>
                    <div className="p-5 flex-grow">
                      <h4 className="font-bold text-neutral-800 text-base group-hover:text-emerald-700 transition-colors">
                        Foto Umum / Lainnya
                      </h4>
                      <p className="text-xs text-neutral-400 mt-1 font-medium">Foto yang diunggah manual tanpa album spesifik.</p>
                      <p className="text-xs font-mono font-bold text-slate-500 mt-4 bg-slate-50 p-2 rounded-lg inline-block">
                        {photos.filter(p => !p.albumId || p.albumId === 'umum').length} Foto
                      </p>
                    </div>
                    <div className="p-4 border-t border-neutral-50 text-right text-xs font-bold text-emerald-600">
                      Buka Album &rarr;
                    </div>
                  </div>

                  {/* Facebook / Local custom albums list */}
                  {albums.map((album) => (
                    <div 
                      key={album.id}
                      onClick={() => setSelectedAlbumId(album.id)}
                      className="bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between relative"
                    >
                      <div>
                        <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden">
                          {album.coverUrl ? (
                            <img src={album.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={album.name} referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-300">
                              <Folder size={48} strokeWidth={1} />
                            </div>
                          )}

                          {album.source === 'facebook' ? (
                            <div className="absolute top-2 left-2 bg-blue-600 text-[9px] text-white font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                              <Facebook size={10} fill="white" /> FB
                            </div>
                          ) : (
                            <div className="absolute top-2 left-2 bg-neutral-600 text-[9px] text-white font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                              Local
                            </div>
                          )}
                        </div>

                        <div className="p-5">
                          <h4 className="font-bold text-neutral-800 text-base group-hover:text-emerald-700 transition-colors line-clamp-1">
                            {album.name}
                          </h4>
                          {album.description && (
                            <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                              {album.description}
                            </p>
                          )}
                          <p className="text-xs font-mono font-bold text-slate-500 mt-4 bg-slate-50 p-2 rounded-lg inline-block">
                            {album.photoCount || 0} Foto
                          </p>
                        </div>
                      </div>

                      <div className="p-4 border-t border-neutral-50 flex items-center justify-between text-xs font-bold">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAlbum(album.id);
                          }}
                          className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Album"
                        >
                          <Trash2 size={15} />
                        </button>
                        <span className="text-emerald-600">
                          Buka &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. SPECIFIC ALBUM PHOTOS MANAGEMENT */}
            {selectedAlbumId && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedAlbumId(null)}
                      className="p-2 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
                    >
                      <ArrowLeft size={24} className="text-neutral-500" />
                    </button>
                    <div>
                      <span className="bg-neutral-150 text-neutral-500 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
                        {selectedAlbumId === 'umum' ? 'Kategori Umum' : selectedAlbum?.source === 'facebook' ? 'Album Facebook' : 'Album Manual'}
                      </span>
                      <h2 className="text-xl font-black text-neutral-900 mt-1">
                        {selectedAlbumId === 'umum' ? 'Foto Umum / Lainnya' : selectedAlbum?.name}
                      </h2>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {selectedAlbumId !== 'umum' && (
                      <button 
                        onClick={() => handleRemoveAlbum(selectedAlbumId)}
                        className="text-rose-500 border border-rose-200 bg-rose-50 hover:bg-rose-100 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 cursor-pointer text-xs"
                      >
                        <Trash2 size={14} /> Hapus Album Ini
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setPhotoForm(p => ({ ...p, albumId: selectedAlbumId }));
                        setIsPhotoModalOpen(true);
                      }}
                      className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 cursor-pointer text-xs shadow-md active:scale-95"
                    >
                      <Plus size={14} /> Tambah Foto Ke Album ini
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="animate-pulse bg-white p-20 rounded-3xl text-center">Loading...</div>
                ) : displayedPhotos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {displayedPhotos.map((item) => (
                      <div key={item.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-sm border border-neutral-200">
                         <div className="aspect-square bg-slate-50 overflow-hidden">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                         </div>
                         <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                            <p className="text-xs font-bold truncate pr-4">{item.title}</p>
                            <button 
                              onClick={() => handleRemovePhoto(item)}
                              className="bg-rose-500 p-2 rounded-xl hover:bg-rose-600 transition-colors cursor-pointer text-white shadow"
                            >
                              <Trash2 size={14} />
                            </button>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-neutral-300">
                    <ImageIcon className="mx-auto text-neutral-300 mb-4" size={64} strokeWidth={1} />
                    <h3 className="font-bold text-neutral-700 text-lg">Belum Ada Foto</h3>
                    <p className="text-neutral-400 text-xs mt-1">Gunakan tombol 'Unggah Foto' untuk mengisi album ini.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'facebook' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Configuration Form (Col-span 2) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 text-blue-600">
                  <Facebook size={24} fill="currentColor" />
                  <h3 className="font-extrabold text-lg">Pengaturan Kredensial</h3>
                </div>

                <form onSubmit={handleSaveConfig} className="space-y-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">ID Halaman / Username Facebook</label>
                     <input 
                       required
                       type="text" 
                       placeholder="Contoh: smpmaarifnupandaan atau ID numerik"
                       className="w-full bg-neutral-50 border-neutral-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500" 
                       value={fbConfig.facebookPageId}
                       onChange={e => setFbConfig({...fbConfig, facebookPageId: e.target.value})}
                     />
                  </div>

                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1 flex justify-between">
                       <span>Page Access Token</span>
                       <button 
                         type="button" 
                         onClick={() => setShowToken(!showToken)}
                         className="lowercase font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                       >
                         {showToken ? <><EyeOff size={12} /> sembunyikan</> : <><Eye size={12} /> tampilkan</>}
                       </button>
                     </label>
                     <input 
                       required
                       type={showToken ? 'text' : 'password'} 
                       placeholder="EAA..."
                       className="w-full bg-neutral-50 border-neutral-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 font-mono text-xs" 
                       value={fbConfig.facebookAccessToken}
                       onChange={e => setFbConfig({...fbConfig, facebookAccessToken: e.target.value})}
                     />
                  </div>

                  {configSuccess && (
                    <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100 text-xs font-bold text-center">
                      Pengaturan Facebook berhasil disimpan!
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={savingConfig}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {savingConfig ? 'Menyimpan...' : 'Simpan Kredensial'}
                  </button>
                </form>
              </div>

              {/* Instructions Box */}
              <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-150 space-y-3 text-indigo-900 text-xs leading-relaxed">
                <h4 className="font-black uppercase tracking-wider flex items-center gap-2 text-indigo-900">
                  <Sparkles size={14} className="text-indigo-600" /> Cara Menghubungkan Facebook:
                </h4>
                <ol className="list-decimal pl-5 space-y-1.5 font-medium text-indigo-850">
                  <li>Buka Facebook Developer Portal (<a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline text-indigo-700 font-bold">developers.facebook.com</a>).</li>
                  <li>Buat Facebook App baru, pastikan didukung permission <code className="bg-white/60 px-1 py-0.5 rounded text-indigo-800">pages_read_user_content</code> dan <code className="bg-white/60 px-1 py-0.5 rounded text-indigo-800">pages_show_list</code>.</li>
                  <li>Dapatkan <strong>Page Access Token</strong> berdurasi tak terbatas dari menu Token Generator (Graph Explorer).</li>
                  <li>Masukkan <strong>ID Halaman</strong> (bisa berupa teks link atau deretan angka ID) & simpan perubahan.</li>
                  <li>Klik tombol "Sinkronisasi" di panel kanan untuk menarik semua album!</li>
                </ol>
              </div>
            </div>

            {/* Sync Console & Logs Output (Col-span 3) */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-200 shadow-sm space-y-6 flex flex-col justify-between min-h-[400px]">
                <div>
                  <h3 className="font-extrabold text-lg text-neutral-800 flex items-center justify-between">
                    <span>Panel Sinkronisasi Galeri</span>
                    {syncing && (
                      <span className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full animate-pulse">
                        <RefreshCw size={12} className="animate-spin" /> Proses Sinkronisasi...
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">Membaca album & foto publik Facebook, lalu menyamakan direktori album otomatis di website.</p>

                  {/* Logs Screen */}
                  <div className="bg-slate-950 rounded-2xl p-4 mt-6 font-mono text-[11px] text-slate-300 h-64 overflow-y-auto space-y-1.5 select-text border border-slate-900">
                    <p className="text-emerald-500 font-bold">&gt;_ System Konsol Siap.</p>
                    {syncLogs.map((log, index) => (
                      <p key={index} className="text-slate-200">{log}</p>
                    ))}
                    {syncLogs.length === 0 && !syncing && (
                      <p className="text-slate-600">Tekan "Sinkronisasi Sekarang" di bawah untuk memulai proses...</p>
                    )}
                    {syncing && (
                      <div className="w-1.5 h-3.5 bg-blue-500 animate-pulse inline-block" />
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-neutral-100">
                  {/* Complete Sync stats */}
                  {syncResult && (
                    <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-150 flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-600 shrink-0" size={24} />
                      <div className="text-xs">
                        <p className="font-extrabold">Sinkronisasi Selesai Berhasil!</p>
                        <p className="font-medium text-emerald-700 mt-0.5">
                          Berhasil menyinkronkan <strong>{syncResult.albumsSynced} album</strong> dan mengunduh total <strong>{syncResult.photosSynced} foto</strong> langsung dari Facebook.
                        </p>
                      </div>
                    </div>
                  )}

                  {syncError && (
                    <div className="bg-rose-50 text-rose-800 p-4 rounded-2xl border border-rose-150 flex items-center gap-3">
                      <AlertCircle className="text-rose-600 shrink-0" size={24} />
                      <div className="text-xs">
                        <p className="font-extrabold">Gagal Sinkronisasi</p>
                        <p className="font-medium text-rose-700 mt-0.5">{syncError}</p>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleRunSync}
                    disabled={syncing || !fbConfig.facebookPageId || !fbConfig.facebookAccessToken}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 select-none disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                    {syncing ? 'Menyinkronkan Data...' : 'Sinkronisasi Sekarang'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD ALBUM MODAL */}
      {isAlbumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 relative my-4 md:my-10">
             <button onClick={() => setIsAlbumModalOpen(false)} className="absolute top-8 right-8 p-2 text-neutral-500 cursor-pointer">
                <X size={24} />
             </button>
             <h2 className="text-2xl font-black text-neutral-900 mb-6">Buat Album Manual</h2>
             <form onSubmit={handleCreateAlbum} className="space-y-5">
                <div className="space-y-1">
                   <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Nama Album</label>
                   <input required type="text" className="w-full bg-neutral-105 border border-neutral-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="Contoh: Kegiatan LDKS 2026" value={albumForm.name} onChange={(e) => setAlbumForm({...albumForm, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Deskripsi Singkat</label>
                   <textarea rows={2} className="w-full bg-neutral-105 border border-neutral-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="Sebutkan deskripsi singkat album ini..." value={albumForm.description} onChange={(e) => setAlbumForm({...albumForm, description: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">URL Gambar Cover (Opsional)</label>
                   <input type="text" className="w-full bg-neutral-105 border border-neutral-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="https://images.unsplash.com/..." value={albumForm.coverUrl} onChange={(e) => setAlbumForm({...albumForm, coverUrl: e.target.value})} />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsAlbumModalOpen(false)} className="w-1/2 border border-neutral-200 py-3.5 rounded-xl font-bold hover:bg-neutral-50 text-xs uppercase tracking-wider cursor-pointer">
                     Batal
                  </button>
                  <button type="submit" className="w-1/2 bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 shadow-md text-xs uppercase tracking-wider cursor-pointer">
                     Buat Album
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD PHOTO MODAL */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 relative my-4 md:my-10">
             <button onClick={() => setIsPhotoModalOpen(false)} className="absolute top-8 right-8 p-2 text-neutral-500 cursor-pointer">
                <X size={24} />
             </button>
             <h2 className="text-2xl font-black text-neutral-900 mb-6">Unggah Foto Baru</h2>
             <form onSubmit={handleCreatePhoto} className="space-y-5">
                <div className="space-y-1">
                   <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Nama / Caption Foto</label>
                   <input required type="text" className="w-full bg-neutral-105 border border-neutral-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="Judul or Deskripsi Foto" value={photoForm.title} onChange={(e) => setPhotoForm({...photoForm, title: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">URL Link Gambar</label>
                   <input required type="text" className="w-full bg-neutral-105 border border-neutral-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="https://..." value={photoForm.imageUrl} onChange={(e) => setPhotoForm({...photoForm, imageUrl: e.target.value})} />
                </div>
                
                <div className="space-y-1">
                   <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Pilih Album Ganti/Penempatan</label>
                   <select 
                     className="w-full bg-neutral-105 border border-neutral-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-emerald-500 text-sm appearance-none font-bold"
                     value={photoForm.albumId}
                     onChange={(e) => setPhotoForm({...photoForm, albumId: e.target.value})}
                   >
                     <option value="umum">Umum (Tanpa Album)</option>
                     {albums.map(a => (
                       <option key={a.id} value={a.id}>{a.name} ({a.source === 'facebook' ? 'FB' : 'Local'})</option>
                     ))}
                   </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsPhotoModalOpen(false)} className="w-1/2 border border-neutral-200 py-3.5 rounded-xl font-bold hover:bg-neutral-50 text-xs uppercase tracking-wider cursor-pointer">
                     Batal
                  </button>
                  <button type="submit" className="w-1/2 bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 shadow-md text-xs uppercase tracking-wider cursor-pointer">
                     Unggah Foto
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
