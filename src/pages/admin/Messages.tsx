import { useEffect, useState } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { 
  ChevronLeft,
  Trash2,
  Mail,
  User,
  Clock,
  MessageSquare,
  Send,
  Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderBy, query } from 'firebase/firestore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Message {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
  replyMessage?: string;
  repliedAt?: any;
  createdAt: any;
}

export default function AdminMessages() {
  const { data: messages, fetchData, remove, update, loading } = useFirestore<Message>('messages');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [tempPhone, setTempPhone] = useState('');

  useEffect(() => {
    fetchData(orderBy('createdAt', 'desc'));
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <div className="bg-white border-b border-neutral-200 px-8 py-6">
         <div className="container mx-auto flex items-center gap-4">
            <Link to="/admin" className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
               <ChevronLeft size={24} className="text-neutral-500" />
            </Link>
            <div>
               <h1 className="text-2xl font-bold text-neutral-900">Pesan Masuk</h1>
               <p className="text-neutral-500 text-sm">Aspirasi, pertanyaan, dan saran dari wali murid/masyarakat.</p>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-8 py-10 max-w-5xl">
         {loading ? (
            <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="animate-pulse bg-white rounded-3xl h-32 border border-neutral-200"></div>)}
            </div>
         ) : messages.length > 0 ? (
            <div className="space-y-6">
               {messages.map((msg) => (
                  <div key={msg.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-200 relative group">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                              <User size={24} />
                           </div>
                           <div>
                              <h3 className="font-bold text-neutral-800">{msg.name}</h3>
                              <p className="text-sm text-neutral-500 font-medium">{msg.email || "Tanpa Email"}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="text-right text-xs font-bold text-neutral-400">
                              <div className="flex items-center gap-1 justify-end">
                                 <Clock size={12} /> 
                                 {msg.createdAt ? format(msg.createdAt.toDate(), 'dd MMM yyyy, HH:mm', { locale: id }) : 'Baru saja'}
                              </div>
                           </div>
                           <button 
                             onClick={() => { if(confirm('Hapus pesan ini?')) remove(msg.id) }}
                             className="p-2 text-neutral-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                           >
                             <Trash2 size={20} />
                           </button>
                        </div>
                     </div>
                     <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 space-y-2">
                        <p className="text-emerald-700 font-black text-xs uppercase tracking-widest">{msg.subject || "Pesan Umum"}</p>
                        <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        {msg.phone && (
                           <p className="text-[11px] text-neutral-500 font-medium pt-1 flex items-center gap-1.5">
                              <Phone size={12} className="text-emerald-600" />
                              No. WhatsApp Pengirim: <strong className="text-neutral-700 font-bold">{msg.phone}</strong>
                           </p>
                        )}
                     </div>

                     {/* Saved Reply Section */}
                     {msg.replyMessage && (
                       <div className="mt-4 bg-emerald-50/40 border border-emerald-100/70 rounded-2xl p-5 space-y-3">
                          <div className="flex justify-between items-center border-b border-emerald-100/30 pb-2">
                             <span className="flex items-center gap-2 text-emerald-800 text-[10px] font-black uppercase tracking-widest">
                                <MessageSquare size={13} className="text-emerald-600" />
                                Pesan Balasan
                             </span>
                             {msg.repliedAt && (
                                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 flex items-center">
                                   <Clock size={10} className="mr-1" />
                                   {msg.repliedAt.toDate ? format(msg.repliedAt.toDate(), 'dd MMM yyyy, HH:mm', { locale: id }) : 'Baru saja'}
                                </span>
                             )}
                          </div>
                          <p className="text-sm text-neutral-700 whitespace-pre-wrap italic">
                             "{msg.replyMessage}"
                          </p>
                          <div className="flex justify-end gap-3 pt-1 text-xs font-bold">
                             <button
                                onClick={() => {
                                   setActiveReplyId(msg.id);
                                   setReplyContent(msg.replyMessage || '');
                                   setTempPhone(msg.phone || '');
                                }}
                                className="text-emerald-700 hover:text-emerald-900 transition-colors"
                             >
                                Ubah Balasan
                             </button>
                             <span className="text-neutral-200">|</span>
                             <button
                                onClick={async () => {
                                   if (confirm('Hapus balasan ini dari arsip?')) {
                                      await update(msg.id, {
                                         replyMessage: null,
                                         repliedAt: null
                                      });
                                   }
                                }}
                                className="text-rose-600 hover:text-rose-800 transition-colors"
                             >
                                Hapus Balasan
                             </button>
                          </div>
                       </div>
                     )}

                     {activeReplyId === msg.id ? (
                       <div className="mt-4 bg-neutral-50/70 p-6 rounded-2xl border-2 border-dashed border-emerald-200 space-y-4">
                          <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                             <span className="flex items-center gap-2 text-neutral-800 text-[10px] font-black uppercase tracking-widest">
                                <Send size={13} className="text-emerald-600" />
                                Form Balas Pesan
                             </span>
                          </div>
                          <div className="space-y-4">
                             <div className="space-y-1">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Ketik Balasan Anda</label>
                                <textarea
                                   rows={4}
                                   value={replyContent}
                                   onChange={(e) => setReplyContent(e.target.value)}
                                   placeholder="Tuliskan respon atau balasan resmi di sini..."
                                   className="w-full bg-white border border-neutral-200 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-500 text-sm outline-none transition-all"
                                />
                             </div>

                             <div className="space-y-1">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">No. WhatsApp Penerima</label>
                                <div className="relative">
                                   <input
                                      type="text"
                                      value={tempPhone}
                                      onChange={(e) => setTempPhone(e.target.value)}
                                      placeholder="6281... atau 081..."
                                      className="w-full bg-white border border-neutral-200 rounded-2xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 text-sm outline-none transition-all"
                                   />
                                   <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                </div>
                             </div>

                             <div className="flex flex-wrap gap-2.5 pt-2">
                                <button
                                   onClick={async () => {
                                      if (!replyContent.trim()) {
                                         alert('Isi balasan tidak boleh kosong!');
                                         return;
                                      }
                                      await update(msg.id, {
                                         replyMessage: replyContent,
                                         phone: tempPhone || msg.phone || '',
                                         repliedAt: new Date()
                                      });
                                      setActiveReplyId(null);
                                   }}
                                   className="bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all"
                                >
                                   Simpan Saja
                                </button>

                                {msg.email && (
                                   <a
                                      href={`mailto:${msg.email}?subject=${encodeURIComponent('Balasan: ' + (msg.subject || 'Hubungi Kami'))}&body=${encodeURIComponent(replyContent)}`}
                                      onClick={async () => {
                                         await update(msg.id, {
                                            replyMessage: replyContent,
                                            phone: tempPhone || msg.phone || '',
                                            repliedAt: new Date()
                                         });
                                         setActiveReplyId(null);
                                      }}
                                       className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all flex items-center gap-1.5"
                                   >
                                      Balas via Email
                                   </a>
                                )}

                                <button
                                   onClick={async () => {
                                      if (!replyContent.trim()) {
                                         alert('Isi balasan tidak boleh kosong!');
                                         return;
                                      }
                                      const targetPhone = tempPhone || msg.phone;
                                      if (!targetPhone) {
                                         alert('Harap isi nomor WhatsApp penerima terlebih dahulu!');
                                         return;
                                      }
                                      
                                      // Format phone to WhatsApp-compatible format (numbers only, no leading 0)
                                      let formatted = targetPhone.replace(/[^0-9]/g, '');
                                      if (formatted.startsWith('0')) {
                                         formatted = '62' + formatted.substring(1);
                                      }
                                      
                                      await update(msg.id, {
                                         replyMessage: replyContent,
                                         phone: formatted,
                                         repliedAt: new Date()
                                      });

                                      const waUrl = `https://wa.me/${formatted}?text=${encodeURIComponent(replyContent)}`;
                                      window.open(waUrl, '_blank');
                                      setActiveReplyId(null);
                                   }}
                                   className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all flex items-center gap-1.5"
                                >
                                   Balas via WA
                                </button>

                                <button
                                   onClick={() => setActiveReplyId(null)}
                                   className="bg-neutral-200 hover:bg-neutral-300 text-neutral-600 text-xs font-bold px-5 py-3 rounded-xl transition-all"
                                >
                                   Batal
                                </button>
                             </div>
                          </div>
                       </div>
                     ) : (
                       !msg.replyMessage && (
                          <div className="mt-4 flex justify-end">
                             <button
                                onClick={() => {
                                   setActiveReplyId(msg.id);
                                   setReplyContent(msg.replyMessage || '');
                                   setTempPhone(msg.phone || '');
                                }}
                                className="flex items-center gap-2 text-xs font-black uppercase tracking-wider bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-5.5 py-3 rounded-2xl border border-emerald-100 transition-all shadow-sm"
                             >
                                <MessageSquare size={14} /> Balas
                             </button>
                          </div>
                       )
                     )}
                  </div>
               ))}
            </div>
         ) : (
            <div className="text-center py-40">
               <div className="text-neutral-200 flex justify-center mb-6">
                  <Mail size={80} strokeWidth={1} />
               </div>
               <h3 className="text-2xl font-bold text-neutral-800">Kotak Masuk Kosong</h3>
               <p className="text-neutral-500 italic">Belum ada pesan yang masuk melalui website.</p>
            </div>
         )}
      </div>
    </div>
  );
}
