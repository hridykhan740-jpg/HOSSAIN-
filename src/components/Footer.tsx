export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-white/5 py-12 mt-32">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">Àbdüllāh Aĺ Hỗŝŝâîň</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">Providing premium digital experiences. Connecting brands with their audience through modern technology.</p>
        <div className="text-slate-600 text-sm">
          &copy; {new Date().getFullYear()} Àbdüllāh Aĺ Hỗŝŝâîň. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
