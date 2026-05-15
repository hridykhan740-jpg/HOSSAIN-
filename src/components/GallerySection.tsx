import { motion, AnimatePresence } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, updateDoc, doc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Play, X, Heart, MessageCircle, Send, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GallerySection({ isAdmin }: { isAdmin?: boolean }) {
  const [items, setItems] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [gridCommentText, setGridCommentText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(fetched);
    }, (error) => console.error(error));
    return unsubscribe;
  }, []);

  const handleLike = async (item: any) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('You must be signed in to like.');
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

  const handleAddComment = async (e: React.FormEvent, item: any) => {
    e.preventDefault();
    if (!commentText.trim()) return;
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
      text: commentText.trim(),
      createdAt: Date.now()
    };
    
    try {
      await updateDoc(itemRef, { comments: arrayUnion(newComment) });
      setCommentText('');
    } catch (e) {
      console.error(e);
      toast.error('Failed to post comment');
    }
  };

  const handleGridAddComment = async (e: React.FormEvent, item: any) => {
    e.preventDefault();
    if (!gridCommentText.trim()) return;
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
      text: gridCommentText.trim(),
      createdAt: Date.now()
    };
    
    try {
      await updateDoc(itemRef, { comments: arrayUnion(newComment) });
      setGridCommentText('');
      setActiveCommentId(null);
    } catch (e) {
      console.error(e);
      toast.error('Failed to post comment');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this specific gallery item?')) return;
    try {
      await deleteDoc(doc(db, 'gallery', id));
      toast.success('Item deleted');
      if (selectedItemId === id) setSelectedItemId(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete item');
    }
  };

  if (items.length === 0) return null;

  const selectedItem = items.find(i => i.id === selectedItemId);
  const filteredItems = filterType === 'all' ? items : items.filter(i => i.type === filterType);

  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 font-sans tracking-tight">Premium Gallery</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full mb-8" />
        
        <div className="flex flex-wrap items-center justify-center gap-2">
          {['all', 'image', 'video'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as 'all' | 'image' | 'video')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-colors ${filterType === type ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-white/5 break-inside-avoid shadow-indigo-500/5 hover:shadow-indigo-500/10 transition-shadow group inline-block w-full"
            >
            <div 
              className="relative overflow-hidden cursor-pointer"
              onClick={() => setSelectedItemId(item.id)}
            >
              {item.type === 'video' ? (
                <div className="relative">
                  <video src={item.url} muted loop playsInline autoPlay className="w-full object-cover transition-transform duration-500 group-hover:scale-105 aspect-video" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                    <Play className="w-12 h-12 text-slate-900 dark:text-white opacity-80" />
                  </div>
                </div>
              ) : (
                <img src={item.url} alt={item.caption} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              )}
              {isAdmin && (
                <button
                  onClick={(e) => handleDelete(e, item.id)}
                  className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white hover:text-red-400 rounded-full backdrop-blur-sm transition-all shadow-xl opacity-0 group-hover:opacity-100 z-10"
                  title="Delete item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="p-4 flex flex-col">
              {item.caption && <p className="text-slate-200 font-medium text-sm mb-4 leading-snug">{item.caption}</p>}
              
              <div className="flex items-center gap-6 mt-1">
                <button 
                  onClick={() => handleLike(item)}
                  className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-white transition-colors group/btn"
                >
                  <Heart className={`w-5 h-5 transition-transform group-active/btn:scale-95 ${item.likes?.includes(auth.currentUser?.email) ? 'fill-pink-500 text-pink-500' : ''}`} />
                  <span className="text-sm font-medium">{item.likes?.length || 0}</span>
                </button>
                <button 
                  onClick={() => {
                    setActiveCommentId(activeCommentId === item.id ? null : item.id);
                    setGridCommentText('');
                  }}
                  className={`flex items-center gap-2 transition-colors ${activeCommentId === item.id ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.comments?.length || 0}</span>
                </button>
              </div>

              <AnimatePresence>
                {activeCommentId === item.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-4"
                  >
                    <form onSubmit={(e) => handleGridAddComment(e, item)} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="text" 
                          value={gridCommentText}
                          onChange={(e) => setGridCommentText(e.target.value)}
                          placeholder={auth.currentUser ? "Write a comment..." : "Sign in to comment"}
                          disabled={!auth.currentUser}
                          className="w-full bg-slate-800 border border-white/5 rounded-full px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all pr-10 disabled:opacity-50"
                          autoFocus
                        />
                        <button 
                          type="submit"
                          disabled={!gridCommentText.trim() || !auth.currentUser}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300 disabled:opacity-50 hover:bg-slate-700 p-1.5 rounded-full transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-0 md:p-4 backdrop-blur-sm"
            onClick={() => setSelectedItemId(null)}
          >
            <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-[60]">
              <X className="w-8 h-8" />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full h-full md:max-w-6xl md:h-[85vh] bg-slate-900 md:rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left side: Media */}
              <div className="w-full md:w-2/3 h-64 md:h-full bg-black flex items-center justify-center relative shadow-inner">
                {selectedItem.type === 'video' ? (
                  <video src={selectedItem.url} controls autoPlay className="h-full w-full object-contain" />
                ) : (
                  <img src={selectedItem.url} alt={selectedItem.caption} className="h-full w-full object-contain" />
                )}
              </div>
              
              {/* Right side: Social Interaction */}
              <div className="flex-1 max-h-full flex flex-col bg-slate-900 border-l border-white/5 overflow-hidden">
                {/* Header / Caption */}
                <div className="p-5 border-b border-white/5 shrink-0 bg-slate-900/50 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                      A
                    </div>
                    <div>
                      <div className="font-semibold text-white">Admin</div>
                      <div className="text-xs text-slate-400">Post</div>
                    </div>
                  </div>
                  {selectedItem.caption && (
                    <p className="text-slate-200 mt-2 text-sm leading-relaxed">{selectedItem.caption}</p>
                  )}
                </div>

                {/* Comments Area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {selectedItem.comments && selectedItem.comments.length > 0 ? (
                    selectedItem.comments.map((comment: any) => (
                      <div key={comment.id} className="flex gap-3 items-start">
                        {comment.photoURL ? (
                          <img src={comment.photoURL} className="w-8 h-8 rounded-full shrink-0" alt="Avatar" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs text-white shrink-0 font-bold uppercase">
                            {comment.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="bg-slate-800/80 rounded-2xl rounded-tl-none px-4 py-2 relative group inline-block">
                            <span className="font-semibold text-white text-sm mr-2">{comment.name}</span>
                            <span className="text-slate-200 text-sm whitespace-pre-wrap break-words">{comment.text}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1 ml-2 font-medium">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3 opacity-60">
                      <MessageCircle className="w-12 h-12 stroke-1" />
                      <p className="text-sm font-medium text-center">No comments yet.<br/>Be the first to comment!</p>
                    </div>
                  )}
                </div>

                {/* Action Bar */}
                <div className="shrink-0 p-4 border-t border-white/5 bg-slate-900">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => handleLike(selectedItem)}
                        className="flex items-center gap-2 text-slate-300 hover:text-white group transition-colors"
                      >
                        <Heart className={`w-6 h-6 transition-transform group-hover:scale-110 group-active:scale-95 ${selectedItem.likes?.includes(auth.currentUser?.email) ? 'fill-pink-500 text-pink-500' : ''}`} />
                        <span className="font-medium text-sm">{selectedItem.likes?.length || 0}</span>
                      </button>
                      <div className="flex items-center gap-2 text-slate-300">
                        <MessageCircle className="w-6 h-6" />
                        <span className="font-medium text-sm">{selectedItem.comments?.length || 0}</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <button 
                        onClick={(e) => handleDelete(e, selectedItem.id)}
                        className="p-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-full transition-colors flex-shrink-0"
                        title="Delete item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Comment Input */}
                  <form onSubmit={(e) => handleAddComment(e, selectedItem)} className="flex items-center gap-3 pt-2">
                    {auth.currentUser ? (
                      auth.currentUser.photoURL ? (
                        <img src={auth.currentUser.photoURL} alt="Your Avatar" className="w-8 h-8 rounded-full shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs text-white shrink-0 font-bold uppercase">
                          {auth.currentUser.email?.[0] || 'U'}
                        </div>
                      )
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-800 shrink-0" />
                    )}
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={auth.currentUser ? "Write a comment..." : "Sign in to comment..."}
                        disabled={!auth.currentUser}
                        className="w-full bg-black/5 dark:bg-slate-800 border-none rounded-full px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-10 disabled:opacity-50"
                      />
                      <button 
                        type="submit"
                        disabled={!commentText.trim() || !auth.currentUser}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:hover:text-indigo-400 p-1"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

