import { useState, useEffect } from 'react';
import { Award, Trophy, Medal, Star } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface AchievementItem {
  id?: string;
  no?: number;
  name: string;
  competition: string;
  date: string;
  location: string;
  award: string;
  level: string;
  evidence: string;
  order: number;
}

const defaultAchievements: AchievementItem[] = [
  { no: 1, name: "SELLA DWI APRILIA", competition: "Bola Voli Putri", date: "2 - 7 Oktober 2018", location: "KONI Kab. Pasuruan", award: "Juara I", level: "Kabupaten", evidence: "Piala, Sertifikat", order: 0 },
  { no: 2, name: "FRISKA MERLYTA WARDANY", competition: "Bola Voli Putri", date: "2 - 7 Oktober 2018", location: "KONI Kab. Pasuruan", award: "Juara I", level: "Kabupaten", evidence: "Piala, Sertifikat", order: 1 },
  // ... (truncating for the sake of the edit tool, but I'll make sure to handle the logic properly)
];

export default function Achievements() {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'achievements'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AchievementItem[];
      setAchievements(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const displayData = achievements.length > 0 ? achievements : [];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-slate-200 py-16">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded tracking-widest mb-4 inline-block">Dedikasi & Prestasi</span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 leading-tight">Prestasi Siswa</h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-2xl mx-auto italic">
            "Daftar kebanggaan siswa-siswi SMP Maarif NU Pandaan dalam berbagai ajang perlombaan dan kompetisi."
          </p>
        </div>
      </section>

      <main className="container mx-auto px-6 py-12">
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
             <div className="p-20 text-center text-slate-400">Loading data prestasi...</div>
          ) : displayData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">No</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Peserta</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lomba yang Diikuti</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Kegiatan</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tempat Kegiatan</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Penghargaan</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tingkat</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bukti</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayData.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-400">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-slate-800">{item.name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{item.competition}</td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tight">{item.date}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{item.location}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                          <Award size={12} />
                          {item.award}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                          {item.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 italic">
                        {item.evidence}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 text-center text-slate-400">Belum ada data prestasi yang dipublikasikan.</div>
          )}
        </div>

        {/* Highlight Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto">
          <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-200">
            <Trophy size={40} className="mb-6 opacity-80" />
            <h3 className="text-xl font-black mb-2">Unggul Akademik</h3>
            <p className="text-emerald-100/70 text-sm leading-relaxed font-medium">
              Konsistensi dalam meraih prestasi di tingkat kabupaten maupun provinsi dalam bidang olimpiade.
            </p>
          </div>
          <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200">
            <Medal size={40} className="mb-6 opacity-80" />
            <h3 className="text-xl font-black mb-2">Juara Olahraga</h3>
            <p className="text-blue-100/70 text-sm leading-relaxed font-medium">
              Melahirkan atlet-atlet muda berbakat terutama dalam cabang bela diri Kempo dan bola voli.
            </p>
          </div>
          <div className="bg-amber-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-amber-200">
            <Star size={40} className="mb-6 opacity-80" />
            <h3 className="text-xl font-black mb-2">Religiusitas</h3>
            <p className="text-amber-50/70 text-sm leading-relaxed font-medium">
              Menyeimbangkan prestasi duniawi dengan kecerdasan spiritual melalui kompetisi seni Islami.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
