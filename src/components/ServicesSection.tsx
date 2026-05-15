import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Mail, Globe, Code, Smartphone, Image, Star, Briefcase, Megaphone, Laptop, PenTool, Database, Cpu, Layout, Pen, Video, Camera, Wallet, CreditCard, Zap, FileText, CheckCircle, GripHorizontal } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ICONS: Record<string, any> = {
  ShoppingCart, Mail, Globe, Code, Smartphone, Image, Star, Briefcase, Megaphone, Laptop, PenTool, Database, Cpu, Layout, Pen, Video, Camera, Wallet, CreditCard, Zap, FileText, CheckCircle, GripHorizontal
};

const DEFAULT_SERVICES = [
  { id: '1', title: 'E-commerce', description: 'Complete online store solutions', iconName: 'ShoppingCart', category: 'Development' },
  { id: '2', title: 'Gmail Marketing', description: 'Targeted email campaigns', iconName: 'Mail', category: 'Marketing' },
  { id: '3', title: 'Digital Marketing', description: 'Grow your brand presence', iconName: 'Globe', category: 'Marketing' },
  { id: '4', title: 'Web Development', description: 'Modern responsive websites', iconName: 'Code', category: 'Development' },
  { id: '5', title: 'Apps Development', description: 'Native & cross-platform apps', iconName: 'Smartphone', category: 'Apps' },
];

export default function ServicesSection() {
  const [services, setServices] = useState<any[]>(DEFAULT_SERVICES);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [categoryIcons, setCategoryIcons] = useState<Record<string, string>>({});

  useEffect(() => {
    const q = query(collection(db, 'services'), orderBy('createdAt', 'asc'));
    const unsubscribeServices = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServices(fetched);
      }
    }, (error) => {
      console.error(error);
    });

    const unsubscribeIcons = onSnapshot(collection(db, 'category_icons'), (snapshot) => {
      const icons: Record<string, string> = {};
      snapshot.docs.forEach(doc => {
        icons[doc.id] = doc.data().iconName;
      });
      setCategoryIcons(icons);
    }, (error) => console.error(error));

    return () => {
      unsubscribeServices();
      unsubscribeIcons();
    };
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(services.map(s => s.category || 'Other'));
    return ['All', ...Array.from(cats)];
  }, [services]);

  const filteredServices = useMemo(() => {
    if (activeCategory === 'All') return services;
    return services.filter(s => (s.category || 'Other') === activeCategory);
  }, [services, activeCategory]);

  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 font-sans tracking-tight">Our Services</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full" />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {categories.map((cat) => {
          let CatIcon = Briefcase;
          if (cat === 'All') {
            CatIcon = ICONS['GripHorizontal'] || Briefcase;
          } else {
            const iconName = categoryIcons[cat];
            if (iconName && ICONS[iconName]) {
              CatIcon = ICONS[iconName];
            }
          }

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              <CatIcon className="w-4 h-4" />
              {cat}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service, index) => {
          const IconComponent = service.iconName ? (ICONS[service.iconName] || Briefcase) : Briefcase;
          return (
            <motion.div
              layout
              key={service.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="group relative bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-white/5 p-8 rounded-3xl hover:bg-slate-800/50 transition-colors overflow-hidden flex flex-col items-start"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              {service.imageUrl ? (
                <div className="w-full h-40 mb-6 rounded-2xl overflow-hidden shadow-lg border border-white/5">
                  <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shrink-0">
                  <IconComponent className="w-7 h-7 text-indigo-400 group-hover:text-indigo-300" />
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <h3 className="text-xl font-semibold text-white">{service.title}</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5">
                  {service.category || 'Other'}
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          );
        })}
        {filteredServices.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-500">
            No services found in this category.
          </div>
        )}
      </div>
    </section>
  );
}
