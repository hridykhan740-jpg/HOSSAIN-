/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';

import LandingPage from './pages/LandingPage';
import AccessPage from './pages/AccessPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/access" element={<AccessPage />} />
        <Route path="/home" element={<HomePage isAdmin={isAdmin} />} />
        <Route path="/admin" element={<AdminPage isAdmin={isAdmin} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
