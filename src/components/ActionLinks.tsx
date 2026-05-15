import { motion, AnimatePresence } from 'motion/react';
import { Camera, ShoppingCart, Globe, Smartphone, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function ActionLinks() {
  const navigate = useNavigate();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  const LINKS = [
    { id: 'gallery', label: 'Premium Gallery', icon: Camera, color: 'from-pink-500 to-rose-500', onClick: () => navigate('/gallery') },
    { id: 'ecommerce', label: 'E-commerce', icon: ShoppingCart, color: 'from-blue-500 to-indigo-500', onClick: () => navigate('/portfolio/ecommerce') },
    { id: 'website', label: 'Website Development', icon: Globe, color: 'from-emerald-500 to-teal-500', onClick: () => navigate('/portfolio/website') },
    { id: 'app', label: 'App Development', icon: Smartphone, color: 'from-orange-500 to-amber-500', onClick: () => navigate('/portfolio/app') },
    { id: 'order', label: 'Order Now', icon: Send, color: 'from-purple-500 to-violet-500', onClick: () => setIsOrderModalOpen(true) },
  ];

  const handleOrderSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      profession: formData.get('profession'),
      address: formData.get('address'),
      country: formData.get('country'),
      mobile: formData.get('mobile'),
      email: formData.get('email'),
      service_type: formData.get('service_type'),
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'orders'), data);
      toast.success('Your order has been submitted successfully!');
      setIsOrderModalOpen(false);
    } catch (e: any) {
      toast.error('Failed to submit order: ' + e.message);
    }
  };

  return (
    <>
      <section className="mb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {LINKS.map((link, i) => (
            <motion.button
              key={link.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={link.onClick}
              className={`relative overflow-hidden group bg-slate-900 border border-white/5 rounded-2xl p-6 flex flex-col items-center gap-4 hover:border-white/20 transition-colors shadow-lg`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className={`p-4 rounded-xl bg-slate-800 text-white group-hover:scale-110 transition-transform bg-gradient-to-br ${link.color}`}>
                <link.icon className="w-6 h-6 text-white" />
              </div>
              <span className="font-medium text-slate-300 group-hover:text-white transition-colors text-center text-sm md:text-base">
                {link.label}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {isOrderModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <button 
                onClick={() => setIsOrderModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Place an Order</h2>
                <p className="text-slate-400 text-sm">Fill out your details to get started with our services.</p>
              </div>

              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">Full Name</label>
                    <input required name="name" type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder:text-slate-600" placeholder="John Doe" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">Profession</label>
                    <input required name="profession" type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder:text-slate-600" placeholder="Software Engineer" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Email Address</label>
                  <input required name="email" type="email" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder:text-slate-600" placeholder="john@example.com" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">Contact Number</label>
                    <input required name="mobile" type="tel" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder:text-slate-600" placeholder="+1 234 567 890" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">Country</label>
                    <input required name="country" type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder:text-slate-600" placeholder="United States" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Address</label>
                  <input required name="address" type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder:text-slate-600" placeholder="123 Main St, City, State" />
                </div>

                <div className="space-y-1 pb-4">
                  <label className="text-xs font-medium text-slate-400">Service Required</label>
                  <select required name="service_type" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white appearance-none cursor-pointer">
                    <option value="" disabled selected>Select a service</option>
                    <optgroup label="Development">
                      <option value="E-commerce Development">E-commerce Development</option>
                      <option value="Website Development">Website Development</option>
                      <option value="App Development">App Development</option>
                    </optgroup>
                    <optgroup label="Marketing">
                      <option value="Digital Marketing">Digital Marketing</option>
                      <option value="Online Marketing">Online Marketing</option>
                      <option value="Gmail Marketing">Gmail Marketing</option>
                      <option value="Facebook Ads">Facebook Ads</option>
                    </optgroup>
                    <optgroup label="General Services">
                      <option value="Facebook ID Verification">Facebook ID Verification</option>
                      <option value="Drop Shipping">Drop Shipping</option>
                      <option value="International Payment">International Payment</option>
                    </optgroup>
                    <optgroup label="Mobile Top Up">
                      <option value="Mobile Top Up (Banglalink)">Mobile Top Up (Banglalink)</option>
                      <option value="Mobile Top Up (Grameenphone - GP)">Mobile Top Up (Grameenphone - GP)</option>
                      <option value="Mobile Top Up (Robi)">Mobile Top Up (Robi)</option>
                      <option value="Mobile Top Up (Airtel)">Mobile Top Up (Airtel)</option>
                      <option value="Mobile Top Up (Teletalk)">Mobile Top Up (Teletalk)</option>
                    </optgroup>
                    <optgroup label="Utility Bills">
                      <option value="Electrical Bill">Electrical Bill</option>
                      <option value="Gas Bill">Gas Bill</option>
                      <option value="Water Bill">Water Bill</option>
                      <option value="Internet Bill">Internet Bill</option>
                    </optgroup>
                    <optgroup label="Other">
                      <option value="Other Options">Other Options</option>
                    </optgroup>
                  </select>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all"
                >
                  Submit Order
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
