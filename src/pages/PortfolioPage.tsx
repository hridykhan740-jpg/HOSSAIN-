import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, ExternalLink, Briefcase } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function PortfolioPage() {
  const { category } = useParams<{ category: string }>();
  const [items, setItems] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    // category could be 'ecommerce', 'website', 'app'
    const q = query(
      collection(db, 'portfolio'), 
      where('category', '==', category),
      // Firebase requires an index if combining where and orderBy, we'll sort client-side for simplicity
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetched.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setItems(fetched);
    });
    return unsubscribe;
  }, [category]);

  const getTitle = () => {
    if (category === 'ecommerce') return 'E-commerce Portfolio';
    if (category === 'website') return 'Website Portfolio';
    if (category === 'app') return 'App Portfolio';
    return 'Portfolio';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-indigo-500/30">
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/home')} className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Back</span>
          </button>
          <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight">{getTitle()}</h1>
          <div className="w-10"></div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden group hover:border-white/20 transition-all shadow-xl"
            >
              <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <Briefcase className="w-12 h-12 text-slate-600" />
                )}
                {item.url && (
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-slate-100 dark:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
                  >
                    <span className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      Visit Site <ExternalLink className="w-4 h-4" />
                    </span>
                  </a>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.description}</p>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium lg:hidden">
                    Visit Link <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        {items.length === 0 && (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-slate-300 mb-2">No items yet</h2>
            <p className="text-slate-500 max-w-md mx-auto">We haven't added any items to this portfolio category yet. Check back soon!</p>
          </div>
        )}
      </main>
    </div>
  );
}
