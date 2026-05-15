import React from 'react';
import { motion } from 'motion/react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactSection() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent successfully! We will get back to you soon.');
    // In a real app we'd save this to Firestore
  };

  return (
    <section>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 font-sans tracking-tight">Get in Touch</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 md:p-12 rounded-3xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Name</label>
                <input required className="w-full bg-slate-100 dark:bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Gmail</label>
                <input required type="email" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" placeholder="john@gmail.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Message</label>
              <textarea required rows={4} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" placeholder="How can we help you?"></textarea>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95">
              Send Message <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
