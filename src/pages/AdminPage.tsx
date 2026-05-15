import { motion } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, addDoc, setDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { auth, db, storage } from '../lib/firebase';
import { Shield, Loader2, Users, LayoutDashboard, Image as ImageIcon, Star, LogOut, Trash2, Briefcase, UserCircle, Edit2, Check, X, FolderGit2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminPage({ isAdmin }: { isAdmin: boolean }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard'|'profile'|'visitors'|'gallery'|'reviews'|'services'|'portfolio'|'orders'>('dashboard');

  const [visitors, setVisitors] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [categoryIcons, setCategoryIcons] = useState<Record<string, string>>({});
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Add Gallery Data
  const [uploadFile, setUploadFile] = useState<File|null>(null);
  const [galleryUploadUrl, setGalleryUploadUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [galleryUploadProgress, setGalleryUploadProgress] = useState(0);

  // Add Service Data
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Development');
  const [serviceUploadFile, setServiceUploadFile] = useState<File|null>(null);
  const [isServiceUploading, setIsServiceUploading] = useState(false);

  // Add Portfolio Data
  const [portTitle, setPortTitle] = useState('');
  const [portDesc, setPortDesc] = useState('');
  const [portCategory, setPortCategory] = useState('ecommerce');
  const [portUrl, setPortUrl] = useState('');
  const [portUploadFile, setPortUploadFile] = useState<File|null>(null);
  const [isPortUploading, setIsPortUploading] = useState(false);

  // Add Profile Data
  const [profileUrl, setProfileUrl] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Gallery Edit state
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [editingCaptionValue, setEditingCaptionValue] = useState('');

  // Category Icon state
  const [selectedCatForIcon, setSelectedCatForIcon] = useState('Development');
  const [selectedIconName, setSelectedIconName] = useState('Briefcase');
  const [isUpdatingCatIcon, setIsUpdatingCatIcon] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    
    const unsubVisitors = onSnapshot(query(collection(db, 'visitors'), orderBy('visitedAt', 'desc')), snap => setVisitors(snap.docs.map(d=>({id: d.id, ...d.data()}))), err => console.error("Visitors error:", err));
    const unsubGallery = onSnapshot(query(collection(db, 'gallery'), orderBy('createdAt', 'desc')), snap => setGallery(snap.docs.map(d=>({id: d.id, ...d.data()}))), err => console.error("Gallery error:", err));
    const unsubReviews = onSnapshot(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')), snap => setReviews(snap.docs.map(d=>({id: d.id, ...d.data()}))), err => console.error("Reviews error:", err));
    const unsubServices = onSnapshot(query(collection(db, 'services'), orderBy('createdAt', 'asc')), snap => setServices(snap.docs.map(d=>({id: d.id, ...d.data()}))), err => console.error("Services error:", err));
    const unsubCategoryIcons = onSnapshot(collection(db, 'category_icons'), snap => {
      const icons: Record<string, string> = {};
      snap.docs.forEach(d => { icons[d.id] = d.data().iconName; });
      setCategoryIcons(icons);
    }, err => console.error("Cat Icons err:", err));
    const unsubPortfolio = onSnapshot(query(collection(db, 'portfolio'), orderBy('createdAt', 'desc')), snap => setPortfolio(snap.docs.map(d=>({id: d.id, ...d.data()}))), err => console.error("Portfolio error:", err));
    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), snap => setOrders(snap.docs.map(d=>({id: d.id, ...d.data()}))), err => console.error("Orders error:", err));
    
    // Fetch profile
    const unsubProfile = onSnapshot(doc(db, 'profile', 'admin'), snap => {
      if (snap.exists()) {
        setProfileUrl(snap.data().photoUrl || '');
      }
    }, err => console.error("Profile error:", err));

    return () => {
      unsubVisitors();
      unsubGallery();
      unsubReviews();
      unsubServices();
      unsubCategoryIcons();
      unsubPortfolio();
      unsubOrders();
      unsubProfile();
    }
  }, [isAdmin]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      toast.error('Login Failed: ' + e.message);
    }
  };

  const handleSetCategoryIcon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingCatIcon(true);
    try {
      await setDoc(doc(db, 'category_icons', selectedCatForIcon), {
        iconName: selectedIconName
      });
      toast.success('Category icon updated');
    } catch(err: any) {
      toast.error(err.message);
    } finally {
      setIsUpdatingCatIcon(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setIsUpdatingProfile(true);
    try {
      const storageRef = ref(storage, `profile/${Date.now()}_${uploadFile.name}`);
      const snapshot = await uploadBytes(storageRef, uploadFile);
      const url = await getDownloadURL(snapshot.ref);

      await setDoc(doc(db, 'profile', 'admin'), {
        photoUrl: url,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      toast.success('Profile photo updated!');
      setUploadFile(null);
    } catch(e: any) {
      toast.error('Upload failed: ' + e.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile && !galleryUploadUrl) return;
    setIsUploading(true);
    setGalleryUploadProgress(0);
    try {
      if (galleryUploadUrl) {
        // Assume image if using simple URL, but user could input video url. Just checking extension roughly.
        const isVideo = galleryUploadUrl.includes('.mp4') || galleryUploadUrl.includes('.webm');
        await addDoc(collection(db, 'gallery'), {
          type: isVideo ? 'video' : 'image',
          url: galleryUploadUrl,
          caption,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        toast.success('Added to gallery via URL');
        setGalleryUploadUrl('');
        setCaption('');
        setIsUploading(false);
      } else if (uploadFile) {
        const isVideo = uploadFile.type.startsWith('video/');
        const storageRef = ref(storage, `gallery/${Date.now()}_${uploadFile.name}`);
        
        const uploadTask = uploadBytesResumable(storageRef, uploadFile);
        
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setGalleryUploadProgress(Math.round(progress));
          },
          (error) => {
            toast.error('Upload failed: ' + error.message);
            setIsUploading(false);
            setGalleryUploadProgress(0);
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            await addDoc(collection(db, 'gallery'), {
              type: isVideo ? 'video' : 'image',
              url,
              caption,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            toast.success('Added to gallery');
            setUploadFile(null);
            setCaption('');
            setIsUploading(false);
            setGalleryUploadProgress(0);
          }
        );
      }
    } catch(e: any) {
      toast.error('Upload failed: ' + e.message);
      setIsUploading(false);
      setGalleryUploadProgress(0);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsServiceUploading(true);
    try {
      let imageUrl = '';
      if (serviceUploadFile) {
         const storageRef = ref(storage, `services/${Date.now()}_${serviceUploadFile.name}`);
         const snapshot = await uploadBytes(storageRef, serviceUploadFile);
         imageUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, 'services'), {
        title: serviceTitle,
        description: serviceDesc,
        category: serviceCategory,
        imageUrl: imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Service added');
      setServiceTitle('');
      setServiceDesc('');
      setServiceCategory('Development');
      setServiceUploadFile(null);
    } catch(e: any) {
      toast.error('Failed to add service: ' + e.message);
    } finally {
      setIsServiceUploading(false);
    }
  };

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPortUploading(true);
    try {
      let imageUrl = '';
      if (portUploadFile) {
         const storageRef = ref(storage, `portfolio/${Date.now()}_${portUploadFile.name}`);
         const snapshot = await uploadBytes(storageRef, portUploadFile);
         imageUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, 'portfolio'), {
        title: portTitle,
        description: portDesc,
        category: portCategory,
        url: portUrl,
        imageUrl: imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Portfolio item added');
      setPortTitle('');
      setPortDesc('');
      setPortCategory('ecommerce');
      setPortUrl('');
      setPortUploadFile(null);
    } catch(e: any) {
      toast.error('Failed to add portfolio item: ' + e.message);
    } finally {
      setIsPortUploading(false);
    }
  };

  const handleDeleteEntry = async (collectionName: string, id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      toast.success('Deleted successfully');
    } catch(e: any) {
      toast.error('Deletion failed: ' + e.message);
    }
  };

  const handleUpdateCaption = async (id: string) => {
    try {
      await updateDoc(doc(db, 'gallery', id), {
        caption: editingCaptionValue,
        updatedAt: serverTimestamp()
      });
      toast.success('Caption updated');
      setEditingCaptionId(null);
    } catch (e: any) {
      toast.error('Failed to update caption: ' + e.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
          <Shield className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Admin Access</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Restricted area. Please identity yourself.</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogin} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors">
            Login with Google
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-white/5 flex flex-col p-4 md:p-6 md:sticky md:top-0 md:h-screen shrink-0 relative z-20">
        <h2 className="text-xl font-bold mb-4 md:mb-10 text-indigo-400">Admin Panel</h2>
        <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'profile', icon: UserCircle, label: 'Profile' },
            { id: 'visitors', icon: Users, label: 'Visitors' },
            { id: 'gallery', icon: ImageIcon, label: 'Gallery' },
            { id: 'reviews', icon: Star, label: 'Reviews' },
            { id: 'services', icon: Briefcase, label: 'Services' },
            { id: 'portfolio', icon: FolderGit2, label: 'Portfolio' },
            { id: 'orders', icon: ShoppingBag, label: 'Orders' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 md:py-3 rounded-xl transition-colors ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 bg-white/5 md:bg-transparent hover:bg-white/10 hover:text-white'}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => navigate('/home')} className="hidden md:flex mt-auto items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors">
          <LogOut className="w-5 h-5 rotate-180" /> Back to Home
        </button>
        <button onClick={() => navigate('/home')} className="md:hidden absolute top-4 right-4 flex items-center p-2 text-slate-400 bg-white/5 rounded-lg hover:bg-white/10 hover:text-white transition-colors">
          <LogOut className="w-5 h-5 rotate-180" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto md:h-screen">
        <h1 className="text-3xl font-bold mb-8 capitalize">{activeTab}</h1>
        
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl">
              <h3 className="text-slate-400 font-medium mb-2">Total Visitors</h3>
              <p className="text-4xl font-bold">{visitors.length}</p>
            </div>
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl">
              <h3 className="text-slate-400 font-medium mb-2">Gallery Items</h3>
              <p className="text-4xl font-bold">{gallery.length}</p>
            </div>
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl">
              <h3 className="text-slate-400 font-medium mb-2">Total Reviews</h3>
              <p className="text-4xl font-bold">{reviews.length}</p>
            </div>
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl">
              <h3 className="text-slate-400 font-medium mb-2">Total Services</h3>
              <p className="text-4xl font-bold">{services.length}</p>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl max-w-lg">
            <h3 className="text-lg font-medium mb-4">Update Profile Picture</h3>
            
            <div className="mb-6">
               <img src={profileUrl || "https://i.ibb.co/DH1xjsn1/image-4-2.jpg"} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500/30" />
            </div>

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
              <input type="file" required onChange={e=>setUploadFile(e.target.files?.[0] || null)} className="w-full bg-slate-100 dark:bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm" accept="image/*" />
              <button disabled={isUpdatingProfile} type="submit" className="bg-indigo-600 px-6 py-3 rounded-xl font-medium hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2">
                {isUpdatingProfile ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Update Picture'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'visitors' && (
          <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800/50 text-slate-400 uppercase">
                <tr><th className="px-6 py-4">Visitor Email</th><th className="px-6 py-4">Visited At</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visitors.map(v => (
                  <tr key={v.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">{v.email}</td>
                    <td className="px-6 py-4">{v.visitedAt?.toDate?.()?.toLocaleString() || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div>
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Upload New Item</h3>
                <button
                  onClick={async () => {
                     const seenUrls = new Set();
                     const duplicates = [];
                     for (const item of gallery) {
                       if (seenUrls.has(item.url)) {
                         duplicates.push(item);
                       } else {
                         seenUrls.add(item.url);
                       }
                     }
                     if (duplicates.length === 0) {
                       toast.success('No duplicates found!');
                       return;
                     }
                     try {
                        for (const dup of duplicates) {
                          await deleteDoc(doc(db, 'gallery', dup.id));
                        }
                        toast.success(`Removed ${duplicates.length} duplicate items`);
                     } catch(err: any) {
                        toast.error(err.message);
                     }
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
                >
                  Remove Duplicates
                </button>
              </div>
              <form onSubmit={handleAddGalleryItem} className="flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-xs text-slate-400 font-medium">Upload File</label>
                    <input type="file" onChange={e=>setUploadFile(e.target.files?.[0] || null)} disabled={!!galleryUploadUrl} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm disabled:opacity-50" accept="image/*,video/*" />
                  </div>
                  <div className="flex items-center text-slate-500 font-medium mt-6">OR</div>
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-xs text-slate-400 font-medium">Image/Video URL</label>
                    <input type="url" placeholder="https://example.com/image.jpg" value={galleryUploadUrl} onChange={e=>setGalleryUploadUrl(e.target.value)} disabled={!!uploadFile} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <input type="text" placeholder="Caption (optional)" value={caption} onChange={e=>setCaption(e.target.value)} className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                  <button disabled={isUploading || (!uploadFile && !galleryUploadUrl)} type="submit" className="bg-indigo-600 px-6 py-2 rounded-xl font-medium hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-50">
                    {isUploading ? <><Loader2 className="w-4 h-4 animate-spin"/> {galleryUploadProgress}%</> : 'Submit'}
                  </button>
                </div>
              </form>
              {isUploading && (
                <div className="mt-4 w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${galleryUploadProgress}%` }}></div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.map(g => (
                <div key={g.id} className="relative group bg-slate-900 rounded-xl overflow-hidden border border-white/5 flex flex-col">
                  <div className="relative">
                    {g.type === 'video' ? <video src={g.url} controls muted className="w-full h-32 object-cover" /> : <img src={g.url} className="w-full h-32 object-cover" />}
                    <button onClick={() => handleDeleteEntry('gallery', g.id)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"><Trash2 className="w-4 h-4"/></button>
                  </div>
                  <div className="p-3 text-sm flex-1">
                    {editingCaptionId === g.id ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={editingCaptionValue} 
                          onChange={e => setEditingCaptionValue(e.target.value)} 
                          className="flex-1 bg-black/50 border border-white/10 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs" 
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateCaption(g.id);
                            if (e.key === 'Escape') setEditingCaptionId(null);
                          }}
                        />
                        <button onClick={() => handleUpdateCaption(g.id)} className="text-emerald-400 hover:text-emerald-300"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingCaptionId(null)} className="text-slate-400 hover:text-slate-300"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between group/caption">
                        <span className="truncate pr-2" title={g.caption || 'No caption'}>{g.caption || 'No caption'}</span>
                        <button 
                          onClick={() => { setEditingCaptionId(g.id); setEditingCaptionValue(g.caption || ''); }} 
                          className="flex items-center gap-1 text-xs bg-black/50 hover:bg-black/80 px-2 py-1 rounded text-slate-300 hover:text-white transition-colors shrink-0"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {reviews.map(r => (
               <div key={r.id} className="bg-slate-900 border border-white/5 p-6 rounded-2xl relative group">
                  <div className="flex gap-1 text-yellow-400 mb-2">
                    {[...Array(r.rating)].map((_,i) => <Star key={i} className="w-4 h-4 fill-current"/>)}
                  </div>
                  <p className="text-white font-medium">{r.reviewerName}</p>
                  <p className="text-slate-400 text-sm mb-4">"{r.content}"</p>
                  {r.screenshotUrl && <img src={r.screenshotUrl} className="w-full h-24 object-cover rounded-lg mb-4" />}
                  <button onClick={() => handleDeleteEntry('reviews', r.id)} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
               </div>
             ))}
           </div>
        )}

        {activeTab === 'services' && (
          <div>
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl mb-8 flex flex-col gap-4">
              <h3 className="text-lg font-medium">Manage Category Icons</h3>
              <form onSubmit={handleSetCategoryIcon} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Category name</label>
                  <select value={selectedCatForIcon} onChange={e=>setSelectedCatForIcon(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white">
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Apps">Apps</option>
                    <option value="General Services">General Services</option>
                    <option value="Mobile Top Up">Mobile Top Up</option>
                    <option value="Utility Bills">Utility Bills</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Icon Name (Lucide string)</label>
                  <select value={selectedIconName} onChange={e=>setSelectedIconName(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white">
                    <option value="ShoppingCart">ShoppingCart</option>
                    <option value="Mail">Mail</option>
                    <option value="Globe">Globe</option>
                    <option value="Code">Code</option>
                    <option value="Smartphone">Smartphone</option>
                    <option value="Image">Image</option>
                    <option value="Star">Star</option>
                    <option value="Briefcase">Briefcase</option>
                    <option value="Megaphone">Megaphone</option>
                    <option value="Laptop">Laptop</option>
                    <option value="PenTool">PenTool</option>
                    <option value="Database">Database</option>
                    <option value="Cpu">Cpu</option>
                    <option value="Layout">Layout</option>
                    <option value="Pen">Pen</option>
                    <option value="Video">Video</option>
                    <option value="Camera">Camera</option>
                    <option value="Wallet">Wallet</option>
                    <option value="CreditCard">CreditCard</option>
                    <option value="Zap">Zap</option>
                    <option value="FileText">FileText</option>
                    <option value="CheckCircle">CheckCircle</option>
                  </select>
                </div>
                <button disabled={isUpdatingCatIcon} type="submit" className="bg-indigo-600 px-4 py-2 rounded-xl font-medium hover:bg-indigo-500 transition-colors flex items-center justify-center">
                  {isUpdatingCatIcon ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Save Icon'}
                </button>
              </form>
            </div>
            
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl mb-8 flex flex-col gap-4">
              <h3 className="text-lg font-medium">Add New Service</h3>
              <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Title</label>
                  <input required type="text" placeholder="Service Name" value={serviceTitle} onChange={e=>setServiceTitle(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Description</label>
                  <input required type="text" placeholder="Short description" value={serviceDesc} onChange={e=>setServiceDesc(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Category</label>
                  <select value={serviceCategory} onChange={e=>setServiceCategory(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white">
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Apps">Apps</option>
                    <option value="General Services">General Services</option>
                    <option value="Mobile Top Up">Mobile Top Up</option>
                    <option value="Utility Bills">Utility Bills</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Image (Optional)</label>
                  <div className="flex gap-2">
                    <input type="file" onChange={e=>setServiceUploadFile(e.target.files?.[0] || null)} className="flex-1 min-w-[120px] bg-black/50 border border-white/10 rounded-xl px-2 py-1.5 text-xs" accept="image/*" />
                    <button disabled={isServiceUploading} type="submit" className="bg-indigo-600 px-4 py-2 rounded-xl font-medium hover:bg-indigo-500 transition-colors flex items-center justify-center">
                      {isServiceUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Add'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div className="flex flex-col gap-4">
              {services.map(s => (
                <div key={s.id} className="bg-slate-900 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {s.imageUrl ? (
                      <img src={s.imageUrl} alt={s.title} className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-indigo-400" />
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-medium text-white">{s.title}</h4>
                        <span className="bg-slate-800 text-xs px-2 py-0.5 rounded-full text-slate-300 border border-white/5">{s.category || 'Other'}</span>
                      </div>
                      <p className="text-sm text-slate-400">{s.description}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteEntry('services', s.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 className="w-5 h-5"/></button>
                </div>
              ))}
              {services.length === 0 && <p className="text-slate-500 text-sm">No services added yet. The home page will show default services.</p>}
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div>
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl mb-8 flex flex-col gap-4">
              <h3 className="text-lg font-medium">Add Portfolio Item</h3>
              <form onSubmit={handleAddPortfolio} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Title</label>
                  <input required type="text" placeholder="Project Name" value={portTitle} onChange={e=>setPortTitle(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Description</label>
                  <input required type="text" placeholder="Short description" value={portDesc} onChange={e=>setPortDesc(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Category</label>
                  <select value={portCategory} onChange={e=>setPortCategory(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white">
                    <option value="ecommerce">E-commerce</option>
                    <option value="website">Website</option>
                    <option value="app">App</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">URL</label>
                  <input type="url" placeholder="https://..." value={portUrl} onChange={e=>setPortUrl(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="flex flex-col gap-1 lg:col-span-2">
                  <label className="text-xs text-slate-400">Image (Optional)</label>
                  <div className="flex gap-2">
                    <input type="file" onChange={e=>setPortUploadFile(e.target.files?.[0] || null)} className="flex-1 bg-black/50 border border-white/10 rounded-xl px-2 py-1.5 text-xs" accept="image/*" />
                    <button disabled={isPortUploading} type="submit" className="bg-indigo-600 px-6 py-2 rounded-xl font-medium hover:bg-indigo-500 transition-colors flex items-center justify-center">
                      {isPortUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Add'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.map(p => (
                <div key={p.id} className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.title} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-slate-800 flex items-center justify-center">
                      <FolderGit2 className="w-10 h-10 text-slate-600" />
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold flex-1">{p.title}</h4>
                      <button onClick={() => handleDeleteEntry('portfolio', p.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-4 h-4"/></button>
                    </div>
                    <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded w-fit mb-2">{p.category}</span>
                    <p className="text-sm text-slate-400 mb-4 flex-1">{p.description}</p>
                    {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300">Visit Link &rarr;</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h3 className="text-xl font-bold mb-6">Orders</h3>
            <div className="space-y-4">
              {orders.map(o => (
                <div key={o.id} className="bg-slate-900 border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <h4 className="font-bold text-lg">{o.name}</h4>
                       <span className="bg-indigo-500/20 text-indigo-400 text-xs px-3 py-1 rounded-full">{o.service_type}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-300">
                      <p><span className="text-slate-500">Email:</span> {o.email}</p>
                      <p><span className="text-slate-500">Phone:</span> {o.mobile}</p>
                      <p><span className="text-slate-500">Profession:</span> {o.profession}</p>
                      <p><span className="text-slate-500">Country:</span> {o.country}</p>
                      <p className="md:col-span-2"><span className="text-slate-500">Address:</span> {o.address}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-4">{new Date(o.createdAt?.toMillis() || Date.now()).toLocaleString()}</p>
                  </div>
                  <div className="flex justify-end items-start border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-4">
                    <button onClick={() => handleDeleteEntry('orders', o.id)} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 p-3 rounded-xl h-fit">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="text-slate-500">No orders yet.</p>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
