import { useState, useEffect } from 'react';
import { Award, Target, Eye, Users } from 'lucide-react';
import { collection, onSnapshot, orderBy, query, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Profile() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [vision, setVision] = useState('Terwujudnya lembaga pendidikan yang unggul dalam prestasi, luhur dalam budi pekerti, dan teguh dalam iman dan taqwa berhaluan Ahlussunnah Wal Jama\'ah.');
  const [mission, setMission] = useState<string[]>([
    "Menyelenggarakan pendidikan yang berkualitas dan terjangkau bagi masyarakat.",
    "Menumbuhkembangkan semangat keunggulan secara intensif kepada seluruh warga sekolah.",
    "Membentuk karakter siswa yang disiplin, jujur, dan bertanggung jawab.",
    "Menerapkan nilai-nilai keislaman ala Ahlussunnah Wal Jama'ah An-Nahdliyah dalam kehidupan sehari-hari."
  ]);
  const [tagline, setTagline] = useState('"Mencetak generasi cerdas, berprestasi, dan berakhlak mulia berlandaskan nilai-nilai Ahlussunnah Wal Jama\'ah."');
  const [historyTitle, setHistoryTitle] = useState('Sejarah Singkat');
  const [historyContent, setHistoryContent] = useState('SMP Maarif NU Pandaan didirikan sebagai bentuk pengabdian kepada masyarakat untuk menyediakan pendidikan menengah terpadu antara kurikulum nasional dan nilai-nilai agama.\n\nSejak berdiri, kami terus berkomitmen meningkatkan kualitas fasilitas, tenaga pendidik, dan sistem pembelajaran guna menghadapi tantangan zaman tanpa meninggalkan akar tradisi keislaman Nusantara.');
  const [historyImageUrl, setHistoryImageUrl] = useState('https://images.unsplash.com/photo-1541339907198-e08759dfc02c?q=80&w=2070&auto=format&fit=crop');

  useEffect(() => {
    // Fetch Teachers
    const q = query(collection(db, 'teachers'), orderBy('order', 'asc'));
    const unsubTeachers = onSnapshot(q, (snapshot) => {
      setTeachers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Config
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'config', 'school_profile');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.vision) setVision(data.vision);
          if (data.mission && data.mission.length > 0) setMission(data.mission);
          if (data.tagline) setTagline(data.tagline);
          if (data.historyTitle) setHistoryTitle(data.historyTitle);
          if (data.historyContent) setHistoryContent(data.historyContent);
          if (data.historyImageUrl) setHistoryImageUrl(data.historyImageUrl);
        }
      } catch (error) {
        console.error("Error fetching vision/mission:", error);
      }
    };

    fetchConfig();

    return () => unsubTeachers();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-slate-200 py-16">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded tracking-widest mb-4 inline-block">Tentang Kami</span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 leading-tight">Profil Sekolah</h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-2xl mx-auto italic">
            {tagline}
          </p>
        </div>
      </section>

      <main className="container mx-auto px-6 py-12 space-y-20">
        {/* Visi Misi */}
        <div className="grid md:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-6">
            <h2 className="section-title">Visi</h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              {vision}
            </p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-6">
            <h2 className="section-title">Misi</h2>
            <ul className="space-y-4 text-slate-600 font-medium">
              {mission.map((item, idx) => (
                <li key={idx} className="flex gap-4">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">{idx + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* History */}
        <section className="bg-emerald-800 rounded-[3rem] p-12 md:p-16 text-white max-w-6xl mx-auto relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-700 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl opacity-50" />
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black mb-6">{historyTitle}</h2>
              <div className="space-y-4 text-emerald-50/80 leading-relaxed font-medium whitespace-pre-line">
                {historyContent}
              </div>
            </div>
            <div className="aspect-video bg-white/10 rounded-2xl overflow-hidden border border-white/20 backdrop-blur-sm shadow-xl">
              <img 
                src={historyImageUrl} 
                alt={historyTitle} 
                className="w-full h-full object-cover grayscale opacity-80 hover:opacity-100 transition-opacity duration-700"
              />
            </div>
          </div>
        </section>

        {/* Teachers */}
        <div className="max-w-6xl mx-auto">
          <div className="section-header text-center mb-12">
            <h2 className="section-title mx-auto text-center justify-center">Tenaga Pendidik</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="card-polish text-center group">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-50 p-1 overflow-hidden shadow-inner group-hover:border-emerald-500 transition-all duration-300">
                  <img src={teacher.photoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"} alt={teacher.name} className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all" />
                </div>
                <h3 className="text-sm font-black text-slate-800 leading-tight">{teacher.name}</h3>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">{teacher.role}</p>
                <p className="text-[10px] text-slate-400 mt-2 italic font-medium line-clamp-2">"{teacher.bio || "Pendidik Berdedikasi"}"</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
