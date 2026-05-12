import { useEffect } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { 
  ChevronLeft,
  Trash2,
  Mail,
  User,
  Clock,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderBy, query } from 'firebase/firestore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: any;
}

export default function AdminMessages() {
  const { data: messages, fetchData, remove, loading } = useFirestore<Message>('messages');

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
                              <p className="text-sm text-neutral-500 font-medium">{msg.email}</p>
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
                     </div>
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
