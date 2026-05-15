import { motion, AnimatePresence } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { Phone, Mail, Facebook, MessageCircle, MessageSquare, Settings, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ThemeToggle from '../components/ThemeToggle';

export default function Header({ isAdmin }: { isAdmin: boolean }) {
  const navigate = useNavigate();
  const [profileUrl, setProfileUrl] = useState('');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false); // Can be used for profile zoom

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'profile', 'admin'), snap => {
      if (snap.exists() && snap.data().photoUrl) {
        setProfileUrl(snap.data().photoUrl);
      }
    }, err => {
      console.error(err);
    });
    return unsub;
  }, []);

  return (
    <>
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12"
      >
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
          
          {/* Cover Photo */}
          <div className="w-full h-48 md:h-64 lg:h-80 relative group">
            <img 
              src="https://files.catbox.moe/jzmb28.jpeg" 
              alt="Cover" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
            {isAdmin && (
              <motion.button 
                onClick={() => navigate('/admin')}
                whileHover={{ scale: 1.05 }}
                className="absolute top-4 right-16 px-4 py-2 bg-black/50 backdrop-blur-sm text-slate-900 dark:text-white border border-slate-200 dark:border-white/20 rounded-xl flex items-center gap-2 hover:bg-black/10 dark:hover:bg-black/70 transition-colors z-20"
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden md:inline">Admin Panel</span>
              </motion.button>
            )}
            <div className="absolute top-4 right-4 z-20">
              <ThemeToggle />
            </div>
          </div>

          <div className="px-6 pb-8 md:px-10 md:pb-10 relative z-10 -mt-20 md:-mt-24">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
              {/* Profile Picture */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsVideoModalOpen(true)}
                className="cursor-pointer w-32 h-32 md:w-40 md:h-40 rounded-full bg-white dark:bg-slate-900 p-1.5 shrink-0 shadow-2xl relative z-20"
              >
                <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-white/10 object-cover flex items-center justify-center text-5xl">
                  {profileUrl || true ? (
                    <img src={profileUrl || "https://files.catbox.moe/cy4kjl.jpeg"} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    '👨‍💻'
                  )}
                </div>
              </motion.div>

              <div className="flex-1 text-center md:text-left mt-2 md:mt-0">
                <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                  Àbdüllāh Aĺ Hỗŝŝâîň
                </h1>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium text-base md:text-lg mb-2 flex items-center justify-center md:justify-start gap-4 flex-wrap">
                  <span className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 text-indigo-700 dark:text-indigo-300"><Phone className="w-4 h-4"/> +8801876357998</span>
                  <span className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 text-indigo-700 dark:text-indigo-300"><Mail className="w-4 h-4"/> mhossenali740@gmail.com</span>
                </p>
                <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base max-w-2xl text-center md:text-left mx-auto md:mx-0 py-2 mb-4 font-medium">
                  Passionate expert in Web & App Development, Digital Marketing, and General Tech Solutions. Dedicated to delivering high-quality and reliable services tailored to your digital growth and business needs.
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <a href="https://www.facebook.com/share/1ajkJGj7de/" target="_blank" rel="noopener noreferrer">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-5 py-2.5 bg-[#1877F2] text-white hover:bg-[#1877F2]/90 rounded-full transition-colors shadow-lg shadow-[#1877F2]/20 font-medium text-sm">
                      <Facebook className="w-4 h-4" /> Facebook
                    </motion.button>
                  </a>
                  <a href="https://wa.me/8801876357998" target="_blank" rel="noopener noreferrer">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white hover:bg-[#25D366]/90 rounded-full transition-colors shadow-lg shadow-[#25D366]/20 font-medium text-sm">
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </motion.button>
                  </a>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-full transition-colors font-medium text-sm">
                    <MessageSquare className="w-4 h-4" /> Chat
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={() => setIsVideoModalOpen(false)}
          >
            <button className="absolute top-4 right-4 md:top-6 md:right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50">
              <X className="w-8 h-8" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[85vh] aspect-square rounded-full overflow-hidden border-4 border-indigo-500/30 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <img src={profileUrl || "https://i.ibb.co/DH1xjsn1/image-4-2.jpg"} alt="Expanded Profile" className="w-full h-full object-cover" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
