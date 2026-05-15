import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Play, X } from 'lucide-react';

export default function GallerySection() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(fetched);
    }, (error) => console.error(error));
    return unsubscribe;
  }, []);

  if (items.length === 0) return null;

  return (
    <section>
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 font-sans tracking-tight">Premium Gallery</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative rounded-2xl overflow-hidden cursor-pointer group break-inside-avoid"
            onClick={() => setSelectedItem(item)}
          >
            {item.type === 'video' ? (
              <div className="relative">
                <img src={item.thumbnailUrl || item.url} alt={item.caption} className="w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Play className="w-12 h-12 text-white opacity-80" />
                </div>
              </div>
            ) : (
              <img src={item.url} alt={item.caption} className="w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              {item.caption && <p className="text-white font-medium text-lg">{item.caption}</p>}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <button className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-8 h-8" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedItem.type === 'video' ? (
                <video src={selectedItem.url} controls autoPlay className="max-w-full max-h-[85vh] rounded-xl shadow-2xl" />
              ) : (
                <img src={selectedItem.url} alt={selectedItem.caption} className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
              )}
              {selectedItem.caption && (
                <p className="mt-4 text-white text-lg bg-black/50 px-6 py-2 rounded-full backdrop-blur-md">{selectedItem.caption}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
