import { motion, useScroll, useTransform } from 'motion/react';
import Header from '../components/Header';
import ServicesSection from '../components/ServicesSection';
import ActionLinks from '../components/ActionLinks';
import GallerySection from '../components/GallerySection';
import ReviewsSection from '../components/ReviewsSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import { useEffect, useRef } from 'react';

export default function HomePage({ isAdmin }: { isAdmin: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-indigo-500/30 relative overflow-hidden">
      {/* Immersive Video Background */}
      <motion.div 
        style={{ y: backgroundY, opacity }} 
        className="absolute inset-0 z-0 h-screen w-full"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/80 to-slate-950 z-10" />
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-30 mix-blend-screen"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-lines-and-dots-in-blue-motion-30475-large.mp4" type="video/mp4" />
        </video>
      </motion.div>

      <div className="relative z-10">
        <Header isAdmin={isAdmin} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24 md:space-y-32">
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-8"
          >
            <ActionLinks />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <ServicesSection />
          </motion.div>

          <GallerySection />
          <ReviewsSection isAdmin={isAdmin} />
          <ContactSection />
        </main>

        <Footer />
      </div>
    </div>
  );
}
