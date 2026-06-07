import { useState, useEffect } from 'react';
import { MessageCircle, Send, X, Phone, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [schoolWa, setSchoolWa] = useState('628123456789'); // Fallback number
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Dynamic fetch of general school settings config
    async function fetchSettings() {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.whatsappNumber) {
            // Clean up any spacing or characters in the school whatsapp number
            setSchoolWa(data.whatsappNumber.replace(/[^0-9]/g, ''));
          }
        }
      } catch (err) {
        console.error('Error fetching general settings for WhatsApp Button:', err);
      }
    }
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      alert('Harap isi semua kolom terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Format phone number inputted by user (ensure numbers only, format prefix)
      let formattedUserPhone = phone.replace(/[^0-9]/g, '');
      if (formattedUserPhone.startsWith('0')) {
        formattedUserPhone = '62' + formattedUserPhone.substring(1);
      }

      // Save inquiry to Firestore messages collection so it's logged in the Admin Panel
      await addDoc(collection(db, 'messages'), {
        name: name,
        phone: formattedUserPhone,
        message: message,
        subject: 'Pesan Kilat WhatsApp',
        createdAt: new Date()
      });

      // Compose WhatsApp dynamic text
      const waText = `Halo SMP Maarif NU Pandaan, saya ingin bertanya.\n\n*Nama:* ${name}\n*No. WA:* ${formattedUserPhone}\n*Pesan:* ${message}`;
      
      // Target School WhatsApp formatted number
      let formattedSchoolWa = schoolWa;
      if (formattedSchoolWa.startsWith('0')) {
         formattedSchoolWa = '62' + formattedSchoolWa.substring(1);
      }

      const waUrl = `https://wa.me/${formattedSchoolWa}?text=${encodeURIComponent(waText)}`;
      
      // Open WhatsApp tab
      window.open(waUrl, '_blank');

      // Reset form & close
      setName('');
      setPhone('');
      setMessage('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving WhatsApp widget message:', error);
      alert('Terjadi kesalahan, tetapi Anda tetap akan diarahkan ke WhatsApp.');
      
      let formattedUserPhone = phone.replace(/[^0-9]/g, '');
      const waText = `Halo SMP Maarif NU Pandaan, saya ingin bertanya.\n\n*Nama:* ${name}\n*No. WA:* ${formattedUserPhone}\n*Pesan:* ${message}`;
      const waUrl = `https://wa.me/${schoolWa}?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, '_blank');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* WhatsApp Floating Chat Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[320px] md:w-[350px] bg-white rounded-[2rem] shadow-2xl border border-neutral-100 overflow-hidden mb-4 text-left flex flex-col"
          >
            {/* Header */}
            <div className="bg-emerald-600 text-white p-5 relative">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-emerald-100 hover:text-white hover:bg-emerald-700/50 p-1.5 rounded-full transition-colors"
                title="Tutup"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 border border-emerald-400 flex items-center justify-center text-white text-lg font-black font-mono">
                    SM
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-600 rounded-full animate-pulse"></span>
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Hubungi Kami</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                     <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                     <p className="text-[11px] text-emerald-100 font-medium">SMP Maarif NU Pandaan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                 <div className="relative">
                    <input
                       type="text"
                       required
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       placeholder="Contoh: Budi Santoso"
                       className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-emerald-500 text-sm outline-none transition-all"
                    />
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">No. WhatsApp Anda (Pengirim)</label>
                 <div className="relative">
                    <input
                       type="text"
                       required
                       value={phone}
                       onChange={(e) => setPhone(e.target.value)}
                       placeholder="Contoh: 08123456789"
                       className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-emerald-500 text-sm outline-none transition-all"
                    />
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Ketik Pesan</label>
                 <div className="relative">
                    <textarea
                       required
                       rows={3}
                       value={message}
                       onChange={(e) => setMessage(e.target.value)}
                       placeholder="Tulis pesan Anda..."
                       className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-emerald-500 text-sm outline-none transition-all resize-none"
                    />
                    <MessageSquare size={16} className="absolute left-4 top-4 text-neutral-400" />
                 </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                 <Send size={16} />
                 {isSubmitting ? 'Mengirim...' : 'Kirim via WhatsApp'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button Bubble */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-emerald-500 text-white p-4 rounded-full shadow-lg hover:bg-emerald-600 transition-colors flex items-center justify-center group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Hubungi kami via WhatsApp"
      >
        <MessageCircle size={28} className="fill-white" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 whitespace-nowrap font-bold text-sm">
          Tanya Kami WA
        </span>
      </motion.button>
    </div>
  );
}
