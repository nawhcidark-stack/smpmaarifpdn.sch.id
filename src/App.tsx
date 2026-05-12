import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useState, useEffect, createContext, useContext } from 'react';
import { auth } from './lib/firebase';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

import Home from './pages/Home';
import Profile from './pages/Profile';
import News from './pages/News';
import ArticleDetail from './pages/ArticleDetail';
import Gallery from './pages/Gallery';
import VideoGallery from './pages/VideoGallery';
import Contact from './pages/Contact';
import Achievements from './pages/Achievements';
import Sarpras from './pages/Sarpras';

import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminArticles from './pages/admin/Articles';
import AdminGallery from './pages/admin/Gallery';
import AdminVideos from './pages/admin/Videos';
import AdminSarpras from './pages/admin/Sarpras';
import AdminTeachers from './pages/admin/Teachers';
import AdminMessages from './pages/admin/Messages';
import AdminSlides from './pages/admin/Slides';
import AdminSettings from './pages/admin/Settings';
import AdminAchievements from './pages/admin/Achievements';
import ProtectedRoute from './components/ProtectedRoute';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false });

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      const adminEmails = ['nawhci.dark@gmail.com', 'smpmaarifpandaan@gmail.com'];
      setIsAdmin(!!user?.email && adminEmails.includes(user.email));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      <Router>
        <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900 selection:bg-emerald-100 selection:text-emerald-900">
          <Navbar />
          
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/profil" element={<Profile />} />
              <Route path="/profil/prestasi" element={<Achievements />} />
              <Route path="/profil/sarpras" element={<Sarpras />} />
              <Route path="/berita" element={<News />} />
              <Route path="/berita/:id" element={<ArticleDetail />} />
              <Route path="/galeri" element={<Gallery />} />
              <Route path="/galeri/video" element={<VideoGallery />} />
              <Route path="/kontak" element={<Contact />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/articles" element={<ProtectedRoute><AdminArticles /></ProtectedRoute>} />
              <Route path="/admin/gallery" element={<ProtectedRoute><AdminGallery /></ProtectedRoute>} />
              <Route path="/admin/videos" element={<ProtectedRoute><AdminVideos /></ProtectedRoute>} />
              <Route path="/admin/sarpras" element={<ProtectedRoute><AdminSarpras /></ProtectedRoute>} />
              <Route path="/admin/teachers" element={<ProtectedRoute><AdminTeachers /></ProtectedRoute>} />
              <Route path="/admin/messages" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
              <Route path="/admin/slides" element={<ProtectedRoute><AdminSlides /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
              <Route path="/admin/achievements" element={<ProtectedRoute><AdminAchievements /></ProtectedRoute>} />
            </Routes>
          </main>

          <Footer />
          <WhatsAppButton />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
