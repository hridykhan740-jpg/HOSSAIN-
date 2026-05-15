/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './lib/firebase';

import LandingPage from './pages/LandingPage';
import AccessPage from './pages/AccessPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import GalleryFeedPage from './pages/GalleryFeedPage';
import PortfolioPage from './pages/PortfolioPage';
import BackToTop from './components/BackToTop';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const seedGallery = async () => {
      const seeded = localStorage.getItem('gallery_seeded_v3');
      if (!seeded) {
        const images = [
          "https://files.catbox.moe/tb2fj6.jpeg",
          "https://files.catbox.moe/ksprmk.jpeg",
          "https://files.catbox.moe/yd7nyj.jpg",
          "https://files.catbox.moe/knwywh.jpeg"
        ];
        for (const url of images) {
          try {
            await addDoc(collection(db, 'gallery'), {
              type: 'image',
              url: url,
              caption: '',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              likes: [],
              comments: []
            });
          } catch (e) {
            console.error(e);
          }
        }
        localStorage.setItem('gallery_seeded_v3', 'true');
      }
    };
    seedGallery();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email?.toLowerCase().trim() === 'hridykhan740@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex bg-slate-950 items-center justify-center min-h-screen text-white">
        <div className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />
      <BackToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/access" element={<AccessPage />} />
        <Route path="/home" element={<HomePage isAdmin={isAdmin} />} />
        <Route path="/admin" element={<AdminPage isAdmin={isAdmin} />} />
        <Route path="/gallery" element={<GalleryFeedPage />} />
        <Route path="/portfolio/:category" element={<PortfolioPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
