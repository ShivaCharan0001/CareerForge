import { Chat } from '@google/genai';
import {
    AlertCircle,
    ArrowRight,
    Award,
    BookOpen,
    Bot,
    Briefcase,
    CheckCircle,
    ChevronRight,
    Clock,
    Code,
    DollarSign,
    ExternalLink,
    FileText,
    Layers,
    Loader2,
    Lock,
    LogIn,
    Mail,
    MapPin,
    MessageSquare,
    Mic,
    Newspaper,
    Play,
    PlayCircle,
    Plus,
    RefreshCw,
    Search,
    Send,
    Target,
    Trash2,
    TrendingUp,
    UploadCloud,
    User,
    UserPlus,
    Volume2,
    VolumeX,
    X,
    Youtube
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import DashboardCards from './components/DashboardCards';
import LandingPage from './components/LandingPage';
import SkillsContainer from './components/SkillsContainer';
import TopNavigation from './components/TopNavigation';
import { AuthService } from './services/authService';
import {
    analyzeProfile,
    createInterviewSession,
    fetchMarketTrends,
    findMatchingJobs,
    generateInterviewFeedback,
    generateLearningPlan,
    generateProjectIdeas
} from './services/gemini';
import {
    AppView,
    CareerAnalysis,
    ChatMessage,
    InterviewFeedback,
    JobListing,
    MarketTrend,
    ProjectIdea,
    UserProfile,
    WeeklyPlan
} from './types';

const App = () => {
  // --- Global State ---
  const [view, setView] = useState<AppView>(AppView.LANDING);
  
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  
  // Auth Form State
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // User Data State
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: 'User', targetRole: '' });
  const [analysis, setAnalysis] = useState<CareerAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Learning Plan
  const [plan, setPlan] = useState<WeeklyPlan[] | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [addingTaskWeek, setAddingTaskWeek] = useState<number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<'course' | 'project' | 'reading'>('reading');
  const [newTaskHours, setNewTaskHours] = useState(1);
  
  // Jobs
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isScanningJobs, setIsScanningJobs] = useState(false);
  const [scannerStep, setScannerStep] = useState<string>('');
  
  // Projects
  const [projects, setProjects] = useState<ProjectIdea[]>([]);
  const [isGeneratingProjects, setIsGeneratingProjects] = useState(false);

  // Trends
  const [trends, setTrends] = useState<MarketTrend | null>(null);
  const [isFetchingTrends, setIsFetchingTrends] = useState(false);

  // Interview
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatInstance, setChatInstance] = useState<Chat | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [interviewFeedback, setInterviewFeedback] = useState<InterviewFeedback | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Error states for retry functionality
  const [planError, setPlanError] = useState<string | null>(null);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [trendsError, setTrendsError] = useState<string | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // --- Persistence Effects ---

  // Save state on critical updates ONLY if logged in
  useEffect(() => {
    if (isLoggedIn && currentUserEmail) {
      AuthService.saveUserData(currentUserEmail, {
        userProfile,
        analysis,
        plan,
        jobs,
        projects,
        trends,
        chatMessages,
        interviewFeedback
      });
    }
  }, [
    isLoggedIn, 
    currentUserEmail, 
    userProfile, 
    analysis, 
    plan, 
    jobs, 
    projects, 
    trends, 
    chatMessages, 
    interviewFeedback
  ]);

  // CRITICAL FIX: Cancel audio when switching views
  useEffect(() => {
    if (view !== AppView.INTERVIEW) {
      window.speechSynthesis.cancel();
      setIsListening(false);
      setIsInterviewStarted(false); 
      setInterviewFeedback(null);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [view]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Initial scan when entering views
  useEffect(() => {
    if (view === AppView.JOBS && jobs?.length === 0) {
      handleScanJobs();
    }
    if (view === AppView.PROJECTS && projects?.length === 0) {
      handleGenerateProjects();
    }
    if (view === AppView.TRENDS && !trends) {
      handleFetchTrends();
    }
  }, [view]);

  // --- Helpers ---
  const handleApiError = (error: any, defaultMsg: string, errorSetter?: (msg: string | null) => void) => {
    console.error(error);
    if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      const msg = "AI system is experiencing high traffic. Please wait 60 seconds and try again.";
      if (errorSetter) {
        errorSetter(msg);
      } else {
        alert(msg);
      }
    } else {
      const msg = `${defaultMsg}: ${error.message || "Unknown error"}.`;
      if (errorSetter) {
        errorSetter(msg);
      } else {
        alert(msg);
      }
    }
  };

  // --- Auth Handlers ---

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    // Validation
    if (!AuthService.isValidEmail(emailInput)) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (!AuthService.isValidPassword(passwordInput)) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    if (authMode === 'signup') {
      const result = AuthService.signup(emailInput, passwordInput);
      if (result.success) {
        // Auto login after signup
        loginUser(emailInput);
      } else {
        setAuthError(result.message || 'Signup failed.');
      }
    } else {
      const result = AuthService.login(emailInput, passwordInput);
      if (result.success) {
        loginUser(emailInput);
      } else {
        setAuthError(result.message || 'Login failed.');
      }
    }
  };

  const loginUser = (email: string) => {
    const userData = AuthService.getUserData(email);
    if (userData) {
      // Hydrate State
      setCurrentUserEmail(email);
      setIsLoggedIn(true);
      setShowAuthModal(false);
      
      setUserProfile(userData.userProfile);
      setAnalysis(userData.analysis);
      setPlan(userData.plan);
      setJobs(userData.jobs || []);
      setProjects(userData.projects || []);
      setTrends(userData.trends);
      setChatMessages(userData.chatMessages || []);
      setInterviewFeedback(userData.interviewFeedback);

      // Route Logic
      if (userData.analysis) {
        setView(AppView.DASHBOARD);
      } else {
        setView(AppView.ONBOARDING);
      }
    } else {
        setAuthError("Critical error loading user data.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUserEmail('');
    
    // Reset all local state
    setUserProfile({ name: 'User', targetRole: '' });
    setAnalysis(null);
    setPlan(null);
    setJobs([]);
    setProjects([]);
    setTrends(null);
    setChatMessages([]);
    setInterviewFeedback(null);
    
    setView(AppView.LANDING);
  };

  const handleResetData = () => {
    if (!currentUserEmail) return;
    if (window.confirm("Are you sure? This will delete your resume, learning plan, and progress PERMANENTLY.")) {
        // Create fresh empty data
        const emptyData = {
            userProfile: { name: userProfile.name, targetRole: '' },
            analysis: null,
            plan: null,
            jobs: [],
            projects: [],
            trends: null,
            chatMessages: [],
            interviewFeedback: null
        };
        // Save empty data to storage
        AuthService.saveUserData(currentUserEmail, emptyData);
        // Hydrate state with empty data
        setUserProfile(emptyData.userProfile);
        setAnalysis(null);
        setPlan(null);
        setJobs([]);
        setProjects([]);
        setTrends(null);
        setChatMessages([]);
        setInterviewFeedback(null);
        setView(AppView.ONBOARDING);
    }
  };

  const handleSwitchTrack = () => {
    if (window.confirm("This will start a new career track but keep your resume. Are you sure?")) {
      setUserProfile(prev => ({ ...prev, targetRole: '' }));
      setAnalysis(null);
      setPlan(null);
      setJobs([]);
      setProjects([]);
      setTrends(null);
      setChatMessages([]);
      setInterviewFeedback(null);
      setView(AppView.ONBOARDING);
    }
  };

  // --- App Logic Handlers ---

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size too large. Please upload a PDF smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        setUserProfile(prev => ({
          ...prev,
          resumeFile: {
            data: base64String,
            mimeType: file.type
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!userProfile?.resumeText && !userProfile?.resumeFile) || !userProfile?.targetRole) return;

    setIsAnalyzing(true);
    setAnalyzeError(null);
    try {
      const result = await analyzeProfile(
        { text: userProfile.resumeText, file: userProfile.resumeFile }, 
        userProfile.targetRole
      );
      setAnalysis(result);
      setView(AppView.DASHBOARD);
    } catch (error: any) {
      handleApiError(error, "Analysis failed", setAnalyzeError);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!analysis || !userProfile) return;
    setIsGeneratingPlan(true);
    setPlanError(null);
    try {
      // Safe access: analysis.skills might be missing if AI failed partially
      const missingSkills = analysis.skills?.filter(s => s.status === 'missing').map(s => s.name) || [];
      const isRegenerate = !!plan;
      const generatedPlan = await generateLearningPlan(userProfile.targetRole, missingSkills, isRegenerate);
      setPlan(generatedPlan);
      setView(AppView.PLAN);
    } catch (error: any) {
      handleApiError(error, "Failed to generate plan", setPlanError);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleDeleteTask = (weekIndex: number, taskId: string) => {
    if (!plan) return;
    const newPlan = [...plan];
    newPlan[weekIndex].tasks = newPlan[weekIndex].tasks.filter(t => t.id !== taskId);
    setPlan(newPlan);
  };

  const handleMarkDone = (weekIndex: number, taskId: string) => {
    if (!plan) return;
    const newPlan = [...plan];
    const task = newPlan[weekIndex].tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      setPlan(newPlan);
    }
  };

  const handleAddTask = (weekIndex: number) => {
    if (!plan || !newTaskTitle.trim()) return;
    const newPlan = [...plan];
    newPlan[weekIndex].tasks.push({
      id: Date.now().toString(),
      title: newTaskTitle,
      description: 'Manually added task',
      type: newTaskType,
      estimatedHours: newTaskHours,
      completed: false
    });
    setPlan(newPlan);
    setAddingTaskWeek(null);
    setNewTaskTitle('');
    setNewTaskHours(1);
  };

  const handleScanJobs = async () => {
    if (!analysis || !userProfile) return;
    setIsScanningJobs(true);
    setJobsError(null);
    setScannerStep('Initializing scan...');
    
    // Simulate loading steps to improve UX
    const steps = ['Searching global job boards...', 'Filtering for your skills...', 'Analyzing salary data...', 'Finalizing matches...'];
    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setScannerStep(steps[stepIdx]);
        stepIdx++;
      }
    }, 1500);

    try {
      const allSkills = analysis.skills?.map(s => s.name) || [];
      const foundJobs = await findMatchingJobs(userProfile.targetRole, allSkills);
      setJobs(foundJobs);
    } catch (error: any) {
      handleApiError(error, "Failed to scan jobs", setJobsError);
    } finally {
      clearInterval(interval);
      setIsScanningJobs(false);
    }
  };

  const handleGenerateProjects = async () => {
    if (!userProfile?.targetRole) return;
    setIsGeneratingProjects(true);
    setProjectsError(null);
    try {
      const ideas = await generateProjectIdeas(userProfile.targetRole);
      setProjects(ideas);
    } catch (error) {
       handleApiError(error, "Failed to generate projects", setProjectsError);
    } finally {
      setIsGeneratingProjects(false);
    }
  };

  const handleFetchTrends = async () => {
    if (!userProfile?.targetRole) return;
    setIsFetchingTrends(true);
    setTrendsError(null);
    try {
      const data = await fetchMarketTrends(userProfile.targetRole);
      setTrends(data);
    } catch (error) {
       handleApiError(error, "Failed to fetch trends", setTrendsError);
    } finally {
      setIsFetchingTrends(false);
    }
  };

  const startInterview = useCallback(async () => {
    if (!userProfile?.targetRole) {
        alert("Please define a target role first.");
        return;
    }
    
    setIsInterviewStarted(true);
    setInterviewFeedback(null);
    setChatMessages([]);
    setIsChatLoading(true);

    try {
        const chat = createInterviewSession(userProfile.targetRole);
        setChatInstance(chat);

        // Send a hidden system-like prompt to kickstart the model
        const response = await chat.sendMessage({ message: "Start the interview. Introduce yourself briefly and ask the first question." });
        const text = response.text || "Hello! I'm ready to interview you. Tell me about yourself.";
        
        setChatMessages([{
            id: Date.now().toString(),
            role: 'model',
            text: text,
            timestamp: Date.now()
        }]);
        
        if (isSpeakingEnabled) speakText(text);
    } catch (err: any) {
        setIsInterviewStarted(false);
        setChatInstance(null);
        handleApiError(err, "Failed to start interview");
    } finally {
        setIsChatLoading(false);
    }
  }, [userProfile, isSpeakingEnabled]);

  const handleEndInterview = async () => {
    if (chatMessages.length < 2) {
      setIsInterviewStarted(false);
      setChatMessages([]);
      return;
    }
    
    window.speechSynthesis.cancel();
    setIsInterviewStarted(false);
    setIsGeneratingFeedback(true);
    
    try {
      const feedback = await generateInterviewFeedback(chatMessages, userProfile.targetRole);
      setInterviewFeedback(feedback);
    } catch (error) {
      handleApiError(error, "Failed to generate feedback");
      setChatMessages([]);
    } finally {
      setIsGeneratingFeedback(false);
      setChatInstance(null);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || !chatInstance) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: chatInput,
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const result = await chatInstance.sendMessage({ message: userMsg.text });
      const text = result.text || "I didn't catch that. Could you please repeat?";
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text,
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, botMsg]);
      if (isSpeakingEnabled) speakText(text);
    } catch (error) {
      // Add error message to chat
      setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: "I'm having trouble connecting right now (High Traffic). Please try again in a moment.",
          timestamp: Date.now()
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser does not support Speech Recognition");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };


  // --- Landing View ---
  if (view === AppView.LANDING) {
    return (
      <>
        <LandingPage 
          onGetStarted={() => {
            if (isLoggedIn) {
               setView(analysis ? AppView.DASHBOARD : AppView.ONBOARDING);
            } else {
               setAuthMode('signup');
               setShowAuthModal(true);
            }
          }} 
          onLogin={() => {
            if (isLoggedIn) {
               setView(analysis ? AppView.DASHBOARD : AppView.ONBOARDING);
            } else {
               setAuthMode('login');
               setShowAuthModal(true);
            }
          }}
        />
        {showAuthModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
              <button 
                onClick={() => {
                    setShowAuthModal(false);
                    setAuthError('');
                    setEmailInput('');
                    setPasswordInput('');
                }}
                className="absolute top-4 right-4 text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6 text-center">
                 <h2 className="text-2xl font-bold text-white mb-2">
                    {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                 </h2>
                 <p className="text-slate-400 text-sm">
                    {authMode === 'login' 
                        ? 'Enter your credentials to access your career plan.' 
                        : 'Join CareerForge to start your journey.'}
                 </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                   <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Email Address</label>
                   <div className="relative">
                       <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                       <input 
                        type="email" 
                        required 
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 pl-10 text-white outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder-slate-600"
                        placeholder="you@example.com"
                       />
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Password</label>
                   <div className="relative">
                       <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                       <input 
                        type="password" 
                        required 
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 pl-10 text-white outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder-slate-600"
                        placeholder="••••••••"
                       />
                   </div>
                </div>

                {authError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{authError}</span>
                    </div>
                )}

                <button 
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center space-x-2"
                >
                  {authMode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                 <button 
                    onClick={() => {
                        setAuthMode(authMode === 'login' ? 'signup' : 'login');
                        setAuthError('');
                    }}
                    className="text-sm text-slate-400 hover:text-orange-400 transition-colors"
                 >
                    {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                 </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // --- Onboarding View ---
  if (view === AppView.ONBOARDING) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 max-w-2xl w-full rounded-2xl shadow-2xl shadow-black/50 p-8 border border-slate-800 relative">
          {/* Back to Login if stuck */}
          <button 
             onClick={handleLogout}
             className="absolute top-6 right-6 text-slate-500 hover:text-white flex items-center text-sm"
          >
             <User className="w-4 h-4 mr-2" /> {userProfile.name} (Logout)
          </button>

          <div className="flex items-center space-x-3 mb-8">
             <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-100">Setup your Pilot</h1>
          </div>
          
          <form onSubmit={handleOnboardingSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Target Role</label>
              <input 
                type="text" 
                required
                className="w-full p-4 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none placeholder-slate-600"
                placeholder="e.g. Senior Frontend Engineer, Product Manager..."
                value={userProfile.targetRole}
                onChange={e => setUserProfile(prev => ({ ...prev, targetRole: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* File Upload Option */}
               <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${userProfile.resumeFile ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 hover:border-orange-500 hover:bg-slate-800'}`}>
                  <input 
                    type="file" 
                    accept=".pdf,.txt,.md" 
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                    {userProfile.resumeFile ? (
                      <>
                        <FileText className="w-8 h-8 text-emerald-400 mb-2" />
                        <span className="text-sm font-medium text-emerald-300">Resume Stored</span>
                        <span className="text-xs text-emerald-500/70 mt-1">Ready to analyze</span>
                      </>
                    ) : (
                      <>
                         <UploadCloud className="w-8 h-8 text-orange-400 mb-2" />
                         <span className="text-sm font-medium text-slate-300">Upload PDF / TXT</span>
                         <span className="text-xs text-slate-500 mt-1">Drag & drop or click</span>
                      </>
                    )}
                  </label>
               </div>
               
               {/* Or Text Paste Option */}
               <div className="relative">
                 <textarea 
                   className="w-full h-full min-h-[140px] p-4 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none resize-none font-mono text-xs placeholder-slate-600"
                   placeholder="Or paste text directly here..."
                   value={userProfile.resumeText || ''}
                   onChange={e => setUserProfile(prev => ({ ...prev, resumeText: e.target.value }))}
                 />
               </div>
            </div>

            <button 
              type="submit" 
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Profile...</span>
                </>
              ) : (
                <>
                  <span>Launch Career Analysis</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            {analyzeError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm mb-2">{analyzeError}</p>
                <button 
                  onClick={handleOnboardingSubmit}
                  className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Retry Analysis
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  // --- Main App Layout ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navigation */}
      <TopNavigation
        currentView={view}
        onChangeView={setView}
        onLogout={handleLogout}
        onSwitchTrack={handleSwitchTrack}
        onReset={handleResetData}
        userName={userProfile.name}
      />

      {/* Main Content */}
      <main className="min-h-screen bg-slate-950 relative">
        {/* Background Gradients */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-900/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-red-900/5 blur-[120px] rounded-full"></div>
          <div className="absolute top-[50%] left-[50%] w-[300px] h-[300px] bg-slate-800/20 blur-[100px] rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
              {view === AppView.DASHBOARD && 'Dashboard'}
              {view === AppView.PLAN && 'Learning Plan'}
              {view === AppView.PROJECTS && 'Build Portfolio'}
              {view === AppView.TRENDS && 'Market Insights'}
              {view === AppView.INTERVIEW && 'Interview Simulator'}
              {view === AppView.JOBS && 'Market Scanner'}
            </h1>
            <p className="text-slate-400 text-lg">Target Role: <span className="text-orange-400 font-semibold">{userProfile.targetRole}</span></p>
          </header>

          {/* Dashboard View */}
          {view === AppView.DASHBOARD && analysis && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Three-Card Row */}
              <DashboardCards
                analysis={analysis}
                plan={plan}
                targetRole={userProfile.targetRole}
              />

              {/* Skills Container */}
              <SkillsContainer
                analysis={analysis}
                onGeneratePlan={handleGeneratePlan}
                isGeneratingPlan={isGeneratingPlan}
                planError={planError}
              />
            </div>
          )}

          {/* Learning Plan View */}
          {view === AppView.PLAN && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {!plan && !isGeneratingPlan && (
                  <div className="text-center py-24 bg-slate-900/60 backdrop-blur-xl rounded-[24px] border border-slate-700/50 shadow-2xl shadow-slate-900/30">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Plan Generated Yet</h3>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">Create a personalized curriculum based on your skill gaps using our AI architect.</p>
                    <button 
                      onClick={handleGeneratePlan}
                      className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-500 transition-colors shadow-lg shadow-orange-500/20"
                    >
                      Generate Plan Now
                    </button>
                  </div>
              )}
              
              {isGeneratingPlan && (
                  <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                    <p className="text-slate-300 font-medium text-lg">Designing your curriculum...</p>
                  </div>
              )}

              {!plan && !isGeneratingPlan && (
                  <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <BookOpen className="w-16 h-16 text-slate-600" />
                    <p className="text-slate-400 font-medium text-lg text-center">No learning plan generated yet</p>
                    <p className="text-slate-500 text-sm text-center max-w-md">Get started by analyzing your profile and generating a personalized learning path tailored to your career goals.</p>
                  </div>
              )}

              {plan && (
                  <div className="space-y-8">
                    {plan?.map((week, idx) => (
                        <div key={week.weekNumber} className="bg-slate-900/60 backdrop-blur-xl rounded-[24px] border border-slate-700/50 shadow-2xl shadow-slate-900/30 overflow-hidden">
                          <div className="bg-white/5 px-8 py-5 border-b border-white/5 flex justify-between items-center">
                              <div>
                                <h3 className="text-xl font-bold text-white">Learning Path</h3>
                                <p className="text-sm text-orange-300 mt-1 font-medium">{week.theme}</p>
                              </div>
                          </div>
                          <div className="divide-y divide-white/5">
                              {week.tasks?.map((task) => (
                                <div key={task.id} className="p-8 hover:bg-white/5 transition-colors group relative">
                                    <div className="flex items-start space-x-6">
                                      <div className={`p-3 rounded-xl shrink-0 ${
                                          task.type === 'project' ? 'bg-red-500/20 text-red-300' :
                                          task.type === 'course' ? 'bg-blue-500/20 text-blue-300' :
                                          'bg-amber-500/20 text-amber-300'
                                      }`}>
                                          {task.type === 'project' ? <Briefcase className="w-6 h-6"/> : 
                                          task.type === 'course' ? <PlayCircle className="w-6 h-6"/> : 
                                          <BookOpen className="w-6 h-6"/>}
                                      </div>
                                      <div className="flex-1">
                                          <div className="flex justify-between items-start">
                                            <h4 className={`text-lg font-bold mb-2 flex items-center ${task.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                                              {task.title}
                                              {task.completed && <CheckCircle className="w-5 h-5 ml-2 text-green-400" />}
                                            </h4>
                                            <span className="text-xs font-bold px-2 py-1 bg-white/10 rounded text-slate-400 flex items-center">
                                                <Clock className="w-3 h-3 mr-1.5" />
                                                {task.estimatedHours}h
                                            </span>
                                          </div>
                                          <p className="text-sm text-slate-400 mb-4 leading-relaxed">{task.description}</p>
                                          
                                          {/* Resource Links */}
                                          <div className="flex flex-wrap gap-2">
                                            <a 
                                              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(task.videoQuery)}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="inline-flex items-center text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 transition-colors"
                                            >
                                              <Youtube className="w-3 h-3 mr-2" /> Watch Tutorial
                                            </a>
                                            <a 
                                              href={`https://www.udemy.com/courses/search/?q=${encodeURIComponent(task.udemyQuery)}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="inline-flex items-center text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 transition-colors"
                                            >
                                              <BookOpen className="w-3 h-3 mr-2" /> Udemy Course
                                            </a>
                                            <a 
                                              href={`https://www.coursera.org/search?query=${encodeURIComponent(task.courseraQuery)}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="inline-flex items-center text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 transition-colors"
                                            >
                                              <PlayCircle className="w-3 h-3 mr-2" /> Coursera Course
                                            </a>
                                          </div>

                                          <button 
                                            onClick={() => handleMarkDone(idx, task.id)}
                                            className="ml-4 text-xs font-bold text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center hover:text-orange-300"
                                          >
                                            {task.completed ? 'Mark Undone' : 'Mark Done'} <ChevronRight className="w-3 h-3 ml-1" />
                                          </button>
                                      </div>
                                      <button 
                                        onClick={() => handleDeleteTask(idx, task.id)}
                                        className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-400 transition-all"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                </div>
                              ))}
                              
                              {/* Add Task UI */}
                              <div className="p-4 bg-white/5">
                                {addingTaskWeek === idx ? (
                                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-4">
                                      <input 
                                        type="text" 
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        placeholder="Task title..."
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-orange-500 outline-none"
                                      />
                                      <div className="flex space-x-3">
                                        <select 
                                          value={newTaskType}
                                          onChange={(e) => setNewTaskType(e.target.value as any)}
                                          className="bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-300 outline-none"
                                        >
                                          <option value="reading">Reading</option>
                                          <option value="course">Course</option>
                                          <option value="project">Project</option>
                                        </select>
                                        <input 
                                          type="number" 
                                          value={newTaskHours}
                                          onChange={(e) => setNewTaskHours(Number(e.target.value))}
                                          min={0.5}
                                          step={0.5}
                                          className="w-24 bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none"
                                        />
                                        <div className="flex-1"></div>
                                        <button 
                                          onClick={() => setAddingTaskWeek(null)}
                                          className="p-3 text-slate-400 hover:text-white"
                                        >
                                          <X className="w-5 h-5" />
                                        </button>
                                        <button 
                                          onClick={() => handleAddTask(idx)}
                                          className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold rounded-xl"
                                        >
                                          Add Task
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => setAddingTaskWeek(idx)}
                                    className="w-full py-3 flex items-center justify-center text-sm font-medium text-slate-500 hover:text-orange-400 border border-dashed border-white/10 hover:border-orange-500/50 rounded-xl transition-all"
                                  >
                                    <Plus className="w-4 h-4 mr-2" /> Add Custom Task
                                  </button>
                                )}
                              </div>
                          </div>
                        </div>
                    ))}
                  </div>
              )}
            </div>
          )}

          {/* Projects Hub View */}
          {view === AppView.PROJECTS && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Portfolio Builder</h3>
                <div className="flex items-center space-x-3">
                  {projectsError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-sm mb-1">{projectsError}</p>
                      <button 
                        onClick={handleGenerateProjects}
                        className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  <button 
                    onClick={handleGenerateProjects} 
                    disabled={isGeneratingProjects}
                    className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center transition-all shadow-lg shadow-orange-500/20"
                  >
                    {isGeneratingProjects ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Code className="w-4 h-4 mr-2" />}
                    Generate Ideas
                  </button>
                </div>
              </div>

              {isGeneratingProjects && projects?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 bg-slate-900/60 backdrop-blur-xl rounded-[24px] border border-slate-700/50 shadow-2xl shadow-slate-900/30">
                   <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                   <p className="text-slate-300">Crafting project ideas based on your skills...</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {projects?.map((project, idx) => (
                    <div key={idx} className="bg-slate-900/60 backdrop-blur-xl rounded-[24px] border border-slate-700/50 p-6 flex flex-col hover:border-orange-500/50 transition-all group shadow-2xl shadow-slate-900/30">
                       <div className="flex justify-between items-start mb-4">
                          <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                             project.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                             project.difficulty === 'Intermediate' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                             'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {project.difficulty}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                             <Layers className="w-4 h-4 text-slate-400 group-hover:text-white" />
                          </div>
                       </div>
                       <h4 className="text-lg font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">{project.title}</h4>
                       <p className="text-slate-400 text-sm mb-4 flex-1">{project.description}</p>
                       
                       <div className="space-y-4">
                          <div>
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tech Stack</h5>
                            <div className="flex flex-wrap gap-2">
                               {project.techStack?.map(t => (
                                 <span key={t} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
                                   {t}
                                 </span>
                               ))}
                            </div>
                          </div>
                          
                          <div className="bg-orange-900/20 p-3 rounded-lg border border-orange-500/20">
                             <div className="flex items-start space-x-2">
                                <TrendingUp className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-orange-200 italic">"{project.resumeValue}"</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
              
              {!isGeneratingProjects && projects?.length === 0 && (
                 <div className="text-center py-20 bg-slate-900/60 backdrop-blur-xl rounded-[24px] border border-slate-700/50 shadow-2xl shadow-slate-900/30">
                    <Code className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Build Your Portfolio</h3>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">
                       Stuck on what to build? Get 3 tailored project ideas (Beginner to Advanced) to demonstrate your skills to recruiters.
                    </p>
                    <button onClick={handleGenerateProjects} className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold">
                       Generate Projects
                    </button>
                 </div>
              )}
            </div>
          )}

          {/* Market Trends View (Added Missing View) */}
          {view === AppView.TRENDS && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Market Intelligence</h3>
                <div className="flex items-center space-x-3">
                  {trendsError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-sm mb-1">{trendsError}</p>
                      <button 
                        onClick={handleFetchTrends}
                        className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  <button 
                    onClick={handleFetchTrends} 
                    disabled={isFetchingTrends}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all"
                  >
                    {isFetchingTrends ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Refresh Data
                  </button>
                </div>
              </div>

              {isFetchingTrends && !trends && (
                <div className="flex flex-col items-center justify-center py-32 bg-slate-900/60 backdrop-blur-xl rounded-[24px] border border-slate-700/50 shadow-2xl shadow-slate-900/30">
                   <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                   <p className="text-slate-300">Analyzing live market data...</p>
                </div>
              )}

              {trends && (
                 <div className="space-y-6">
                    {/* Key Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl">
                          <div className="flex items-center mb-2 text-emerald-400">
                             <DollarSign className="w-5 h-5 mr-2" />
                             <span className="font-bold text-sm uppercase tracking-wider">Salary Range</span>
                          </div>
                          <div className="text-3xl font-bold text-white">{trends.salaryRange}</div>
                          <div className="text-emerald-500/60 text-sm mt-1">Based on current listings</div>
                       </div>
                       <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl">
                          <div className="flex items-center mb-2 text-amber-400">
                             <TrendingUp className="w-5 h-5 mr-2" />
                             <span className="font-bold text-sm uppercase tracking-wider">Demand Level</span>
                          </div>
                          <div className="text-3xl font-bold text-white">{trends.demandLevel}</div>
                          <div className="text-amber-500/60 text-sm mt-1">Market competitiveness</div>
                       </div>
                    </div>

                    {/* Hot Tech */}
                    <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-[24px] border border-slate-700/50 shadow-2xl shadow-slate-900/30">
                       <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                          <Target className="w-5 h-5 mr-2 text-orange-400" />
                          Top Technologies in Demand
                       </h3>
                       <div className="grid md:grid-cols-2 gap-4">
                          {trends.hotTechnologies.map((tech, idx) => (
                             <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col">
                                <span className="font-bold text-orange-300 mb-1">{tech.name}</span>
                                <span className="text-xs text-slate-500">{tech.growthReason}</span>
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* Industry News */}
                    <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-[24px] border border-slate-700/50 shadow-2xl shadow-slate-900/30">
                       <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                          <Newspaper className="w-5 h-5 mr-2 text-orange-400" />
                          Industry News & Impact
                       </h3>
                       <div className="space-y-4">
                          {trends.industryNews.map((news, idx) => (
                             <div key={idx} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                <h4 className="font-bold text-slate-200 mb-2">{news.headline}</h4>
                                <p className="text-sm text-slate-400 mb-2">{news.summary}</p>
                                <div className="text-xs text-orange-400 font-medium flex items-start">
                                   <span className="mr-1">👉</span> Impact: {news.impact}
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              )}
            </div>
          )}

          {/* Interview View */}
          {view === AppView.INTERVIEW && (
            <div className="h-[calc(100vh-140px)] min-h-[600px] flex flex-col bg-slate-900/60 backdrop-blur-xl rounded-[24px] border border-slate-700/50 overflow-hidden shadow-2xl shadow-slate-900/30 animate-in fade-in zoom-in-95 duration-300 relative">
              
              {isGeneratingFeedback ? (
                /* Feedback Loading State */
                 <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-2">Analyzing Performance</h3>
                    <p className="text-slate-400 max-w-md">Our AI is reviewing your answers, tone, and technical accuracy to generate a personalized report.</p>
                 </div>
              ) : interviewFeedback ? (
                /* Feedback Report */
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                   <div className="max-w-3xl mx-auto space-y-8">
                      <div className="text-center mb-8">
                         <div className="inline-block p-4 rounded-full bg-orange-500/10 mb-4">
                            <Award className="w-8 h-8 text-orange-400" />
                         </div>
                         <h2 className="text-3xl font-bold text-white mb-2">Interview Summary</h2>
                         <p className="text-slate-400">Here is how you performed in your mock session.</p>
                      </div>

                      {/* Score & Summary */}
                      <div className="grid md:grid-cols-3 gap-6">
                         <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/50 flex flex-col items-center justify-center text-center shadow-2xl shadow-slate-900/30">
                            <span className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2">Overall Score</span>
                            <div className={`text-5xl font-bold mb-2 ${
                               interviewFeedback.score >= 8 ? 'text-emerald-400' :
                               interviewFeedback.score >= 6 ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                               {interviewFeedback.score}<span className="text-2xl text-slate-600">/10</span>
                            </div>
                         </div>
                         <div className="md:col-span-2 bg-slate-900/60 rounded-2xl p-6 border border-slate-700/50 shadow-2xl shadow-slate-900/30">
                            <span className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2 block">Executive Summary</span>
                            <p className="text-slate-200 leading-relaxed">{interviewFeedback.feedbackSummary}</p>
                         </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                         {/* Strengths */}
                         <div className="bg-emerald-900/10 rounded-2xl p-6 border border-emerald-500/20">
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                               <TrendingUp className="w-5 h-5 mr-2 text-emerald-400" /> Key Strengths
                            </h4>
                            <ul className="space-y-3">
                               {interviewFeedback.strengths?.map((s, i) => (
                                  <li key={i} className="flex items-start text-sm text-emerald-100/80">
                                     <span className="mr-2 text-emerald-500">•</span> {s}
                                  </li>
                               ))}
                            </ul>
                         </div>
                         
                         {/* Improvements */}
                         <div className="bg-amber-900/10 rounded-2xl p-6 border border-amber-500/20">
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                               <Target className="w-5 h-5 mr-2 text-amber-400" /> Areas to Improve
                            </h4>
                            <ul className="space-y-3">
                               {interviewFeedback.improvements?.map((s, i) => (
                                  <li key={i} className="flex items-start text-sm text-amber-100/80">
                                     <span className="mr-2 text-amber-500">•</span> {s}
                                  </li>
                               ))}
                            </ul>
                         </div>
                      </div>

                      {/* Recommendation */}
                      <div className="bg-orange-900/20 rounded-2xl p-6 border border-orange-500/20 flex items-start space-x-4">
                         <div className="p-3 bg-orange-500/20 rounded-xl shrink-0">
                            <BookOpen className="w-6 h-6 text-orange-400" />
                         </div>
                         <div>
                            <h4 className="text-lg font-bold text-white mb-1">Recommended Focus</h4>
                            <p className="text-orange-200 text-sm">{interviewFeedback.recommendedFocus}</p>
                         </div>
                      </div>

                      <div className="flex justify-center pt-4">
                         <button 
                            onClick={() => {
                               setInterviewFeedback(null);
                               setChatMessages([]);
                            }}
                            className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors shadow-lg"
                         >
                            Done & Return to Menu
                         </button>
                      </div>
                   </div>
                </div>
              ) : !isInterviewStarted ? (
                /* Start Screen */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-900/20 to-slate-900/50 z-0"></div>
                   <div className="relative z-10 max-w-lg">
                      <div className="w-20 h-20 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(234,88,12,0.4)] transform rotate-3">
                         <MessageSquare className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-4">Mock Interview Simulator</h3>
                      <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                        Ready to practice? I'll act as a hiring manager for the <span className="text-orange-400 font-semibold">{userProfile.targetRole}</span> role. I'll ask questions and provide feedback on your answers.
                      </p>
                      <button 
                        onClick={startInterview}
                        className="bg-white text-orange-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-200 transition-all transform hover:scale-105 shadow-xl flex items-center mx-auto"
                      >
                        <Play className="w-5 h-5 mr-2 fill-orange-900" /> Start Session
                      </button>
                   </div>
                </div>
              ) : (
                /* Chat Interface */
                <>
                  <div className="bg-white/5 p-5 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                        <span className="font-bold text-slate-200">AI Interviewer <span className="text-slate-500 font-normal">| {userProfile.targetRole}</span></span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                          onClick={() => setIsSpeakingEnabled(!isSpeakingEnabled)}
                          className={`transition-colors ${isSpeakingEnabled ? 'text-orange-400' : 'text-slate-600 hover:text-slate-400'}`}
                          title="Toggle Text-to-Speech"
                      >
                          {isSpeakingEnabled ? <Volume2 className="w-5 h-5"/> : <VolumeX className="w-5 h-5"/>}
                      </button>
                      <button 
                          onClick={handleEndInterview}
                          className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-wider border border-red-500/30 px-3 py-1 rounded-full hover:bg-red-500/10 transition-all"
                      >
                          End Session
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {/* Only show 'Connecting' if truly loading and no messages yet */}
                    {chatMessages?.length === 0 && isChatLoading && (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                          <Loader2 className="w-8 h-8 animate-spin mb-4 text-orange-500" />
                          <p>Initializing interview session...</p>
                        </div>
                    )}
                    
                    {chatMessages?.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl p-6 shadow-lg backdrop-blur-sm ${
                              msg.role === 'user' 
                              ? 'bg-orange-600 text-white rounded-br-none' 
                              : 'bg-slate-800/80 border border-white/10 text-slate-200 rounded-bl-none'
                          }`}>
                              <div className="flex items-center space-x-2 mb-2 opacity-60">
                                {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                <span className="text-xs font-bold uppercase tracking-wider">{msg.role === 'user' ? 'You' : 'Interviewer'}</span>
                              </div>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                    ))}
                    {isChatLoading && chatMessages.length > 0 && (
                        <div className="flex justify-start">
                          <div className="bg-slate-800/80 border border-white/10 rounded-2xl rounded-bl-none p-6 shadow-lg flex items-center space-x-3">
                              <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                              <span className="text-xs font-medium text-slate-400">Interviewer is typing...</span>
                          </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-6 bg-white/5 border-t border-white/5">
                    <form onSubmit={handleSendMessage} className="flex space-x-3">
                        <input 
                          type="text" 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Type your answer here..."
                          className="flex-1 p-4 bg-slate-900 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder-slate-600"
                          disabled={isChatLoading}
                        />
                        <button
                          type="button"
                          onClick={toggleListening}
                          className={`p-4 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                        >
                          <Mic className="w-5 h-5" />
                        </button>
                        <button 
                          type="submit"
                          disabled={!chatInput.trim() || isChatLoading}
                          className="bg-orange-600 text-white p-4 rounded-xl hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Jobs View */}
          {view === AppView.JOBS && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Live Opportunities</h3>
                <div className="flex items-center space-x-3">
                  {jobsError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-sm mb-1">{jobsError}</p>
                      <button 
                        onClick={handleScanJobs}
                        className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  <button 
                    onClick={handleScanJobs} 
                    disabled={isScanningJobs}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Refresh Scanner
                  </button>
                </div>
              </div>

              {isScanningJobs && jobs?.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-32 bg-slate-900/60 backdrop-blur-xl rounded-[24px] border border-slate-700/50 shadow-2xl shadow-slate-900/30 animate-pulse">
                    <div className="relative">
                      <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 rounded-full"></div>
                      <div className="relative bg-slate-900 p-4 rounded-full mb-6 border border-orange-500/30 shadow-lg shadow-orange-500/10">
                         <Search className="w-8 h-8 text-orange-400 animate-bounce" />
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">Scanning Market</h4>
                    <p className="text-orange-300 font-medium">{scannerStep}</p>
                    <p className="text-slate-500 text-sm mt-2">This usually takes about 10-15 seconds.</p>
                  </div>
              )}

              <div className="grid gap-6">
                {jobs?.map((job, idx) => (
                  <div key={idx} className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-[24px] border border-slate-700/50 hover:border-orange-500/50 hover:bg-slate-900/80 transition-all group shadow-2xl shadow-slate-900/30 flex flex-col md:flex-row gap-6">
                    
                    <div className="flex-1">
                       <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">{job.title}</h4>
                            <p className="text-slate-400 font-medium text-lg">{job.company}</p>
                          </div>
                          <div className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20 whitespace-nowrap">
                              <Target className="w-3 h-3 mr-1" />
                              <span>{job.matchScore}% Match</span>
                          </div>
                       </div>

                       <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-5">
                          {job.location && (
                            <div className="flex items-center"><MapPin className="w-4 h-4 mr-1.5 text-orange-400"/> {job.location}</div>
                          )}
                          {job.salary && (
                            <div className="flex items-center"><DollarSign className="w-4 h-4 mr-1.5 text-emerald-400"/> {job.salary}</div>
                          )}
                          {job.postedAt && (
                            <div className="flex items-center"><Clock className="w-4 h-4 mr-1.5 text-slate-500"/> {job.postedAt}</div>
                          )}
                       </div>
                       
                       <p className="text-slate-300 text-sm mb-5 leading-relaxed">{job.description}</p>
                       
                       <div className="flex flex-wrap gap-2">
                          {job.skillsMatched?.slice(0, 5).map(skill => (
                            <span key={skill} className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-white/5">
                              {skill}
                            </span>
                          ))}
                       </div>
                    </div>

                    <div className="flex md:flex-col justify-end items-end gap-3 min-w-[140px]">
                        <a 
                          href={job.applyLink || `https://www.google.com/search?q=${encodeURIComponent(`${job.title} ${job.company} jobs`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-orange-500/20"
                        >
                          Apply Now <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                        <button className="w-full text-xs text-slate-500 hover:text-slate-300 py-2">
                           Save for later
                        </button>
                    </div>
                  </div>
                ))}
                {!isScanningJobs && jobs?.length === 0 && (
                  <div className="text-center py-20 bg-slate-900/60 backdrop-blur-xl rounded-[24px] border border-slate-700/50 shadow-2xl shadow-slate-900/30">
                     <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                     <h3 className="text-xl font-bold text-white mb-2">Job Market Scanner</h3>
                     <p className="text-slate-400 mb-6 max-w-md mx-auto">
                        Find active job listings that match your skills.
                     </p>
                     <button onClick={handleScanJobs} className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold">
                        Scan Now
                     </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;