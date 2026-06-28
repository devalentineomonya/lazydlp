import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <header className="flex items-center justify-between px-6 md:px-12 py-5 sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-card-border/40">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter cursor-pointer hover:opacity-80 transition-opacity">
          <span className="text-primaryBright flex flex-col leading-[0.6] text-[0.85em]">
            <span>▶</span>
            <span>▼</span>
          </span> 
          lazydlp
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50 bg-card/50 px-6 py-2.5 rounded-full border border-card-border">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#commands" className="hover:text-white transition-colors">Commands</a>
          <a href="#help" className="hover:text-white transition-colors">Help</a>
        </nav>
        <div className="flex items-center gap-2">
          <a 
            className="group/btn inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold tracking-tight transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 liquid-glass-orange hover:liquid-glass-orange-hover text-white h-9 px-4 text-[13px] hidden md:inline-flex" 
            href="https://github.com/devalentineomonya/lazydlp"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="size-3.5 opacity-80 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6.65032C9 6.65032 15.9383 6.10759 16.9154 7.08463C17.8924 8.06167 17.3496 15 17.3496 15M16.5 7.5L6.5 17.5" />
            </svg>
          </a>
          <button className="md:hidden flex items-center justify-center size-9 rounded-md border border-card-border bg-card text-white/70 hover:bg-card-border transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="size-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5L20 5"></path><path d="M4 12L20 12"></path><path d="M4 19L20 19"></path></svg>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 pb-24">
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20 pt-16 md:pt-28 pb-20">
          <div className="flex-1 relative group w-full max-w-lg flex justify-center perspective-[1000px]">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full mix-blend-screen -z-10 group-hover:bg-primaryBright/30 transition-colors duration-700" />
            <img 
              src="/mascot.jpg" 
              alt="Lazydlp Mascot" 
              className="w-full max-w-[480px] drop-shadow-[0_20px_50px_rgba(238,91,14,0.3)] object-contain rounded-[32px] transform transition-transform duration-700 hover:scale-105 hover:rotate-2"
            />
          </div>

          <div className="flex-1 flex flex-col items-start gap-8 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/60 backdrop-blur-sm border border-card-border text-xs font-medium text-white/70">
              <span className="w-1.5 h-1.5 rounded-full bg-primaryBright animate-pulse shadow-[0_0_10px_rgba(255,123,48,0.8)]" /> 
              v1 - Public Beta
            </div>
            
            <h1 className="text-[3.5rem] md:text-[5.5rem] font-serif tracking-tight leading-[0.9] text-white">
              A tiny client<br />
              for your <span className="italic text-white/90">downloads.</span>
            </h1>
            
            <p className="text-[17px] text-white/50 leading-[1.6] max-w-[420px]">
              Connect to YouTube and grab videos directly from your terminal. Two simple commands, zero bloated UI, and every download lands directly in your curated directories.
            </p>
            
            <div className="flex items-center gap-6 pt-4">
              <a 
                className="group/btn inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold tracking-tight transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 liquid-glass-orange hover:liquid-glass-orange-hover text-white h-11 px-6 text-[14px]" 
                href="https://github.com/devalentineomonya/lazydlp"
                target="_blank"
                rel="noopener noreferrer"
              >
                Add to your setup
              </a>
              <a href="#commands" className="text-[14px] font-semibold text-white/70 hover:text-white transition-colors flex items-center gap-2 group">
                Browse commands 
                <span className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
              </a>
            </div>
          </div>
        </section>

        {/* CLI Demo Mockup */}
        <section className="w-full max-w-[900px] mx-auto mb-32 relative">
          <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full mix-blend-screen -z-10" />
          <div className="w-full rounded-xl bg-[#0c0c0c] border border-card-border shadow-2xl overflow-hidden flex flex-col font-mono text-[13px]">
            {/* Window Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-card-border/50 bg-[#121214]">
              <div className="flex items-center gap-2 text-white/40 font-sans text-xs">
                <span className="text-primaryBright">#</span> terminal
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-card-border" />
                <span className="w-2.5 h-2.5 rounded-full bg-card-border" />
                <span className="w-2.5 h-2.5 rounded-full bg-card-border" />
              </div>
            </div>
            {/* Window Body */}
            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">L</div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-white/90">lazydlp</span>
                    <span className="text-xs text-white/30 bg-white/5 px-1.5 py-0.5 rounded">system</span>
                  </div>
                  <span className="text-white/70">Welcome back! Run <span className="text-primaryBright bg-primary/10 px-1 py-0.5 rounded">/help</span> to see commands.</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">U</div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-white/90">user</span>
                    <span className="text-xs text-white/30 bg-white/5 px-1.5 py-0.5 rounded">input</span>
                  </div>
                  <span className="text-white/70">/download https://youtu.be/dQw4w9WgXcQ</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">L</div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-white/90">lazydlp</span>
                    <span className="text-xs text-white/30 bg-white/5 px-1.5 py-0.5 rounded">yt-dlp</span>
                  </div>
                  <span className="text-white/70">Starting download for: https://youtu.be/dQw4w9WgXcQ</span>
                  <span className="text-white/50 mt-1">Progress: [<span className="text-primaryBright">█████████████░░░░░░░░░░░░░░░</span>] 45% | Speed: 12.4MiB/s | ETA: 00:03</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-white/40 text-sm mt-6 font-medium">
            Commands process immediately, sending media directly to your chosen folder.
          </p>
        </section>

        {/* Divider */}
        <div className="glow-line my-16 opacity-30" />

        {/* What it does section */}
        <section id="features" className="py-16 flex flex-col items-start">
          <div className="flex items-center gap-2 text-primary font-medium text-sm mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Features
          </div>
          <h2 className="text-5xl font-serif text-white tracking-tight mb-4">
            What it <span className="italic">does.</span>
          </h2>
          <p className="text-white/50 text-lg mb-16">
            Everything the CLI does today. No dashboards, no setup screens.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-card/30 border border-card-border/50 hover:bg-card/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-card border border-card-border flex items-center justify-center text-white/70">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </div>
              <h3 className="text-white font-semibold mt-2">Zero-config downloads</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Run /download with any supported URL. The media is instantly fetched in the highest available quality.
              </p>
            </div>

            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-card/30 border border-card-border/50 hover:bg-card/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-card border border-card-border flex items-center justify-center text-white/70">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <h3 className="text-white font-semibold mt-2">Automated environment</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Missing dependencies? /configure automatically resolves and fetches the right binaries for your OS.
              </p>
            </div>

            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-card/30 border border-card-border/50 hover:bg-card/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-card border border-card-border flex items-center justify-center text-white/70">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <h3 className="text-white font-semibold mt-2">Persistent directories</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Use /setdir once. Lazydlp remembers your workspace locally so you never have to specify paths again.
              </p>
            </div>
          </div>
        </section>
        
        {/* Divider */}
        <div className="glow-line my-8 opacity-30" />
      </main>
      
      {/* Footer */}
      <footer className="w-full border-t border-card-border/50 bg-[#0a0a0a] py-12 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="flex flex-col gap-4 max-w-[280px]">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
              <span className="text-primaryBright flex flex-col leading-[0.6] text-[0.85em]">
                <span>▶</span><span>▼</span>
              </span> lazydlp
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              A blazing fast client for your terminal. Download media safely and efficiently.
            </p>
          </div>
          
          <div className="flex gap-16">
            <div className="flex flex-col gap-4">
              <span className="text-white font-semibold text-sm">Project</span>
              <a href="https://github.com/devalentineomonya/lazydlp" className="text-white/50 hover:text-white text-sm transition-colors">GitHub</a>
              <a href="#commands" className="text-white/50 hover:text-white text-sm transition-colors">Commands</a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-white font-semibold text-sm">Legal</span>
              <a href="#" className="text-white/50 hover:text-white text-sm transition-colors">Privacy</a>
              <a href="#" className="text-white/50 hover:text-white text-sm transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
