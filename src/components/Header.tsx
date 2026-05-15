import { motion } from 'motion/react';
import { Phone, Mail, Facebook, MessageCircle, MessageSquare, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({ isAdmin }: { isAdmin: boolean }) {
  const navigate = useNavigate();

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          {/* Profile Picture */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-1 shrink-0 shadow-xl"
          >
            <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden border-4 border-slate-900 object-cover flex items-center justify-center text-5xl">
              👨‍💻
            </div>
          </motion.div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
              Àbdüllāh Aĺ Hỗŝŝâîň
            </h1>
            <p className="text-indigo-400 font-medium text-lg mb-6 flex items-center justify-center md:justify-start gap-4 flex-wrap">
              <span className="flex items-center gap-2"><Phone className="w-4 h-4"/> +8801876357998</span>
              <span className="flex items-center gap-2"><Mail className="w-4 h-4"/> hridykhan740@gmail.com</span>
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <a href="https://www.facebook.com/share/1ajkJGj7de/" target="_blank" rel="noopener noreferrer">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white rounded-full transition-colors border border-[#1877F2]/20">
                  <Facebook className="w-5 h-5" /> Facebook
                </motion.button>
              </a>
              <a href="https://wa.me/8801876357998" target="_blank" rel="noopener noreferrer">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-full transition-colors border border-[#25D366]/20">
                  <MessageCircle className="w-5 h-5" /> WhatsApp
                </motion.button>
              </a>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white hover:bg-slate-700 rounded-full transition-colors border border-white/5">
                <MessageSquare className="w-5 h-5" /> Chat
              </motion.button>
            </div>
          </div>
          
          {isAdmin && (
            <motion.button 
              onClick={() => navigate('/admin')}
              whileHover={{ scale: 1.05 }}
              className="absolute top-4 right-4 md:static md:top-auto md:right-auto px-4 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="hidden md:inline">Admin Panel</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
