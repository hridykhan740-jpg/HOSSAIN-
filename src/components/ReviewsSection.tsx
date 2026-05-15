import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { Star, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReviewsSection({ isAdmin }: { isAdmin: boolean }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(fetched);
    }, (error) => console.error(error));
    return unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      let screenshotUrl = '';
      if (file) {
        // Upload screenshot
        const storageRef = ref(storage, `reviews/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        screenshotUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, 'reviews'), {
        reviewerName: name,
        reviewerEmail: email || 'anonymous@gmail.com', // fallback
        rating: Number(rating),
        content,
        screenshotUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast.success('Review added successfully!');
      setIsAdding(false);
      setName('');
      setEmail('');
      setRating(5);
      setContent('');
      setFile(null);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to add review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 font-sans tracking-tight">Customer Reviews</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white px-6 py-3 rounded-full font-medium transition-colors border border-emerald-500/30"
        >
          <Plus className="w-5 h-5" />
          Write a Review
        </motion.button>
      </div>

      <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 hide-scrollbar">
        {reviews.length === 0 ? (
          <div className="w-full text-center py-12 text-slate-500">No reviews yet. Be the first!</div>
        ) : (
           reviews.map((review, index) => (
             <motion.div
               key={review.id}
               initial={{ opacity: 0, x: 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ delay: index * 0.1 }}
               className="snap-center shrink-0 w-[400px] bg-slate-900/40 backdrop-blur-md border border-white/10 p-8 rounded-3xl"
             >
               <div className="flex text-yellow-400 mb-4">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-current' : 'text-slate-600'}`} />
                 ))}
               </div>
               <p className="text-slate-300 mb-6 text-lg line-clamp-4">"{review.content}"</p>
               {review.screenshotUrl && (
                 <img src={review.screenshotUrl} alt="Review Screenshot" className="w-full h-32 object-cover rounded-xl mb-6 opacity-80 hover:opacity-100 transition-opacity" />
               )}
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-gradient-to-tr from-slate-700 to-slate-600 rounded-full flex items-center justify-center font-bold text-white shrink-0">
                   {review.reviewerName.charAt(0).toUpperCase()}
                 </div>
                 <div>
                   <h4 className="text-white font-medium">{review.reviewerName}</h4>
                 </div>
               </div>
             </motion.div>
           ))
        )}
      </div>

      {/* Add Review Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-6">Write a Review</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Name</label>
                <input required value={name} onChange={e=>setName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Email (optional)</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="anonymous@gmail.com" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Rating (1-5)</label>
                <input type="number" min="1" max="5" required value={rating} onChange={e=>setRating(Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Review Content</label>
                <textarea required value={content} onChange={e=>setContent(e.target.value)} rows={4} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"></textarea>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Screenshot (optional)</label>
                <input type="file" accept="image/*" onChange={e=>e.target.files && setFile(e.target.files[0])} className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30 transition-colors" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={()=>setIsAdding(false)} className="flex-1 px-4 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center gap-2 transition-colors">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Submit'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </section>
  );
}
