import { motion } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, addDoc, setDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../lib/firebase';
import { Shield, Loader2, Users, LayoutDashboard, Image as ImageIcon, Star, LogOut, Trash2, Briefcase, UserCircle, Edit2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminPage({ isAdmin }: { isAdmin: boolean }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard'|'profile'|'visitors'|'gallery'|'reviews'|'services'>('dashboard');

  const [visitors, setVisitors] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  // Add Gallery Data
  const [uploadFile, setUploadFile] = useState<File|null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Add Service Data
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceIcon, setServiceIcon] = useState('Code');

  // Add Profile Data
  const [profileUrl, setProfileUrl] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Gallery Edit state
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [editingCaptionValue, setEditingCaptionValue] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    
    const unsubVisitors = onSnapshot(query(collection(db, 'visitors'), orderBy('visitedAt', 'desc')), snap => setVisitors(snap.docs.map(d=>({id: d.id, ...d.data()}))), err => console.error("Visitors error:", err));
    const unsubGallery = onSnapshot(query(collection(db, 'gallery'), orderBy('createdAt', 'desc')), snap => setGallery(snap.docs.map(d=>({id: d.id, ...d.data()}))), err => console.error("Gallery error:", err));
    const unsubReviews = onSnapshot(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')), snap => setReviews(snap.docs.map(d=>({id: d.id, ...d.data()}))), err => console.error("Reviews error:", err));
    const unsubServices = onSnapshot(query(collection(db, 'services'), orderBy('createdAt', 'asc')), snap => setServices(snap.docs.map(d=>({id: d.id, ...d.data()}))), err => console.error("Services error:", err));
    
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
    if (!uploadFile) return;
    setIsUploading(true);
    try {
      const isVideo = uploadFile.type.startsWith('video/');
      const storageRef = ref(storage, `gallery/${Date.now()}_${uploadFile.name}`);
      const snapshot = await uploadBytes(storageRef, uploadFile);
      const url = await getDownloadURL(snapshot.ref);

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
    } catch(e: any) {
      toast.error('Upload failed: ' + e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'services'), {
        title: serviceTitle,
        description: serviceDesc,
        iconName: serviceIcon,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Service added');
      setServiceTitle('');
      setServiceDesc('');
      setServiceIcon('Code');
    } catch(e: any) {
      toast.error('Failed to add service: ' + e.message);
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
          <Shield className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Admin Access</h2>
          <p className="text-slate-400 text-sm mb-8">Restricted area. Please identity yourself.</p>
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
              <input type="file" required onChange={e=>setUploadFile(e.target.files?.[0] || null)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm" accept="image/*" />
              <button disabled={isUpdatingProfile} type="submit" className="bg-indigo-600 px-6 py-3 rounded-xl font-medium hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2">
                {isUpdatingProfile ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Update Picture'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'visitors' && (
          <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 text-slate-400 uppercase">
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
              <h3 className="text-lg font-medium mb-4">Upload New Item</h3>
              <form onSubmit={handleAddGalleryItem} className="flex gap-4">
                <input type="file" required onChange={e=>setUploadFile(e.target.files?.[0] || null)} className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm" accept="image/*,video/*" />
                <input type="text" placeholder="Caption (optional)" value={caption} onChange={e=>setCaption(e.target.value)} className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                <button disabled={isUploading} type="submit" className="bg-indigo-600 px-6 py-2 rounded-xl font-medium hover:bg-indigo-500 transition-colors flex items-center gap-2">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Upload'}
                </button>
              </form>
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
              <h3 className="text-lg font-medium">Add New Service</h3>
              <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input required type="text" placeholder="Title" value={serviceTitle} onChange={e=>setServiceTitle(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                <input required type="text" placeholder="Description" value={serviceDesc} onChange={e=>setServiceDesc(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                <div className="flex gap-4">
                  <select value={serviceIcon} onChange={e=>setServiceIcon(e.target.value)} className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white">
                    <option value="Code">Code</option>
                    <option value="ShoppingCart">Shopping Cart</option>
                    <option value="Mail">Mail</option>
                    <option value="Globe">Globe</option>
                    <option value="Smartphone">Smartphone</option>
                    <option value="Image">Image</option>
                    <option value="Star">Star</option>
                  </select>
                  <button type="submit" className="bg-indigo-600 px-6 py-2 rounded-xl font-medium hover:bg-indigo-500 transition-colors">Add</button>
                </div>
              </form>
            </div>
            <div className="flex flex-col gap-4">
              {services.map(s => (
                <div key={s.id} className="bg-slate-900 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">{s.title}</h4>
                    <p className="text-sm text-slate-400">{s.description}</p>
                  </div>
                  <button onClick={() => handleDeleteEntry('services', s.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 className="w-5 h-5"/></button>
                </div>
              ))}
              {services.length === 0 && <p className="text-slate-500 text-sm">No services added yet. The home page will show default services.</p>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
