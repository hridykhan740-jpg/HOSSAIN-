import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Heart, MessageCircle, Send, ArrowLeft, Play, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function GalleryFeedPage({ isAdmin }: { isAdmin?: boolean }) {
  const [items, setItems] = useState<any[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const handleLike = async (item: any) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('You must be signed in to like items.');
      return;
    }
    
    const itemRef = doc(db, 'gallery', item.id);
    const hasLiked = item.likes?.includes(user.email);
    
    try {
      if (hasLiked) {
        await updateDoc(itemRef, { likes: arrayRemove(user.email) });
      } else {
        await updateDoc(itemRef, { likes: arrayUnion(user.email) });
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to update like');
    }
  };

  const handleComment = async (e: React.FormEvent, item: any) => {
    e.preventDefault();
    const text = commentInputs[item.id] || '';
    if (!text.trim()) return;
    
    const user = auth.currentUser;
    if (!user) {
      toast.error('You must be signed in to comment.');
      return;
    }
    
    const itemRef = doc(db, 'gallery', item.id);
    const newComment = {
      id: Date.now().toString(),
      email: user.email,
      name: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL || '',
      text: text.trim(),
      createdAt: Date.now()
    };
    
    try {
      await updateDoc(itemRef, { comments: arrayUnion(newComment) });
      setCommentInputs(prev => ({ ...prev, [item.id]: '' }));
    } catch (e) {
      console.error(e);
      toast.error('Failed to post comment');
    }
  };

  const setCommentInput = (id: string, value: string) => {
    setCommentInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteDoc(doc(db, 'gallery', id));
      toast.success('Item deleted');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete item');
    }
  };

  const filteredItems = filterType === 'all' ? items : items.filter(i => i.type === filterType);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-indigo-500/30">
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/home')} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-sans">Gallery Feed</h1>
          <div className="w-10"></div>
        </div>
      </header>
      
      <main className="max-w-xl mx-auto py-8 px-4 space-y-8 pb-20">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          {['all', 'image', 'video'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as 'all' | 'image' | 'video')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-colors ${filterType === type ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-black/5 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-black/10 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {filteredItems.map(item => (
          <motion.article 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-xl"
          >
            {/* Header / Caption if any */}
            {(item.caption || isAdmin) && (
              <div className="p-4 border-b border-white/5 flex justify-between items-start">
                {item.caption ? (
                  <p className="text-slate-200">{item.caption}</p>
                ) : (
                  <div></div>
                )}
                {isAdmin && (
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-full transition-colors flex-shrink-0"
                    title="Delete item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            
            {/* Media content */}
            <div className="relative bg-black flex items-center justify-center max-h-[600px] overflow-hidden">
              {item.type === 'video' ? (
                <video src={item.url} controls muted playsInline className="w-full object-contain" />
              ) : (
                <img src={item.url} alt={item.caption || 'Gallery Image'} className="w-full object-contain" />
              )}
            </div>
            
            {/* Action Bar */}
            <div className="p-4 border-t border-white/5">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => handleLike(item)}
                    className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-white transition-colors group"
                  >
                    <Heart className={`w-6 h-6 transition-transform group-active:scale-90 ${item.likes?.includes(auth.currentUser?.email) ? 'fill-pink-500 text-pink-500' : ''}`} />
                    <span className="font-medium">{item.likes?.length || 0}</span>
                  </button>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MessageCircle className="w-6 h-6" />
                    <span className="font-medium">{item.comments?.length || 0}</span>
                  </div>
                </div>

                {/* Comments List */}
                {item.comments && item.comments.length > 0 && (
                  <div className="space-y-3 mt-2">
                    {item.comments.map((comment: any) => (
                      <div key={comment.id} className="text-sm">
                        <span className="font-semibold mr-2">{comment.name}</span>
                        <span className="text-slate-300">{comment.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input */}
                <form onSubmit={(e) => handleComment(e, item)} className="flex items-center gap-2 mt-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={commentInputs[item.id] || ''}
                      onChange={(e) => setCommentInput(item.id, e.target.value)}
                      placeholder={auth.currentUser ? "Add a comment..." : "Sign in to comment"}
                      disabled={!auth.currentUser}
                      className="w-full bg-slate-800 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all pr-12 disabled:opacity-50"
                    />
                    <button 
                      type="submit"
                      disabled={!commentInputs[item.id]?.trim() || !auth.currentUser}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-indigo-400 hover:text-indigo-300 hover:bg-slate-700 rounded-full disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.article>
        ))}
        {filteredItems.length === 0 && (
          <div className="text-center text-slate-500 py-10">
            No posts yet.
          </div>
        )}
      </main>
    </div>
  );
}
