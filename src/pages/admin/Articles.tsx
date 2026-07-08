import { useState, useEffect } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { useAuth } from '../../App';
import { 
  Newspaper, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  X, 
  Image as ImageIcon,
  ChevronLeft,
  LayoutGrid,
  List as ListIcon,
  Paperclip,
  Upload,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { orderBy, query } from 'firebase/firestore';
import RichTextEditor from '../../components/RichTextEditor';

interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  category: string;
  pdfUrl?: string;
  pdfName?: string;
  createdAt: any;
}

export default function AdminArticles() {
  const { user } = useAuth();
  const { data: articles, fetchData, add, update, remove, loading } = useFirestore<Article>('articles');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    category: 'berita',
    pdfUrl: '',
    pdfName: '',
  });

  const [pdfSourceType, setPdfSourceType] = useState<'file' | 'url'>('file');
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfUploadError, setPdfUploadError] = useState('');

  const [imageSourceType, setImageSourceType] = useState<'file' | 'url'>('file');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');

  useEffect(() => {
    fetchData(orderBy('createdAt', 'desc'));
  }, []);

  const resetForm = () => {
    setFormData({ title: '', content: '', imageUrl: '', category: 'berita', pdfUrl: '', pdfName: '' });
    setPdfUploadError('');
    setImageUploadError('');
    setEditingArticle(null);
  };

  const handleOpenModal = (article?: Article) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        content: article.content,
        imageUrl: article.imageUrl,
        category: article.category,
        pdfUrl: article.pdfUrl || '',
        pdfName: article.pdfName || '',
      });
      setPdfSourceType(article.pdfUrl?.startsWith('data:') ? 'file' : 'url');
      setImageSourceType(article.imageUrl?.startsWith('data:') ? 'file' : 'url');
    } else {
      resetForm();
      setPdfSourceType('file');
      setImageSourceType('file');
    }
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageUploadError('Hanya file gambar yang diperbolehkan.');
      return;
    }

    if (file.size > 800 * 1024) { // 800KB safe limit for Firestore 1MB doc size limit
      setImageUploadError('Ukuran gambar terlalu besar. Maksimal 800KB.');
      return;
    }

    setIsUploadingImage(true);
    setImageUploadError('');

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({
        ...prev,
        imageUrl: base64String
      }));
      setIsUploadingImage(false);
    };
    reader.onerror = () => {
      setImageUploadError('Gagal membaca file gambar.');
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setPdfUploadError('Hanya file PDF yang diperbolehkan.');
      return;
    }

    if (file.size > 800 * 1024) { // 800KB safe limit for Firestore 1MB doc size limit
      setPdfUploadError('Ukuran file PDF terlalu besar. Maksimal 800KB.');
      return;
    }

    setIsUploadingPdf(true);
    setPdfUploadError('');

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({
        ...prev,
        pdfUrl: base64String,
        pdfName: file.name
      }));
      setIsUploadingPdf(false);
    };
    reader.onerror = () => {
      setPdfUploadError('Gagal membaca file PDF.');
      setIsUploadingPdf(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingArticle) {
      await update(editingArticle.id, { ...formData });
    } else {
      await add({ ...formData, authorId: user?.uid });
    }
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-neutral-200 px-8 py-6">
         <div className="container mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <Link to="/admin" className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                  <ChevronLeft size={24} className="text-neutral-500" />
               </Link>
               <div>
                  <h1 className="text-2xl font-bold text-neutral-900">Kelola Berita</h1>
                  <p className="text-neutral-500 text-sm">Update informasi dan pengumuman sekolah.</p>
               </div>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
            >
              <Plus size={20} /> Posting Berita
            </button>
         </div>
      </div>

      <div className="container mx-auto px-8 py-10">
         {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1,2,3].map(i => <div key={i} className="animate-pulse bg-white rounded-3xl h-64 border border-neutral-200"></div>)}
            </div>
         ) : articles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {articles.map((article) => (
                  <div key={article.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-neutral-200 group flex flex-col">
                     <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={article.imageUrl || "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=2072&auto=format&fit=crop"} 
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                        />
                        <div className="absolute top-4 left-4">
                           <span className="bg-white/90 backdrop-blur-md text-emerald-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                              {article.category}
                           </span>
                        </div>
                     </div>
                     <div className="p-6 flex-grow space-y-4">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                           {article.createdAt ? format(article.createdAt.toDate(), 'dd MMM yyyy', { locale: id }) : 'Loading...'}
                        </p>
                        <h3 className="font-bold text-lg text-neutral-800 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors">
                           {article.title}
                        </h3>
                     </div>
                     <div className="p-4 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                        <div className="flex gap-2">
                           <button onClick={() => handleOpenModal(article)} className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit">
                              <Edit size={18} />
                           </button>
                           <button onClick={() => { if(confirm('Hapus berita ini?')) remove(article.id) }} className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Hapus">
                              <Trash2 size={18} />
                           </button>
                        </div>
                        <Link to={`/berita/${article.id}`} target="_blank" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                          Pratinjau <Plus size={12} className="rotate-45" />
                        </Link>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="text-center py-40 space-y-4">
               <div className="text-neutral-200 flex justify-center mb-6">
                  <Newspaper size={80} strokeWidth={1} />
               </div>
               <h3 className="text-2xl font-bold text-neutral-800">Belum ada berita</h3>
               <p className="text-neutral-500">Mulai posting berita pertama sekolah Anda sekarang.</p>
            </div>
         )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-8 md:p-12 relative my-4 md:my-10">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 hover:bg-neutral-100 rounded-full text-neutral-500">
                <X size={24} />
             </button>
             
             <h2 className="text-3xl font-black text-neutral-900 uppercase tracking-tighter mb-8">
                {editingArticle ? 'Edit Posting' : 'Buat Posting Baru'}
             </h2>

             <form onSubmit={handleSubmit} className="space-y-6">
                {/* Metadata Fields Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="md:col-span-2 space-y-2">
                       <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Judul Berita</label>
                      <input 
                        required
                        type="text"
                        placeholder="Judul Berita"
                        className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-neutral-800"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Kategori</label>
                      <select 
                        className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500 transition-all appearance-none font-bold text-neutral-800"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      >
                         <option value="berita">Berita</option>
                         <option value="pengumuman">Pengumuman</option>
                         <option value="informasi">Informasi</option>
                      </select>
                   </div>
                   
                </div>

                 {/* Cover Image Section */}
                 <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-800">
                       <ImageIcon size={18} className="text-emerald-600" />
                       <h3 className="text-sm font-black uppercase tracking-wider">Gambar Sampul Berita</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {/* Mode Switcher */}
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-neutral-500 block">Pilih Cara Input Gambar</label>
                          <div className="flex gap-2 p-1 bg-neutral-200/50 rounded-xl w-full">
                             <button
                               type="button"
                               onClick={() => setImageSourceType('file')}
                               className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                 imageSourceType === 'file'
                                   ? 'bg-white text-slate-800 shadow-sm'
                                   : 'text-neutral-500 hover:text-slate-700'
                               }`}
                             >
                                Unggah Gambar
                             </button>
                             <button
                               type="button"
                               onClick={() => setImageSourceType('url')}
                               className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                 imageSourceType === 'url'
                                   ? 'bg-white text-slate-800 shadow-sm'
                                   : 'text-neutral-500 hover:text-slate-700'
                               }`}
                             >
                                Tautkan URL Gambar
                             </button>
                          </div>
                       </div>
 
                       {/* Interactive Field based on selected Mode */}
                       <div className="flex flex-col justify-end">
                          {imageSourceType === 'file' ? (
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-500 block">Pilih file gambar Anda (Maks. 800KB)</label>
                                <label className="w-full flex items-center justify-center gap-2 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 px-4 py-3 rounded-xl cursor-pointer text-xs font-bold transition-all shadow-sm">
                                   <Upload size={16} className="text-neutral-500" />
                                   {isUploadingImage ? 'Membaca Gambar...' : 'Pilih File Gambar'}
                                   <input 
                                     type="file" 
                                     accept="image/*" 
                                     onChange={handleImageFileChange} 
                                     className="hidden" 
                                   />
                                </label>
                             </div>
                          ) : (
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-500 block">URL Link Gambar Online</label>
                                <input 
                                  type="url"
                                  placeholder="https://example.com/gambar.jpg"
                                  className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 text-xs text-neutral-800 transition-all font-medium"
                                  value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                                />
                             </div>
                          )}
                       </div>

                       {/* Image Preview */}
                       <div className="flex flex-col justify-center items-center bg-white border border-neutral-200 rounded-2xl p-2 h-24 relative overflow-hidden">
                          {formData.imageUrl ? (
                             <>
                                <img 
                                  src={formData.imageUrl} 
                                  alt="Preview Sampul" 
                                  className="w-full h-full object-cover rounded-xl"
                                  referrerPolicy="no-referrer"
                                />
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                  className="absolute top-1 right-1 bg-black/60 hover:bg-rose-600 text-white p-1 rounded-full transition-colors cursor-pointer"
                                  title="Hapus gambar"
                                >
                                   <X size={12} />
                                </button>
                             </>
                          ) : (
                             <div className="text-center text-neutral-400 space-y-1">
                                <ImageIcon size={20} className="mx-auto" />
                                <p className="text-[10px] font-bold uppercase tracking-wider">No Preview</p>
                             </div>
                          )}
                       </div>
                    </div>
 
                    {imageUploadError && (
                       <div className="bg-rose-50 text-rose-700 p-3 rounded-xl border border-rose-100 text-xs font-bold flex items-center gap-2">
                          <AlertCircle size={14} className="shrink-0" />
                          <span>{imageUploadError}</span>
                       </div>
                    )}
                 </div>

                 {/* WYSIWYG Rich Editor Block */}
                <div className="flex flex-col gap-2">
                   <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Konten Berita</label>
                   <RichTextEditor 
                     value={formData.content} 
                     onChange={(contentHTML) => setFormData(p => ({ ...p, content: contentHTML }))}
                     placeholder="Mulai ketik artikel berita sekolah di sini, atau paste langsung dari sumber berita lain dengan formatting lengkap..."
                   />
                </div>

                {/* PDF Attachment Section */}
                <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 space-y-4">
                   <div className="flex items-center gap-2 text-emerald-800">
                      <Paperclip size={18} className="text-emerald-600" />
                      <h3 className="text-sm font-black uppercase tracking-wider">Lampiran Dokumen PDF (Opsional)</h3>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Mode Switcher */}
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-neutral-500 block">Pilih Cara Lampiran</label>
                         <div className="flex gap-2 p-1 bg-neutral-200/50 rounded-xl w-full">
                            <button
                              type="button"
                              onClick={() => setPdfSourceType('file')}
                              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                pdfSourceType === 'file'
                                  ? 'bg-white text-slate-800 shadow-sm'
                                  : 'text-neutral-500 hover:text-slate-700'
                              }`}
                            >
                               Unggah PDF Lokal
                            </button>
                            <button
                              type="button"
                              onClick={() => setPdfSourceType('url')}
                              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                pdfSourceType === 'url'
                                  ? 'bg-white text-slate-800 shadow-sm'
                                  : 'text-neutral-500 hover:text-slate-700'
                              }`}
                            >
                               Tautkan URL PDF
                            </button>
                         </div>
                      </div>

                      {/* Interactive Field based on selected Mode */}
                      <div className="flex flex-col justify-end">
                         {pdfSourceType === 'file' ? (
                            <div className="space-y-2">
                               <label className="text-xs font-bold text-neutral-500 block">Pilih file PDF Anda (Maks. 800KB)</label>
                               <label className="w-full flex items-center justify-center gap-2 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 px-4 py-3 rounded-xl cursor-pointer text-xs font-bold transition-all shadow-sm">
                                  <Upload size={16} className="text-neutral-500" />
                                  {isUploadingPdf ? 'Membaca File...' : 'Pilih File PDF'}
                                  <input 
                                    type="file" 
                                    accept=".pdf" 
                                    onChange={handlePdfFileChange} 
                                    className="hidden" 
                                  />
                               </label>
                            </div>
                         ) : (
                            <div className="space-y-2">
                               <label className="text-xs font-bold text-neutral-500 block">URL Link PDF Online</label>
                               <input 
                                 type="url"
                                 placeholder="https://example.com/dokumen.pdf"
                                 className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 text-xs text-neutral-800 transition-all font-medium"
                                 value={formData.pdfUrl.startsWith('data:') ? '' : formData.pdfUrl}
                                 onChange={(e) => {
                                   const val = e.target.value;
                                   setFormData(prev => ({
                                     ...prev,
                                     pdfUrl: val,
                                     pdfName: val ? val.substring(val.lastIndexOf('/') + 1) || 'Dokumen_Lampiran.pdf' : ''
                                   }));
                                 }}
                               />
                            </div>
                         )}
                      </div>
                   </div>

                   {pdfUploadError && (
                      <div className="bg-rose-50 text-rose-700 p-3 rounded-xl border border-rose-100 text-xs font-bold flex items-center gap-2">
                         <AlertCircle size={14} className="shrink-0" />
                         <span>{pdfUploadError}</span>
                      </div>
                   )}

                   {formData.pdfUrl && (
                      <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 flex items-center justify-between gap-3 text-xs font-medium">
                         <div className="flex items-center gap-2.5 min-w-0">
                            <FileText size={18} className="text-emerald-600 shrink-0" />
                            <div className="truncate">
                               <p className="font-extrabold truncate text-emerald-950">{formData.pdfName || 'Dokumen Terlampir.pdf'}</p>
                               <p className="text-[10px] text-emerald-600 font-bold uppercase mt-0.5 font-mono">
                                  {formData.pdfUrl.startsWith('data:') ? 'Lokal (Base64 Encoded)' : 'Tautan Eksternal'}
                                </p>
                            </div>
                         </div>
                         <button
                           type="button"
                           onClick={() => setFormData(prev => ({ ...prev, pdfUrl: '', pdfName: '' }))}
                           className="text-rose-500 hover:text-rose-700 hover:bg-rose-100 p-2 rounded-lg transition-all cursor-pointer"
                           title="Hapus Lampiran"
                         >
                            <Trash2 size={16} />
                         </button>
                      </div>
                   )}
                </div>

                <div className="pt-4 flex justify-end gap-4">
                   <button 
                     type="button"
                     onClick={() => setIsModalOpen(false)}
                     className="px-8 py-3 rounded-full font-bold text-neutral-500 hover:bg-neutral-100 transition-all cursor-pointer"
                   >
                     Batal
                   </button>
                   <button 
                     type="submit"
                     className="bg-emerald-600 text-white px-10 py-3 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95 cursor-pointer"
                   >
                     {editingArticle ? 'Update Berita' : 'Publikasikan'}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
