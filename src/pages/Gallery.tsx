import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Maximize2, Folder, Calendar, ArrowLeft, Image as ImageIcon, Facebook } from 'lucide-react';

interface Album {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  photoCount?: number;
  source?: string;
  createdAt?: any;
}

interface Photo {
  id: string;
  title: string;
  imageUrl: string;
  albumId?: string;
  facebookId?: string;
  source?: string;
  category?: string;
  createdAt?: any;
}

export default function Gallery() {
  const [items, setItems] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'albums' | 'all'>('albums');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listen for photos
    const qPhotos = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubPhotos = onSnapshot(qPhotos, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo)));
      setLoading(false);
    });

    // 2. Listen for albums
    const qAlbums = query(collection(db, 'gallery_albums'), orderBy('createdAt', 'desc'));
    const unsubAlbums = onSnapshot(qAlbums, (snapshot) => {
      setAlbums(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Album)));
    });

    return () => {
      unsubPhotos();
      unsubAlbums();
    };
  }, []);

  const selectedItem = items.find(item => item.id === selectedId);
  const selectedAlbum = albums.find(album => album.id === selectedAlbumId);

  // Filter photos based on selection
  const displayedPhotos = selectedAlbumId 
    ? items.filter(item => item.albumId === selectedAlbumId)
    : items;

  // Format date helper
  const formatDate = (dateObj: any) => {
    if (!dateObj) return '';
    const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <section className="bg-white border-b border-slate-200 py-16">
        <div className="container mx-auto px-6 text-center">
          <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded tracking-widest mb-4 inline-block shadow-sm">Koleksi Visual</span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 leading-tight">Galeri Dokumentasi</h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-2xl mx-auto italic">
            "Dokumentasi resmi seluruh kegiatan, sarana prasarana, serta pencapaian prestasi akademik dan non-akademik."
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-6 mt-10">
        <div className="flex justify-center">
          <div className="bg-white p-2 rounded-full shadow-sm border border-slate-100 flex gap-2">
            <button
              onClick={() => {
                setActiveTab('albums');
                setSelectedAlbumId(null);
              }}
              className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'albums' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Folder size={16} /> Album Foto
            </button>
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedAlbumId(null);
              }}
              className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'all' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ImageIcon size={16} /> Semua Foto ({items.length})
            </button>
          </div>
        </div>
      </div>

      <section className="container mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-3xl h-64 shadow-sm border border-slate-100" />
            ))}
          </div>
        ) : (
          <div>
            {/* 1. ALBUMS TAB TREE */}
            {activeTab === 'albums' && !selectedAlbumId && (
              <div>
                {albums.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {albums.map((album) => (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={album.id}
                        onClick={() => setSelectedAlbumId(album.id)}
                        className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer group border border-slate-200 flex flex-col justify-between"
                      >
                        <div>
                          {/* Album cover */}
                          <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                            {album.coverUrl ? (
                              <img 
                                src={album.coverUrl} 
                                alt={album.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Folder size={64} strokeWidth={1} />
                              </div>
                            )}

                            {/* Facebook badge */}
                            {album.source === 'facebook' && (
                              <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                                <Facebook size={12} fill="white" /> Facebook Page
                              </div>
                            )}

                            {/* Foto count badge */}
                            <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-4 py-1.5 rounded-full">
                              {album.photoCount || 0} Foto
                            </div>
                          </div>

                          <div className="p-6">
                            <h3 className="text-xl font-extrabold text-slate-800 line-clamp-1 mb-2 group-hover:text-emerald-700 transition-colors">
                              {album.name}
                            </h3>
                            {album.description && (
                              <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4 font-medium">
                                {album.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="px-6 pb-6 pt-2 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(album.createdAt)}
                          </span>
                          <span className="text-emerald-600 group-hover:translate-x-1 transition-transform">
                            Buka Album &rarr;
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 space-y-4 bg-white rounded-[3rem] shadow-sm border border-slate-100">
                    <div className="text-slate-200 flex justify-center mb-4">
                      <Folder size={80} strokeWidth={1} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">Belum Ada Album</h3>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto">Pengelola belum mengimpor album galeri dari Facebook sekolah.</p>
                  </div>
                )}
              </div>
            )}

            {/* 2. SPECIFIC ALBUM PHOTOS GRID */}
            {activeTab === 'albums' && selectedAlbumId && selectedAlbum && (
              <div>
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <button
                    onClick={() => setSelectedAlbumId(null)}
                    className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 font-bold transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={20} /> Kembali ke Daftar Album
                  </button>
                  <div className="text-right">
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2 justify-end">
                      {selectedAlbum.name}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium italic">
                      {selectedAlbum.description || `Kumpulan album ${selectedAlbum.name}`}
                    </p>
                  </div>
                </div>

                {displayedPhotos.length > 0 ? (
                  <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {displayedPhotos.map((item) => (
                      <motion.div 
                        layoutId={item.id}
                        key={item.id}
                        className="relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all cursor-pointer group break-inside-avoid border border-slate-100"
                        onClick={() => setSelectedId(item.id)}
                      >
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                           <div className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30 scale-75 group-hover:scale-100 transition-transform">
                              <Maximize2 size={24} />
                           </div>
                        </div>
                        <div className="p-5 bg-white">
                          <p className="text-[9px] text-emerald-700 font-black uppercase tracking-widest mb-1.5">{item.category || 'Aktivitas'}</p>
                          <p className="text-sm font-extrabold text-slate-800 line-clamp-2">{item.title}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100">
                    <ImageIcon className="mx-auto text-slate-200 mb-4" size={72} strokeWidth={1} />
                    <h3 className="text-xl font-bold text-slate-700">Album ini kosong</h3>
                    <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">Belum ada foto yang disinkronkan untuk album ini.</p>
                  </div>
                )}
              </div>
            )}

            {/* 3. FLAT GRID VIEW (Semua Foto) */}
            {activeTab === 'all' && (
              <div>
                {items.length > 0 ? (
                  <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {items.map((item) => (
                      <motion.div 
                        layoutId={item.id}
                        key={item.id}
                        className="relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all cursor-pointer group break-inside-avoid border border-slate-100"
                        onClick={() => setSelectedId(item.id)}
                      >
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                           <div className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30 scale-75 group-hover:scale-100 transition-transform">
                              <Maximize2 size={24} />
                           </div>
                        </div>
                        <div className="p-5 bg-white">
                          <p className="text-[9px] text-emerald-700 font-black uppercase tracking-widest mb-1.5">{item.category || 'Aktivitas'}</p>
                          <p className="text-sm font-extrabold text-slate-800 line-clamp-2">{item.title}</p>
                          <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-40 bg-white rounded-[3rem] shadow-sm border border-slate-100">
                    <div className="text-slate-200 flex justify-center mb-6">
                      <Search size={80} strokeWidth={1} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">Galeri Belum Tersedia</h3>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto">Kami sedang mempersiapkan dokumentasi kegiatan terbaru untuk Anda.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedId && selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm"
            onClick={() => setSelectedId(null)}
          >
            <button 
              className="absolute top-8 right-8 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-[110]"
              onClick={() => setSelectedId(null)}
            >
              <X size={32} />
            </button>
            <motion.div 
              layoutId={selectedId}
              className="max-w-4xl w-full max-h-[90vh] relative p-1 bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="overflow-auto flex-grow flex items-center justify-center bg-slate-100/50 rounded-t-[1.8rem]">
                <img 
                  src={selectedItem.imageUrl} 
                  alt={selectedItem.title} 
                  className="max-w-full max-h-[60vh] object-contain shadow-sm rounded-[1.5rem]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8 text-center bg-white">
                <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded tracking-widest mb-2 inline-block">Detail Foto</span>
                <h3 className="text-2xl font-black text-slate-800 leading-tight">{selectedItem.title}</h3>
                <p className="text-slate-400 text-xs mt-2 font-medium flex items-center gap-1 justify-center">
                  <Calendar size={13} />
                  Diunggah pada {formatDate(selectedItem.createdAt)}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
