import { motion } from 'motion/react';
import { ShoppingCart, Mail, Globe, Code, Smartphone, Image, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ICONS: Record<string, any> = {
  'ShoppingCart': ShoppingCart,
  'Mail': Mail,
  'Globe': Globe,
  'Code': Code,
  'Smartphone': Smartphone,
  'Image': Image,
  'Star': Star,
};

const DEFAULT_SERVICES = [
  { id: '1', title: 'E-commerce', description: 'Complete online store solutions', iconName: 'ShoppingCart' },
  { id: '2', title: 'Gmail Marketing', description: 'Targeted email campaigns', iconName: 'Mail' },
  { id: '3', title: 'Digital Marketing', description: 'Grow your brand presence', iconName: 'Globe' },
  { id: '4', title: 'Web Development', description: 'Modern responsive websites', iconName: 'Code' },
  { id: '5', title: 'Apps Development', description: 'Native & cross-platform apps', iconName: 'Smartphone' },
  { id: '6', title: 'Gallery', description: 'Showcase of premium work', iconName: 'Image' },
  { id: '7', title: 'Customer Reviews', description: 'Hear from our happy clients', iconName: 'Star' },
];

export default function ServicesSection() {
  const [services, setServices] = useState<any[]>(DEFAULT_SERVICES);

  useEffect(() => {
    const q = query(collection(db, 'services'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServices(fetched);
      }
    }, (error) => {
      console.error(error);
    });
    return unsubscribe;
  }, []);

  return (
    <section>
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 font-sans tracking-tight">Our Services</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => {
          const IconComponent = ICONS[service.iconName] || Code;
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative bg-slate-900/50 backdrop-blur-sm border border-white/5 p-8 rounded-3xl hover:bg-slate-800/50 transition-colors overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <IconComponent className="w-7 h-7 text-indigo-400 group-hover:text-indigo-300" />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-3">{service.title}</h3>
              <p className="text-slate-400 text-base leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
