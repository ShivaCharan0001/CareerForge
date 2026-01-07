import { GoogleGenAI, Type } from "@google/genai";
import { CareerAnalysis, ChatMessage, InterviewFeedback, JobListing, MarketTrend, ProjectIdea, WeeklyPlan, ImportMetaEnv, ImportMeta } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_APIKEY });

// Robust JSON cleaner that finds the array/object within text
const cleanJson = (text: string): string => {
  if (!text) return "[]";
  
  // Remove markdown code blocks first
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '');
  
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');

  // If we find an object start, and (it's before any array start OR there is no array start)
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
     const lastBrace = cleaned.lastIndexOf('}');
     if (lastBrace !== -1) {
       return cleaned.substring(firstBrace, lastBrace + 1);
     }
  }
  
  // If we find an array start, and (it's before any object start OR there is no object start)
  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      const lastBracket = cleaned.lastIndexOf(']');
      if (lastBracket !== -1) {
        return cleaned.substring(firstBracket, lastBracket + 1);
      }
  }

  // Fallback
  return cleaned;
};

// Helper for retrying API calls with robust backoff
const generateWithRetry = async (model: string, params: any, retries = 3) => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent({
        model,
        ...params
      });
    } catch (error: any) {
      lastError = error;
      
      // Check for Rate Limit (429) or Quota issues
      const isRateLimit = error.message?.includes('429') || 
                          error.status === 429 || 
                          error.message?.includes('quota') || 
                          error.message?.includes('RESOURCE_EXHAUSTED');

      if (isRateLimit) {
         console.warn(`Rate limit hit for ${model}. Retrying in ${Math.pow(2, i + 2)}s...`);
         // Aggressive backoff for rate limits: 4s, 8s, 16s... max 15s
         const delay = Math.min(1000 * Math.pow(2, i + 2), 15000); 
         await new Promise(resolve => setTimeout(resolve, delay));
         
         // Increase retries for rate limits if not already high
         if (retries < 5) retries = 5; 
      } else {
         console.warn(`Attempt ${i + 1} failed for ${model}:`, error.message);
         // Standard backoff
         const delay = Math.min(1000 * Math.pow(2, i), 8000);
         await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};

/**
 * Analyzes the user's resume (Text or PDF) against a target role.
 */
export const analyzeProfile = async (
  resumeInput: { text?: string; file?: { data: string; mimeType: string } }, 
  targetRole: string
): Promise<CareerAnalysis> => {
  
  const promptText = `
    Role: Senior Career Coach.
    Task: Analyze the candidate's profile against the target role: "${targetRole}".
    
    Output strictly in JSON format matching the schema.
    - readinessScore: number 0-100 based on fit.
    - summary: A 2-3 sentence executive summary.
    - skills: List of skills extracted, categorized, and marked as 'acquired' (found in resume) or 'missing' (required for target role).
    - strengths: Top 3 selling points.
    - weaknesses: Top 3 gaps to fill.
  `;

  const contents = [];
  
  if (resumeInput.file) {
    contents.push({
      inlineData: {
        mimeType: resumeInput.file.mimeType,
        data: resumeInput.file.data
      }
    });
    contents.push({ text: promptText });
  } else if (resumeInput.text) {
    contents.push({ text: `Resume Content:\n"${resumeInput.text.slice(0, 30000)}"\n\n${promptText}` });
  } else {
    throw new Error("No resume input provided");
  }

  try {
    const response = await generateWithRetry(
      'gemini-2.5-flash',
      {
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              readinessScore: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              skills: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING, enum: ['technical', 'soft', 'domain'] },
                    status: { type: Type.STRING, enum: ['acquired', 'missing', 'in-progress'] },
                  }
                }
              },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
          }
        }
      }
    );

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    try {
      return JSON.parse(cleanJson(text)) as CareerAnalysis;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw Text:", text);
      throw new Error("Failed to parse AI response. Please try again.");
    }
  } catch (error) {
    console.error("Analysis failed", error);
    throw error;
  }
};

