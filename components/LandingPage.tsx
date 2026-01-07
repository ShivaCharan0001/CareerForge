
import { ArrowRight, CheckCircle2, Code, Globe, Layout, Lock, Shield, Star, TrendingUp, Users, Zap } from 'lucide-react';
import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/30 overflow-x-hidden">
      {/* --- Navbar --- */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-orange-600 to-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
               <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">CareerForge</span>
          </div>
          {/* Links removed as requested */}
          <div className="flex items-center space-x-4">
            <button onClick={onLogin} className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
              Log In
            </button>
            <button 
              onClick={onGetStarted}
              className="bg-white text-slate-950 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-200 transition-all transform hover:scale-105 shadow-lg shadow-white/10"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-orange-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Hero Copy */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium text-slate-300">AI-Powered Career Architect v2.0</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                Your Career, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-amber-400">
                  On Autopilot.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                CareerForge scans the job market, analyzes your profile, and generates a personalized curriculum and interview strategy to land your dream role.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={onGetStarted}
                  className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_40px_rgba(234,88,12,0.4)] hover:shadow-[0_0_60px_rgba(234,88,12,0.6)] transition-all flex items-center justify-center group"
                >
                  Analyze My Resume <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="mt-10 flex items-center justify-center lg:justify-start space-x-6 text-slate-500 text-sm font-medium">
                <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> No credit card required</div>
                <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> 10,000+ plans generated</div>
              </div>
            </div>

            {/* Hero Visual (Mock UI) */}
            <div className="lg:w-1/2 relative perspective-1000">
              <div className="relative transform lg:rotate-y-[-10deg] lg:rotate-x-[5deg] transition-transform duration-500 hover:rotate-0">
                 {/* Decorative Glow */}
                 <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur opacity-30"></div>
                 
                 {/* Main Dashboard Mockup */}
                 <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden aspect-[4/3]">
                    {/* Mock Header */}
                    <div className="h-12 border-b border-slate-800 bg-slate-900/50 flex items-center px-4 space-x-2">
                       <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                       <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                       <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                       <div className="flex-1"></div>
                       <div className="h-2 w-20 bg-slate-800 rounded-full"></div>
                    </div>
                    {/* Mock Body */}
                    <div className="flex h-full">
                       {/* Mock Sidebar */}
                       <div className="w-16 border-r border-slate-800 bg-slate-900/30 flex flex-col items-center py-4 space-y-4">
                          <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30"></div>
                          <div className="w-8 h-8 rounded-lg bg-slate-800"></div>
                          <div className="w-8 h-8 rounded-lg bg-slate-800"></div>
                          <div className="w-8 h-8 rounded-lg bg-slate-800"></div>
                       </div>
                       {/* Mock Content */}
                       <div className="flex-1 p-6 space-y-6 bg-slate-950/50">
                          <div className="flex justify-between items-end">
                             <div className="space-y-2">
                                <div className="h-3 w-32 bg-slate-800 rounded-full"></div>
                                <div className="h-6 w-48 bg-slate-700 rounded-md"></div>
                             </div>
                             <div className="h-10 w-10 bg-emerald-500/20 rounded-full border border-emerald-500/30 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                             </div>
                          </div>
                          
                          {/* Mock Charts/Cards */}
                          <div className="grid grid-cols-2 gap-4">
                             <div className="col-span-2 h-24 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-4 relative overflow-hidden">
                                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-orange-500/10 blur-xl"></div>
                                <div className="h-2 w-20 bg-slate-700 rounded mb-2"></div>
                                <div className="flex items-end space-x-2 h-10 mt-2">
                                   <div className="w-8 bg-orange-600 rounded-t h-full"></div>
                                   <div className="w-8 bg-slate-700 rounded-t h-3/4"></div>
                                   <div className="w-8 bg-slate-700 rounded-t h-1/2"></div>
                                </div>
                             </div>
                             <div className="h-24 bg-slate-900 border border-slate-800 rounded-xl p-3">
                                <div className="h-8 w-8 rounded-full bg-red-500/20 mb-2"></div>
                                <div className="h-2 w-16 bg-slate-700 rounded"></div>
                             </div>
                             <div className="h-24 bg-slate-900 border border-slate-800 rounded-xl p-3">
                                <div className="h-8 w-8 rounded-full bg-blue-500/20 mb-2"></div>
                                <div className="h-2 w-16 bg-slate-700 rounded"></div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Floating Elements */}
                 <div className="absolute -right-6 top-10 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl flex items-center space-x-3 animate-bounce duration-[3000ms]">
                    <div className="bg-emerald-500/20 p-2 rounded-lg"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>
                    <div>
                       <div className="text-xs text-slate-400">Readiness Score</div>
                       <div className="text-sm font-bold text-white">Top 5% Candidate</div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- How It Works --- */}
      <section id="how-it-works" className="py-24 relative border-t border-white/5">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
               <h2 className="text-3xl md:text-5xl font-bold mb-6">From <span className="text-orange-400">Lost</span> to <span className="text-emerald-400">Hired</span> in 3 Steps</h2>
               <p className="text-lg text-slate-400">Most career advice is generic. We build a custom operating system for your professional growth.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {[
                  {
                     icon: <Layout className="w-8 h-8 text-orange-400" />,
                     title: "1. Scan & Analyze",
                     desc: "Upload your resume and target role. We analyze your profile against millions of job descriptions to find your exact gaps.",
                     color: "orange"
                  },
                  {
                     icon: <Code className="w-8 h-8 text-red-400" />,
                     title: "2. Build & Learn",
                     desc: "Get a 2-week sprint plan with curated courses, reading materials, and portfolio-ready project ideas tailored to you.",
                     color: "red"
                  },
                  {
                     icon: <Shield className="w-8 h-8 text-emerald-400" />,
                     title: "3. Practice & Apply",
                     desc: "Master the interview with our AI hiring manager and scan the live market for jobs where you're a 90%+ match.",
                     color: "emerald"
                  }
               ].map((step, idx) => (
                  <div key={idx} className="relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group">
                     <div className={`w-16 h-16 rounded-2xl bg-${step.color}-500/10 flex items-center justify-center mb-6 border border-${step.color}-500/20 group-hover:scale-110 transition-transform`}>
                        {step.icon}
                     </div>
                     <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                     <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                     
                     {/* Connecting Line (Desktop) */}
                     {idx !== 2 && (
                        <div className="hidden md:block absolute top-16 -right-4 w-8 border-t-2 border-dashed border-slate-700 z-10"></div>
                     )}
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- Features Bento Grid --- */}
      <section id="features" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need to <br/>level up your career.</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Card */}
            <div className="md:col-span-2 bg-gradient-to-br from-orange-900/50 to-slate-900 border border-orange-500/20 rounded-3xl p-8 md:p-12 relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-6">
                     <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Autonomous Learning Plans</h3>
                  <p className="text-slate-300 text-lg max-w-md">Stop doom-scrolling tutorials. We generate a structured 2-week sprint with exact resources to close your skill gaps efficiently.</p>
               </div>
               <div className="absolute right-0 bottom-0 w-1/2 h-full bg-orange-500/10 blur-[100px]"></div>
               <div className="absolute -right-10 -bottom-10 opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500">
                  {/* Abstract shapes representing a plan */}
                  <div className="w-64 h-48 bg-slate-900 border border-slate-700 rounded-tl-3xl p-6">
                     <div className="space-y-3">
                        <div className="h-4 w-32 bg-slate-700 rounded"></div>
                        <div className="h-2 w-full bg-slate-800 rounded"></div>
                        <div className="h-2 w-2/3 bg-slate-800 rounded"></div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Tall Card */}
            <div className="md:row-span-2 bg-slate-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-orange-500/30 transition-all">
               <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-emerald-400" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-4">AI Role-Play</h3>
               <p className="text-slate-400 mb-8">Practice technical and behavioral questions with an AI that mimics your target hiring manager.</p>
               
               <div className="space-y-4">
                  {[1,2,3].map(i => (
                     <div key={i} className="bg-slate-800/50 p-3 rounded-xl border border-white/5 flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <div className="h-2 w-24 bg-slate-700 rounded"></div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Small Card */}
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 hover:bg-white/5 transition-all">
               <Code className="w-8 h-8 text-red-400 mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">Project Generator</h3>
               <p className="text-slate-400 text-sm">Don't have experience? We generate portfolio project ideas with full tech specs.</p>
            </div>

            {/* Small Card */}
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 hover:bg-white/5 transition-all">
               <Globe className="w-8 h-8 text-amber-400 mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">Market Trends</h3>
               <p className="text-slate-400 text-sm">Real-time salary data and skill demand analysis for your role.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Testimonials --- */}
      <section id="reviews" className="py-24 border-t border-white/5">
         <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16">Career growth unlocked</h2>
            <div className="grid md:grid-cols-3 gap-8">
               {[
                  {
                     quote: "I was stuck in tutorial hell for months. CareerForge gave me a 2-week plan, I built the project, and got hired.",
                     role: "Junior Dev",
                     name: "Alex M."
                  },
                  {
                     quote: "The mock interview feature is scary good. It asked the exact same question I got in my real interview.",
                     role: "Product Manager",
                     name: "Sarah J."
                  },
                  {
                     quote: "Finally, a tool that tells me exactly what I'm missing instead of generic advice like 'learn React'.",
                     role: "Frontend Engineer",
                     name: "David K."
                  }
               ].map((t, i) => (
                  <div key={i} className="bg-white/5 p-8 rounded-2xl border border-white/5">
                     <div className="flex space-x-1 text-amber-400 mb-4">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                     </div>
                     <p className="text-slate-300 mb-6 italic">"{t.quote}"</p>
                     <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-500">
                           {t.name[0]}
                        </div>
                        <div>
                           <div className="text-white font-bold text-sm">{t.name}</div>
                           <div className="text-slate-500 text-xs">{t.role}</div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-20">
         <div className="max-w-5xl mx-auto px-6">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
               <div className="relative z-10">
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to accelerate your career?</h2>
                  <p className="text-orange-100 text-lg mb-10 max-w-2xl mx-auto">Join thousands of professionals who are landing their dream jobs faster with CareerForge.</p>
                  <button 
                     onClick={onGetStarted}
                     className="bg-white text-orange-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all shadow-xl hover:shadow-2xl"
                  >
                     Build My Career Plan
                  </button>
               </div>
               
               {/* Background patterns */}
               <div className="absolute top-0 left-0 w-full h-full opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                     <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                  </svg>
               </div>
            </div>
         </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 border-t border-white/10 bg-slate-950">
         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
               <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                     <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">CareerForge</span>
               </div>
               <p className="text-slate-400 max-w-sm">
                  Your autonomous AI career operating system. Analyze, plan, and practice your way to success.
               </p>
            </div>
            <div>
               <h4 className="text-white font-bold mb-4">Product</h4>
               <ul className="space-y-2 text-slate-400 text-sm">
                  <li><a href="#" className="hover:text-orange-400">Resume Analyzer</a></li>
                  <li><a href="#" className="hover:text-orange-400">Learning Plans</a></li>
                  <li><a href="#" className="hover:text-orange-400">Interview Simulator</a></li>
                  <li><a href="#" className="hover:text-orange-400">Job Scanner</a></li>
               </ul>
            </div>
            <div>
               <h4 className="text-white font-bold mb-4">Legal</h4>
               <ul className="space-y-2 text-slate-400 text-sm">
                  <li><a href="#" className="hover:text-orange-400">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-orange-400">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-orange-400">Cookie Policy</a></li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} CareerForge AI. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
               <a href="#" className="hover:text-white"><Globe className="w-4 h-4" /></a>
               <a href="#" className="hover:text-white"><Lock className="w-4 h-4" /></a>
            </div>
         </div>
      </footer>
    </div>
  );
};

// Helper Icon for play button
const PlayCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
);

export default LandingPage;
