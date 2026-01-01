// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5100';

// Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  credits?: number;
}

// Custom error for credit-related issues
export class CreditError extends Error {
  credits: number;
  required: number;
  needsUpgrade: boolean;

  constructor(message: string, credits: number, required: number = 1) {
    super(message);
    this.name = 'CreditError';
    this.credits = credits;
    this.required = required;
    this.needsUpgrade = true;
  }
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    credentials: 'include', // Important for cookies/auth
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  // Handle non-JSON responses (like PDF downloads)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/pdf')) {
    return response.blob() as Promise<T>;
  }
  
  const data = await response.json();
  
  // Handle credit errors specifically
  if (!response.ok) {
    if (data.needsUpgrade || response.status === 403) {
      throw new CreditError(
        data.message || 'Insufficient credits',
        data.credits || 0,
        data.required || 1
      );
    }
    throw new Error(data.message || data.error || 'API request failed');
  }
  
  return data;
}

// ============================================
// Auth API
// ============================================
export const authApi = {
  login: async (email: string, password: string) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  signup: async (name: string, email: string, password: string) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  logout: async () => {
    return apiCall('/auth/logout', {
      method: 'POST',
    });
  },

  getProfile: async () => {
    return apiCall('/auth/user-details');
  },
};

// ============================================
// ATS Score API
// ============================================
export interface AtsReport {
  overallScore?: number;
  atsEssentials?: Array<{
    subheading: string;
    passed: boolean;
    summary: string;
    details?: {
      phone?: string;
      email?: string;
      linkedin?: string;
    };
  }>;
  content?: Array<{
    subheading: string;
    passed: boolean;
    summary: string;
  }>;
  sections?: Array<{
    subheading: string;
    passed: boolean;
    summary: string;
    details?: {
      phone?: string;
      email?: string;
      linkedin?: string;
    };
  }>;
  urgentFixes?: Array<{
    subheading: string;
    passed: boolean;
    summary: string;
    action: string;
  }>;
}

export interface ResumeAnalysis {
  _id: string;
  fileName: string;
  jobTitle?: string;
  jobDescription?: string;
  companyName?: string;
  atsScore: number;
  analysisData?: AtsReport;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  uploadDate: string;
  createdAt: string;
}

export interface DashboardStats {
  totalAnalyses: number;
  averageScore: number;
  recentAnalyses: ResumeAnalysis[];
}