/**
 * Generates a personalized learning plan.
 */
export const generateLearningPlan = async (targetRole: string, missingSkills: string[], isRegenerate = false): Promise<WeeklyPlan[]> => {
  const focusSkills = missingSkills.length > 0 
    ? missingSkills.slice(0, 5).join(', ') 
    : `core modern competencies for ${targetRole}`;

  const regenerateNote = isRegenerate ? "This is a regeneration request. Please create a completely new and different learning plan with fresh tasks and approaches." : "";

  const prompt = `
    Role: Expert Curriculum Designer.
    Task: Create a 1-Week Intensive Learning Sprint for a "${targetRole}".
    Focus strictly on these gaps: ${focusSkills}.
    
    Requirements:
    - Output exactly 1 week (weekNumber: 1).
    - 4-5 high-impact tasks per week.
    - Mix of 'course', 'reading', 'project'.
    - Provide detailed, engaging titles and descriptions for each task and week theme.
    ${regenerateNote}
    - Timestamp: ${Date.now()}
  `;

  try {
    const response = await generateWithRetry(
      'gemini-2.5-flash',
      {
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 0 }, 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                weekNumber: { type: Type.INTEGER },
                theme: { type: Type.STRING },
                tasks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ['course', 'project', 'reading'] },
                      estimatedHours: { type: Type.NUMBER },
                      completed: { type: Type.BOOLEAN }
                    }
                  }
                }
              }
            }
          }
        }
      }
    );

    const parsed = JSON.parse(cleanJson(response.text || "[]")).map((week: any, index: number) => ({
      ...week,
      weekNumber: index + 1,
      tasks: week.tasks?.map((task: any) => ({
        ...task,
        videoQuery: `${task.title} tutorial`,
        udemyQuery: `${task.title} course`,
        courseraQuery: `${task.title} specialization`
      }))
    })) as WeeklyPlan[];

    return parsed;
  } catch (error) {
    console.error("Plan Generation Failed:", error);
    throw error;
  }
};

/**
 * Scans for real jobs using Google Search with optimized speed.
 */
export const findMatchingJobs = async (targetRole: string, skills: string[]): Promise<JobListing[]> => {
  // Example JSON structure provided by user to ensure consistency
  const exampleJson = [
    { 
      "id": "apple-ml-2025", 
      "title": "Machine Learning Engineer, OS Intelligence", 
      "company": "Apple", 
      "location": "Cupertino, CA / Remote Eligible", 
      "salary": "$126,800 - $220,900", 
      "postedAt": "3 days ago", 
      "matchScore": 95, 
      "description": "Design deep learning architectures and implement ML algorithms to optimize operating system performance and battery life.", 
      "skillsMatched": ["Python", "PyTorch", "TensorFlow", "Deep Learning"], 
      "applyLink": "https://www.apple.com/careers" 
    }
  ];

  const prompt = `
    Role: Technical Recruiter.
    Task: Search for 3 active, relevant job listings for "${targetRole}" and return them as a JSON array.
    
    Context: The candidate has these skills: ${skills.join(', ')}.
    
    Instructions:
    1. Use Google Search to find REAL, active job listings.
    2. For each job, analyze the description and calculate a 'matchScore' (0-100) based on the candidate's skills.
    3. Extract 'skillsMatched' from the job description that overlap with candidate's skills.
    4. Format the output EXACTLY as this JSON example (same keys):
    ${JSON.stringify(exampleJson)}
    
    Output Rules:
    - Return ONLY the JSON array.
    - No markdown formatting (no \`\`\`json).
    - Ensure 'applyLink' is a valid direct link if possible, or a search result link.
    - If exact salary is not found, estimate based on role/location or use 'Competitive'.
    - Start with '[' and end with ']'.
  `;

  try {
    const response = await generateWithRetry(
      'gemini-2.5-flash',
      {
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
          thinkingConfig: { thinkingBudget: 0 }, // Disable thinking to speed up grounded response
          // Using prompt engineering for structure instead of responseSchema to avoid conflicts with search tools
        }
      }
    );

    if (!response.text) return [];
    
    // cleanJson will handle stripping any accidental conversational text
    const parsed = JSON.parse(cleanJson(response.text));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Job Scan Failed:", error);
    // Rethrow so the UI can handle the specific 429 error message
    throw error;
  }
};

