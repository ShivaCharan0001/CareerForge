export enum AppView {
  LANDING = 'LANDING',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  PLAN = 'PLAN',
  INTERVIEW = 'INTERVIEW',
  JOBS = 'JOBS',
  PROJECTS = 'PROJECTS',
  TRENDS = 'TRENDS'
}

export interface UserProfile {
  name: string;
  targetRole: string;
  resumeText?: string;
  resumeFile?: {
    data: string; // Base64
    mimeType: string;
  };
}

export interface Skill {
  name: string;
  category: 'technical' | 'soft' | 'domain';
  status: 'acquired' | 'missing' | 'in-progress';
}

export interface CareerAnalysis {
  readinessScore: number; // 0-100
  summary: string;
  skills: Skill[];
  strengths: string[];
  weaknesses: string[];
}

export interface LearningTask {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'project' | 'reading';
  estimatedHours: number;
  completed: boolean;
  videoQuery?: string; // For YouTube search
  udemyQuery?: string; // For Udemy search
  courseraQuery?: string; // For Coursera search
}

export interface WeeklyPlan {
  weekNumber: number;
  theme: string;
  tasks: LearningTask[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  postedAt?: string; // e.g., "2 days ago"
  matchScore: number;
  description: string;
  skillsMatched: string[];
  applyLink?: string; // URL to the job posting
}

export interface ProjectIdea {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  techStack: string[];
  keyFeatures: string[];
  resumeValue: string; // Why this helps on a resume
}

export interface MarketTrend {
  role: string;
  salaryRange: string;
  demandLevel: 'High' | 'Medium' | 'Low';
  hotTechnologies: Array<{
    name: string;
    growthReason: string;
  }>;
  industryNews: Array<{
    headline: string;
    summary: string;
    impact: string; // How it affects the career
  }>;
}

export interface InterviewFeedback {
  score: number; // 0-10
  feedbackSummary: string;
  strengths: string[];
  improvements: string[];
  recommendedFocus: string; // One specific area to study
}

export interface ImportMetaEnv {
  readonly VITE_APIKEY: string;
  // add other variables here...
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}