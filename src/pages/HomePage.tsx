import { motion } from 'motion/react';
import Header from '../components/Header';
import ServicesSection from '../components/ServicesSection';
import ActionLinks from '../components/ActionLinks';
import GallerySection from '../components/GallerySection';
import ReviewsSection from '../components/ReviewsSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import { useEffect } from 'react';

export default function HomePage({ isAdmin }: { isAdmin: boolean }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      <Header isAdmin={isAdmin} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 md:space-y-32">
        <div className="space-y-4">
          <ServicesSection />
          <ActionLinks />
        </div>
        <GallerySection />
        <ReviewsSection isAdmin={isAdmin} />
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}
