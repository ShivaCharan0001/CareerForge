import { UserProfile, CareerAnalysis, WeeklyPlan, JobListing, ProjectIdea, MarketTrend, ChatMessage, InterviewFeedback } from '../types';

const USERS_DB_KEY = 'cp_users_v2';
const DATA_PREFIX = 'cp_data_v2_';

interface UserRecord {
  email: string;
  password: string; // In a real app, this would be hashed.
  name: string;
  createdAt: number;
}

interface UserData {
  userProfile: UserProfile;
  analysis: CareerAnalysis | null;
  plan: WeeklyPlan[] | null;
  jobs: JobListing[];
  projects: ProjectIdea[];
  trends: MarketTrend | null;
  chatMessages: ChatMessage[];
  interviewFeedback: InterviewFeedback | null;
}

export const AuthService = {
  // --- Validation Helpers ---
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPassword: (password: string): boolean => {
    return password.length >= 6;
  },

  // --- Auth Actions ---
  
  signup: (email: string, password: string): { success: boolean; message?: string } => {
    const users = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
    
    if (users[email]) {
      return { success: false, message: 'User already exists. Please login.' };
    }

    const newUser: UserRecord = {
      email,
      password, // Note: In production, never store plain text passwords.
      name: email.split('@')[0],
      createdAt: Date.now()
    };

    users[email] = newUser;
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    
    // Initialize empty data for new user
    const initialData: UserData = {
      userProfile: { name: newUser.name, targetRole: '' },
      analysis: null,
      plan: null,
      jobs: [],
      projects: [],
      trends: null,
      chatMessages: [],
      interviewFeedback: null
    };
    AuthService.saveUserData(email, initialData);

    return { success: true };
  },

  login: (email: string, password: string): { success: boolean; message?: string; name?: string } => {
    const users = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
    const user = users[email];

    if (!user) {
      return { success: false, message: 'User not found. Please sign up.' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Incorrect password.' };
    }

    return { success: true, name: user.name };
  },

  // --- Data Management ---

  saveUserData: (email: string, data: UserData) => {
    localStorage.setItem(DATA_PREFIX + email, JSON.stringify(data));
  },

  getUserData: (email: string): UserData | null => {
    const data = localStorage.getItem(DATA_PREFIX + email);
    return data ? JSON.parse(data) : null;
  }
};