export const atsApi = {
  // Analyze resume with optional job description
  analyzeResume: async (
    file: File,
    jobInfo?: { jobTitle?: string; jobDescription?: string; companyName?: string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<{ success: boolean; analysis: AtsReport; analysisId?: string; saved?: boolean; credits?: number; parsedResumeData?: any }> => {
    const formData = new FormData();
    formData.append('resume', file);
    if (jobInfo?.jobTitle) formData.append('jobTitle', jobInfo.jobTitle);
    if (jobInfo?.jobDescription) formData.append('jobDescription', jobInfo.jobDescription);
    if (jobInfo?.companyName) formData.append('companyName', jobInfo.companyName);

    const response = await fetch(`${API_BASE_URL}/ats-score`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to analyze resume');
    }
    
    return data;
  },

  // Get user's analysis history
  getHistory: async (page = 1, limit = 10): Promise<{
    success: boolean;
    analyses: ResumeAnalysis[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    return apiCall(`/ats-score/history?page=${page}&limit=${limit}`);
  },

  // Get dashboard stats
  getDashboardStats: async (): Promise<{ success: boolean; stats: DashboardStats }> => {
    return apiCall('/ats-score/dashboard-stats');
  },

  // Get specific analysis
  getAnalysis: async (id: string): Promise<{ success: boolean; analysis: ResumeAnalysis }> => {
    return apiCall(`/ats-score/${id}`);
  },

  // Delete analysis
  deleteAnalysis: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiCall(`/ats-score/${id}`, { method: 'DELETE' });
  },

  // Download stored resume file
  downloadResumeFile: async (id: string, fileName: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/ats-score/${id}/file`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to download file');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};

// ============================================
// Resume Builder API
// ============================================
export interface AISuggestion {
  original: string;
  suggested: string;
  reasoning: string;
}

export interface AIReviewResult {
  score: number;
  overallFeedback: string;
  suggestions: AISuggestion[];
  keywords?: string[];
  actionVerbs?: string[];
}

export interface FullResumeReview {
  overallScore: number;
  sectionScores: {
    personalInfo: number;
    summary: number;
    experience: number;
    projects: number;
    education: number;
    skills: number;
  };
  strengths: string[];
  improvements: string[];
  atsCompatibility: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  missingKeywords: string[];
  formattingIssues: string[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  isPremium: boolean;
  atsScore: number;
  category: string;
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    summary: string;
    tagline?: string;
  };
  experiences: Array<{
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    highlights: string[];
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    link?: string;
    highlights: string[];
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    highlights: string[];
  }>;
  skills: Array<{
    id: string;
    category: string;
    items: string[];
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    link?: string;
  }>;
}

export const resumeBuilderApi = {
  // Parse uploaded resume into structured data
  parseResume: async (file: File): Promise<{ success: boolean; message: string; resumeData: ResumeData }> => {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch(`${API_BASE_URL}/resume-builder/parse`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
       console.log("error")
    }
    
    return data;
  },

  // Get AI suggestions for a section
  getSuggestions: async (
    sectionType: 'summary' | 'experience' | 'project' | 'skills' | 'education',
    content: Record<string, unknown>,
    jobTitle?: string
  ): Promise<{ success: boolean; sectionType: string; suggestions: AIReviewResult }> => {
    return apiCall('/resume-builder/suggestions', {
      method: 'POST',
      body: JSON.stringify({ sectionType, content, jobTitle }),
    });
  },

  // Get full resume review
  getFullReview: async (
    resumeData: ResumeData
  ): Promise<{ success: boolean; review: FullResumeReview }> => {
    return apiCall('/resume-builder/review', {
      method: 'POST',
      body: JSON.stringify({ resumeData }),
    });
  },

  // Rewrite content with AI
  rewriteContent: async (
    sectionType: string,
    content: Record<string, unknown>,
    style?: string
  ): Promise<{ success: boolean; sectionType: string; result: { rewritten: unknown; changes: string[]; improvement: string } }> => {
    return apiCall('/resume-builder/rewrite', {
      method: 'POST',
      body: JSON.stringify({ sectionType, content, style }),
    });
  },

  // Generate bullet points
  generateBullets: async (
    description: string,
    count?: number
  ): Promise<{ success: boolean; result: { bulletPoints: Array<{ text: string; keywords: string[] }>; tips: string[] } }> => {
    return apiCall('/resume-builder/generate-bullets', {
      method: 'POST',
      body: JSON.stringify({ description, count }),
    });
  },

  // Get available templates
  getTemplates: async (): Promise<{ success: boolean; templates: Template[] }> => {
    return apiCall('/resume-builder/templates');
  },

  // Save resume
  saveResume: async (
    resumeData: ResumeData,
    templateId?: string
  ): Promise<{ success: boolean; message: string; resume: { id: string } }> => {
    return apiCall('/resume-builder/save', {
      method: 'POST',
      body: JSON.stringify({ resumeData, templateId }),
    });
  },
};

// ============================================
// PDF Generation API
// ============================================
export const pdfApi = {
  // Generate and download PDF
  generatePDF: async (resumeData: ResumeData, templateId: string): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/generate-pdf`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf',
      },
      body: JSON.stringify({ resumeData, templateId }),
    });

    if (!response.ok) {
      // Try to parse error as JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate PDF');
      }
      throw new Error('Failed to generate PDF');
    }

    // Get the response as ArrayBuffer first, then create Blob
    const arrayBuffer = await response.arrayBuffer();
    return new Blob([arrayBuffer], { type: 'application/pdf' });
  },

  // Get PDF preview as base64
  getPreview: async (
    resumeData: ResumeData,
    templateId: string
  ): Promise<{ success: boolean; pdf: string; mimeType: string }> => {
    return apiCall('/generate-pdf/preview', {
      method: 'POST',
      body: JSON.stringify({ resumeData, templateId }),
    });
  },

  // Get HTML preview
  getHTMLPreview: async (
    resumeData: ResumeData,
    templateId: string
  ): Promise<{ success: boolean; html: string }> => {
    return apiCall('/generate-pdf/html-preview', {
      method: 'POST',
      body: JSON.stringify({ resumeData, templateId }),
    });
  },

  // Get template preview image URL
  getTemplatePreviewUrl: (templateId: string): string => {
    return `${API_BASE_URL}/generate-pdf/template-preview/${templateId}`;
  },
};

// ============================================
// Job Description API
// ============================================
export const jobDescApi = {
  analyze: async (jobDescription: string) => {
    return apiCall('/job-desc/analyze', {
      method: 'POST',
      body: JSON.stringify({ jobDescription }),
    });
  },

  matchResume: async (resumeId: string, jobDescription: string) => {
    return apiCall('/job-desc/match', {
      method: 'POST',
      body: JSON.stringify({ resumeId, jobDescription }),
    });
  },
};

export { API_BASE_URL };
