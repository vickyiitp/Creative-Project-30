import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  GitMerge, 
  Terminal, 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  Menu, 
  X, 
  Youtube, 
  Linkedin, 
  Github, 
  Instagram, 
  Twitter, 
  Mail, 
  ChevronUp,
  ExternalLink,
  FileText,
  Lock
} from 'lucide-react';
import { COLORS } from './constants';

interface LandingPageProps {
  onStart: () => void;
}

// --- Simple Modal Component for Terms/Privacy ---
const InfoModal = ({ title, content, onClose }: { title: string, content: React.ReactNode, onClose: () => void }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 rounded-t-2xl">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          {title === 'Privacy' ? <Lock size={20} className="text-sky-400"/> : <FileText size={20} className="text-sky-400"/>}
          {title} Policy
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>
      <div className="p-6 overflow-y-auto text-slate-300 leading-relaxed text-sm space-y-4">
        {content}
      </div>
      <div className="p-4 border-t border-slate-800 flex justify-end">
        <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium">
          Close
        </button>
      </div>
    </div>
  </div>
);

export default function LandingPage({ onStart }: LandingPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  // Scroll Listener for Back to Top
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Background Animation Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no alpha channel
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    // Respect user motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
       ctx.fillStyle = '#0f172a';
       ctx.fillRect(0, 0, width, height);
       return;
    }

    // Particles representing nodes
    const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    // Adjust density based on screen size for performance
    const particleCount = Math.min(50, Math.floor(width / 20)); 

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.fillStyle = '#0f172a'; // Slate 900
      ctx.fillRect(0, 0, width, height);
      
      // Update and draw particles
      ctx.fillStyle = COLORS.accentFunction;
      ctx.strokeStyle = COLORS.lineNormal;
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineWidth = 1 - dist / 150;
            ctx.strokeStyle = `rgba(71, 85, 105, ${1 - dist / 150})`;
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const SocialLinks = ({ className = "" }: { className?: string }) => (
    <div className={`flex gap-4 ${className}`}>
      <a href="https://youtube.com/@vickyiitp" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition-colors" aria-label="YouTube">
        <Youtube size={20} />
      </a>
      <a href="https://linkedin.com/in/vickyiitp" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors" aria-label="LinkedIn">
        <Linkedin size={20} />
      </a>
      <a href="https://x.com/vickyiitp" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="X (Twitter)">
        <Twitter size={20} />
      </a>
      <a href="https://github.com/vickyiitp" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="GitHub">
        <Github size={20} />
      </a>
      <a href="https://instagram.com/vickyiitp" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors" aria-label="Instagram">
        <Instagram size={20} />
      </a>
    </div>
  );

  return (
    <div className="relative w-full min-h-screen bg-slate-900 text-white font-sans selection:bg-sky-500/30 overflow-x-hidden">
      {/* Animated Background Canvas */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none opacity-40 z-0"
      />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer group" 
              onClick={() => window.scrollTo({top:0, behavior:'smooth'})}
            >
              <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors border border-slate-700">
                  <Terminal className="text-sky-400" size={20} />
              </div>
              <span className="font-bold text-lg sm:text-xl tracking-tight">Spaghetti<span className="text-sky-400">Untangler</span></span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#story" className="hover:text-white transition-colors">Lore</a>
              <a href="https://vickyiitp.tech" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">Portfolio <ExternalLink size={12} /></a>
              <button 
                  onClick={(e) => { e.preventDefault(); onStart(); }}
                  className="bg-sky-600 hover:bg-sky-500 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-sky-500/20 transition-all hover:shadow-sky-500/40 hover:-translate-y-0.5"
              >
                Launch App
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-300 hover:text-white focus:outline-none p-2 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
            <div className="px-4 pt-4 pb-8 space-y-4 flex flex-col items-center text-center">
              <a href="#features" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-slate-300 hover:text-white text-lg font-medium w-full hover:bg-slate-800 rounded-lg">Features</a>
              <a href="#story" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-slate-300 hover:text-white text-lg font-medium w-full hover:bg-slate-800 rounded-lg">Lore</a>
              <a href="https://vickyiitp.tech" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-slate-300 hover:text-white text-lg font-medium w-full hover:bg-slate-800 rounded-lg">Developer</a>
              <button 
                  onClick={() => { setIsMenuOpen(false); onStart(); }}
                  className="w-full max-w-xs bg-sky-600 hover:bg-sky-500 text-white px-6 py-3 rounded-lg text-lg font-bold shadow-lg mt-4"
              >
                Play Now
              </button>
              <div className="pt-6 border-t border-slate-800 w-full flex justify-center">
                <SocialLinks />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center min-h-[90vh] justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          System Critical Alert
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 max-w-4xl leading-tight pb-2">
          Refactor the Chaos.<br />
          <span className="text-sky-400">Save the Build.</span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed px-4">
          The ultimate planar graph puzzle for developers by <span className="text-sky-300 font-semibold">Vickyiitp</span>. Untangle spaghetti code dependencies before runtime errors destroy production.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4">
          <a 
            href="game.html" 
            onClick={(e) => { e.preventDefault(); onStart(); }}
            className="group relative inline-flex items-center justify-center gap-3 bg-sky-500 hover:bg-sky-400 text-slate-900 text-lg font-bold px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] w-full sm:w-auto active:scale-95"
          >
            <Play className="fill-current" size={20} />
            PLAY NOW
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </a>
          <a 
            href="#features"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-semibold transition-all w-full sm:w-auto hover:border-slate-500"
          >
            How it Works
          </a>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 animate-bounce text-slate-500 hidden md:block">
            <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center pt-2">
                <div className="w-1 h-2 bg-slate-500 rounded-full"></div>
            </div>
        </div>
      </section>

      {/* How It Works / Features */}
      <section id="features" className="relative z-10 py-24 bg-slate-900/50 backdrop-blur-sm border-t border-slate-800 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">Core Mechanics</h2>
            <p className="text-slate-400">Powered by the Graph Theory Engine™</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group bg-slate-800/40 border border-slate-700 hover:border-sky-500/50 p-8 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-900/20">
              <div className="w-12 h-12 bg-sky-500/10 rounded-lg flex items-center justify-center mb-6 text-sky-400 group-hover:scale-110 transition-transform">
                <GitMerge size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Visualize Dependencies</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Nodes represent functions, classes, and variables. Lines are dependencies. When they cross, you have a race condition waiting to happen.
              </p>
              {/* Mini Graph Visual */}
              <div className="mt-6 h-24 bg-slate-900/50 rounded-lg border border-slate-700/50 relative overflow-hidden flex items-center justify-center">
                  <div className="flex gap-4 items-center opacity-60">
                      <div className="w-8 h-8 rounded bg-slate-700 border border-slate-600"></div>
                      <div className="h-0.5 w-8 bg-slate-600"></div>
                      <div className="w-8 h-8 rounded bg-slate-700 border border-slate-600"></div>
                  </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group bg-slate-800/40 border border-slate-700 hover:border-pink-500/50 p-8 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-900/20">
              <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-6 text-pink-400 group-hover:scale-110 transition-transform">
                <Activity size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Drag to Refactor</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Move components around the IDE canvas. Find the optimal planar arrangement where no two dependencies intersect.
              </p>
               {/* Drag Visual */}
               <div className="mt-6 h-24 bg-slate-900/50 rounded-lg border border-slate-700/50 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute w-full h-full border-2 border-dashed border-pink-500/20 rounded-lg animate-pulse"></div>
                  <div className="w-8 h-8 rounded bg-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.5)] transform translate-x-2 translate-y-2 border border-pink-400"></div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group bg-slate-800/40 border border-slate-700 hover:border-green-500/50 p-8 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-green-900/20">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-6 text-green-400 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Deploy to Prod</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Solve the graph to unlock the next level. Difficulty scales with codebase size. Can you handle enterprise complexity?
              </p>
               {/* Success Visual */}
               <div className="mt-6 h-24 bg-slate-900/50 rounded-lg border border-slate-700/50 relative overflow-hidden flex items-center justify-center">
                  <div className="text-green-500 font-mono text-xs border border-green-500/50 px-2 py-1 rounded bg-green-500/10">BUILD SUCCESSFUL</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Story */}
      <section id="story" className="relative z-10 py-32 px-6 max-w-4xl mx-auto text-center scroll-mt-20">
        <h2 className="text-3xl font-bold mb-8 text-white">The Legacy Code Incident</h2>
        <div className="prose prose-invert prose-lg mx-auto text-slate-400">
          <p className="mb-6">
            It's 2077. AI writes 99% of the code, but it's terrible at architecture. 
            The global network is clogged with <span className="text-sky-400 font-mono">Spaghetti Code</span>.
          </p>
          <p>
            You are a Senior Architect at Spaghetti Corp. Your mission is simple:
            Log into the mainframe, visualize the dependency graphs, and refactor the nodes until the system stabilizes.
          </p>
          <p className="font-bold text-white mt-8 p-4 border-l-4 border-sky-500 bg-slate-800/50 inline-block text-left rounded-r-lg">
            "Do not let the lines cross. The fate of the server depends on it."
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-950 py-16 border-t border-slate-800 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-white">
               <div className="p-1 bg-slate-800 rounded border border-slate-700">
                 <Terminal size={18} className="text-sky-400" />
               </div>
               <span className="font-bold text-lg">SpaghettiUntangler</span>
            </div>
            <p className="text-slate-400 max-w-xs">
              A web-based puzzle game designed to test your logic and spatial reasoning skills. Built with React & Tailwind by Vicky Kumar.
            </p>
            <div className="flex gap-2 pt-2">
               <a href="mailto:themvaplatform@gmail.com" className="flex items-center gap-2 hover:text-sky-400 transition-colors">
                  <Mail size={16} /> themvaplatform@gmail.com
               </a>
            </div>
          </div>

          {/* Links Column */}
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">Legal & Info</h4>
            <ul className="space-y-2">
              <li><button onClick={() => setActiveModal('privacy')} className="hover:text-sky-400 transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => setActiveModal('terms')} className="hover:text-sky-400 transition-colors">Terms of Service</button></li>
              <li><a href="https://vickyiitp.tech" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors flex items-center gap-1">Vicky's Portfolio <ExternalLink size={12}/></a></li>
            </ul>
          </div>

          {/* Socials Column */}
          <div className="space-y-4">
             <h4 className="text-white font-bold uppercase tracking-wider text-xs">Connect</h4>
             <SocialLinks />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-900 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© 2025 <span className="text-sky-400">Vickyiitp</span>. All rights reserved.</p>
            <p className="text-xs opacity-50 flex items-center gap-1">Designed by Devil Labs <span className="text-red-500">♥</span></p>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button 
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 p-3 rounded-full bg-sky-600 text-white shadow-xl transition-all duration-300 z-40 hover:bg-sky-500 hover:shadow-2xl hover:-translate-y-1 ${showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
        aria-label="Back to top"
      >
        <ChevronUp size={24} />
      </button>

      {/* Modals */}
      {activeModal === 'privacy' && (
        <InfoModal 
          title="Privacy" 
          onClose={() => setActiveModal(null)} 
          content={
            <>
              <p>This Privacy Policy explains how we handle your data.</p>
              <h4 className="font-bold text-white mt-4">1. Data Collection</h4>
              <p>We do not collect any personal data. Game progress is stored locally on your device using LocalStorage.</p>
              <h4 className="font-bold text-white mt-4">2. Cookies</h4>
              <p>This website does not use cookies for tracking purposes.</p>
              <h4 className="font-bold text-white mt-4">3. Contact</h4>
              <p>For any questions, please contact themvaplatform@gmail.com.</p>
            </>
          } 
        />
      )}

      {activeModal === 'terms' && (
        <InfoModal 
          title="Terms of Service" 
          onClose={() => setActiveModal(null)} 
          content={
            <>
              <p>By accessing this website, you agree to these terms.</p>
              <h4 className="font-bold text-white mt-4">1. License</h4>
              <p>This game is free to play for personal, non-commercial use.</p>
              <h4 className="font-bold text-white mt-4">2. Disclaimer</h4>
              <p>The game is provided "as is" without warranties of any kind.</p>
            </>
          } 
        />
      )}
    </div>
  );
}