export const createInterviewSession = (targetRole: string) => {
  const systemInstruction = `
    You are a hiring manager for ${targetRole}. 
    Ask 1 relevant question at a time. 
    Keep responses concise (<80 words). 
    Critique the answer briefly, then ask the next question.
  `;
  
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: { systemInstruction }
  });
};

export const generateProjectIdeas = async (targetRole: string): Promise<ProjectIdea[]> => {
  const prompt = `
    Role: Senior Engineering Manager.
    Task: Suggest 3 portfolio projects for a "${targetRole}". 
    Levels: Beginner, Intermediate, Advanced.
  `;

  try {
    const response = await generateWithRetry(
      'gemini-2.5-flash',
      {
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 0 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                difficulty: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] },
                description: { type: Type.STRING },
                techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
                resumeValue: { type: Type.STRING }
              }
            }
          }
        }
      }
    );
    return JSON.parse(cleanJson(response.text || "[]"));
  } catch (error) {
    console.error("Project Generation Failed:", error);
    throw error;
  }
};

export const fetchMarketTrends = async (targetRole: string): Promise<MarketTrend> => {
  const exampleJson = {
    role: targetRole,
    salaryRange: "$120k - $180k",
    demandLevel: "High",
    hotTechnologies: [
      { name: "TechName", growthReason: "Reason for growth" }
    ],
    industryNews: [
      { headline: "Headline", summary: "Short summary", impact: "Impact on career" }
    ]
  };

  const prompt = `
    Role: Tech Analyst.
    Task: Provide a real-time market snapshot for "${targetRole}" including salary ranges, demand, hot technologies, and recent industry news.
    
    Instructions:
    1. Use Google Search to find CURRENT data for:
       - Salary range (US average or global tech hubs)
       - Market demand level
       - Trending technologies/skills for this role
       - Recent news headlines affecting this role
    2. Format the output EXACTLY as this JSON object:
    ${JSON.stringify(exampleJson)}
    
    Output Rules:
    - Return ONLY the JSON object.
    - No markdown formatting.
    - Start with '{' and end with '}'.
  `;

  try {
    const response = await generateWithRetry(
      'gemini-2.5-flash',
      {
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
          thinkingConfig: { thinkingBudget: 0 },
          // Note: Removed strict responseSchema to prevent conflict with Google Search tool output.
          // Relying on prompt engineering for JSON structure.
        }
      }
    );
    return JSON.parse(cleanJson(response.text || "{}"));
  } catch (error) {
    console.error("Trends Fetch Failed:", error);
    throw error;
  }
};

export const generateInterviewFeedback = async (messages: ChatMessage[], targetRole: string): Promise<InterviewFeedback> => {
  const transcript = messages.map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.text}`).join('\n');
  const prompt = `
    Role: Interview Coach.
    Task: Evaluate transcript for "${targetRole}".
    Transcript: ${transcript}
    Provide Score (0-10), Feedback, Strengths, Improvements, Focus Area.
  `;

  try {
    const response = await generateWithRetry(
      'gemini-2.5-flash',
      {
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 0 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              feedbackSummary: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedFocus: { type: Type.STRING }
            }
          }
        }
      }
    );
    return JSON.parse(cleanJson(response.text || "{}"));
  } catch (error) {
    console.error("Feedback Generation Failed:", error);
    throw error;
  }
};