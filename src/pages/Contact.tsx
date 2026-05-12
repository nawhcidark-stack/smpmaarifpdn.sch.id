import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'messages'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-slate-200 py-16">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded tracking-widest mb-4 inline-block shadow-sm">Pusat Layanan</span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 leading-tight">Hubungi Kami</h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-2xl mx-auto italic">
            "Kami siap membantu memberikan informasi yang Bapak/Ibu butuhkan terkait SMP Maarif NU Pandaan."
          </p>
        </div>
      </section>

      <section className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
          {/* Info Cards (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-start gap-4 hover:border-emerald-200 transition-colors">
              <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-700">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-1">Alamat Kampus</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">Jl. Raya Pandaan No. 123, Pandaan, Pasuruan, Jawa Timur</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-start gap-4 hover:border-emerald-200 transition-colors">
              <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-700">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-1">Telepon & WA</h3>
                <p className="text-slate-500 text-sm font-medium">(0343) 123456</p>
                <p className="text-emerald-700 text-sm font-bold mt-1 tracking-tight">+62 812-3456-789</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-start gap-4 hover:border-emerald-200 transition-colors">
              <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-700">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-1">Email Resmi</h3>
                <p className="text-slate-500 text-sm font-medium break-all underline decoration-slate-200">info@smpmaarifnupandaan.sch.id</p>
              </div>
            </div>
            
            <div className="bg-emerald-800 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-700 rounded-full translate-x-12 -translate-y-12 blur-2xl opacity-50" />
               <div className="relative z-10 flex flex-col gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                    <MessageSquare size={24} />
                  </div>
                  <h3 className="text-xl font-black">Layanan Konsultasi</h3>
                  <p className="text-sm text-emerald-50/70 font-medium leading-relaxed">
                    Khusus bagi Bapak/Ibu Wali Murid, layanan konsultasi perkembangan siswa tersedia setiap hari kerja pada pukul 08:00 - 14:00 WIB.
                  </p>
               </div>
            </div>
          </div>

          {/* Form (8 columns) */}
          <div className="lg:col-span-8">
            <div className="bg-white p-10 lg:p-14 rounded-[3rem] shadow-sm border border-slate-100 h-full">
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20 flex flex-col items-center gap-6"
                >
                  <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
                    <CheckCircle2 size={48} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-800">Pesan Terkirim</h2>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto">Kami mengapresiasi pesan Anda. Tim administrasi akan segera melakukan peninjauan dan merespon dalam waktu dekat.</p>
                  </div>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="bg-slate-800 text-white px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all shadow-lg active:scale-95 mt-4"
                  >
                    Kirim Pesan Lain
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
                      <input 
                        required
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-800"
                        placeholder="Contoh: Ahmad Fauzan"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Alamat Email</label>
                      <input 
                        required
                        type="email"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-800"
                        placeholder="email@sekolah.sch.id"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Subjek Keperluan</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-800 appearance-none"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      >
                        <option value="">Pilih Subjek Pesan</option>
                        <option value="PPDB">Pendaftaran Siswa Baru (PPDB)</option>
                        <option value="Akademik">Informasi Akademik & Kurikulum</option>
                        <option value="Administrasi">Administrasi & Keuangan</option>
                        <option value="Saran">Saran, Kritik & Aspirasi</option>
                        <option value="Lainnya">Keperluan Lainnya</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Detail Pesan</label>
                    <textarea 
                      required
                      rows={6}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-800 resize-none"
                      placeholder="Tuliskan pesan Anda secara lengkap dan jelas..."
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    ></textarea>
                  </div>

                  <div className="pt-2">
                    <button 
                      disabled={isSubmitting}
                      className="group relative inline-flex items-center gap-3 bg-emerald-700 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/10 disabled:bg-slate-300 disabled:shadow-none active:scale-95 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <span className="relative z-10">{isSubmitting ? "Sedang Mengirim..." : "Kirim Sekarang"}</span>
                      <Send size={16} className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps Section */}
      <section className="container mx-auto px-6 pb-24">
        <div className="h-[400px] bg-slate-200 rounded-[3rem] overflow-hidden border border-slate-100 shadow-inner group relative">
           <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15814.779262174668!2d112.68412854911765!3d-7.662243765103738!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7d965dd943a5d%3A0x6339a489708770c0!2sPandaan%2C%20Pasuruan%20Regency%2C%20East%20Java!5e0!3m2!1sen!2sid!4v1715509063717!5m2!1sen!2sid" 
              className="absolute inset-0 w-full h-full border-0 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            <div className="absolute bottom-10 left-10 bg-white/90 backdrop-blur-md px-8 py-4 rounded-2xl text-slate-800 font-black text-xs uppercase tracking-widest shadow-2xl border border-white pointer-events-none group-hover:bg-emerald-700 group-hover:text-white transition-all">
              Kunjungi Kampus Kami
            </div>
        </div>
      </section>
    </div>
  );
}
