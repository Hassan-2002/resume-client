// Resume Builder Types

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary: string;
  tagline?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  highlights: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  highlights: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  highlights: string[];
}

export interface Skill {
  id: string;
  category: string;
  items: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link?: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  projects: Project[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
}

export interface AISuggestion {
  original: string;
  suggested: string;
  reasoning: string;
}

export interface AIReviewResult {
  sectionId: string;
  sectionType: SectionType;
  score: number;
  suggestions: AISuggestion[];
  overallFeedback: string;
}

export type SectionType = 
  | "personalInfo" 
  | "experience" 
  | "project" 
  | "education" 
  | "skills" 
  | "certifications";

export interface Template {
  id: string;
  name: string;
  preview: string;
  description: string;
  isPremium: boolean;
}

// Empty resume data for starting fresh
export const emptyResumeData: ResumeData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    summary: "",
    tagline: ""
  },
  experiences: [],
  projects: [],
  education: [],
  skills: [],
  certifications: []
};

// Dummy data for development
export const dummyResumeData: ResumeData = {
  personalInfo: {
    fullName: "Abdullah Ibrahim",
    email: "Abdullah.softwaredev@gmail.com",
    phone: "+91-7093880311",
    location: "Hyderabad, India",
    linkedin: "linkedin.com/in/Abdullah-Ibrahim",
    github: "github.com/abdullah-ibrahim",
    portfolio: "abdullah-portfolio.dev",
    summary: "Full Stack Developer with 3+ years of experience building scalable web applications using React, Node.js, and cloud technologies. Passionate about creating efficient, user-centric solutions and contributing to open-source projects.",
    tagline: "Full Stack Developer"
  },
  experiences: [
    {
      id: "exp-1",
      company: "Tekofy Software Solutions",
      position: "Full Stack Developer Intern",
      location: "Hyderabad, India",
      startDate: "Jan 2025",
      endDate: "Jun 2025",
      current: false,
      description: "Developed and maintained web applications using React and Node.js",
      highlights: [
        "Built a customer portal that improved user workflow efficiency by 15%",
        "Developed RESTful APIs handling traffic for up to 10,000 users",
        "Implemented automated testing reducing bug reports by 30%"
      ]
    },
    {
      id: "exp-2",
      company: "Full Stack Academy",
      position: "Teaching Assistant",
      location: "Remote",
      startDate: "Aug 2024",
      endDate: "Dec 2024",
      current: false,
      description: "Assisted students in learning web development fundamentals",
      highlights: [
        "Mentored 50+ students in JavaScript, React, and Node.js",
        "Created documentation and tutorials for course materials",
        "Conducted code reviews and provided constructive feedback"
      ]
    },
    {
      id: "exp-3",
      company: "Freelance",
      position: "Web Developer",
      location: "Remote",
      startDate: "Jul 2023",
      endDate: "Present",
      current: true,
      description: "Building custom web solutions for small businesses",
      highlights: [
        "Delivered 10+ projects for clients across various industries",
        "Ensured 99% uptime for all deployed applications",
        "Managed end-to-end project lifecycle from requirements to deployment"
      ]
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "Resume AI Builder",
      description: "AI-powered resume builder with ATS optimization",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Gemini AI"],
      link: "github.com/abdullah/resume-ai",
      highlights: [
        "Integrated Gemini AI for intelligent resume suggestions",
        "Implemented ATS scoring system with detailed feedback",
        "Built responsive UI with shadcn/ui components"
      ]
    },
    {
      id: "proj-2",
      name: "E-Commerce Platform",
      description: "Full-stack e-commerce solution with payment integration",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      link: "github.com/abdullah/ecommerce",
      highlights: [
        "Developed secure payment processing with Stripe",
        "Implemented real-time inventory management",
        "Built admin dashboard for order management"
      ]
    }
  ],
  education: [
    {
      id: "edu-1",
      institution: "JNTU Hyderabad",
      degree: "Bachelor of Technology",
      field: "Computer Science",
      location: "Hyderabad, India",
      startDate: "2021",
      endDate: "2025",
      gpa: "7.1/10 CGPA",
      highlights: [
        "Relevant coursework: Data Structures, Algorithms, Web Development",
        "Member of Computer Science Club"
      ]
    }
  ],
  skills: [
    {
      id: "skill-1",
      category: "Frontend",
      items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML/CSS"]
    },
    {
      id: "skill-2",
      category: "Backend",
      items: ["Node.js", "Express", "Python", "REST APIs", "GraphQL"]
    },
    {
      id: "skill-3",
      category: "Database",
      items: ["MongoDB", "PostgreSQL", "Redis", "Firebase"]
    },
    {
      id: "skill-4",
      category: "Tools & Others",
      items: ["Git", "Docker", "AWS", "Vercel", "Figma"]
    }
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Cloud Practitioner",
      issuer: "Amazon Web Services",
      date: "2024",
      link: "aws.amazon.com/verify"
    },
    {
      id: "cert-2",
      name: "Meta Frontend Developer",
      issuer: "Meta",
      date: "2023",
      link: "coursera.org/verify"
    }
  ]
};

// Dummy AI Review Results
export const dummyAIReviews: Record<string, AIReviewResult> = {
  "exp-1": {
    sectionId: "exp-1",
    sectionType: "experience",
    score: 85,
    suggestions: [
      {
        original: "Built a customer portal that improved user workflow efficiency by 15%",
        suggested: "Engineered a customer portal using React and Node.js, resulting in a 15% improvement in user workflow efficiency and reducing support tickets by 20%",
        reasoning: "Adding specific technologies and additional metrics makes the impact more concrete"
      },
      {
        original: "Developed RESTful APIs handling traffic for up to 10,000 users",
        suggested: "Architected and deployed scalable RESTful APIs capable of handling 10,000+ concurrent users with 99.9% uptime",
        reasoning: "Using stronger action verbs and adding reliability metrics strengthens the achievement"
      }
    ],
    overallFeedback: "Strong experience section with good quantification. Consider varying action verbs and adding more specific technologies used."
  },
  "proj-1": {
    sectionId: "proj-1",
    sectionType: "project",
    score: 78,
    suggestions: [
      {
        original: "Integrated Gemini AI for intelligent resume suggestions",
        suggested: "Integrated Google's Gemini AI API to provide intelligent, context-aware resume optimization suggestions, improving ATS compatibility scores by an average of 25%",
        reasoning: "Quantifying the impact of the AI integration makes the achievement more impressive"
      }
    ],
    overallFeedback: "Good project descriptions. Consider adding metrics on user adoption or performance improvements."
  },
  "personalInfo": {
    sectionId: "personalInfo",
    sectionType: "personalInfo",
    score: 72,
    suggestions: [
      {
        original: "Full Stack Developer with 3+ years of experience building scalable web applications using React, Node.js, and cloud technologies. Passionate about creating efficient, user-centric solutions and contributing to open-source projects.",
        suggested: "Results-driven Full Stack Developer with 3+ years of experience architecting scalable web applications using React, Node.js, and AWS. Proven track record of delivering high-performance solutions that improve user engagement by 30%+ and reduce operational costs. Active open-source contributor with 500+ GitHub stars.",
        reasoning: "Adding specific metrics and achievements in the summary makes it more impactful for ATS and recruiters"
      }
    ],
    overallFeedback: "Summary is good but could be more impactful with specific metrics and achievements."
  }
};

// Dummy Templates
export const dummyTemplates: Template[] = [
  {
    id: "template-1",
    name: "Professional Classic",
    preview: "/templates/classic.png",
    description: "Clean, traditional layout perfect for corporate roles",
    isPremium: false
  },
  {
    id: "template-2",
    name: "Modern Minimal",
    preview: "/templates/minimal.png",
    description: "Contemporary design with focus on readability",
    isPremium: false
  },
  {
    id: "template-3",
    name: "Creative Bold",
    preview: "/templates/creative.png",
    description: "Stand out with a unique, eye-catching design",
    isPremium: true
  },
  {
    id: "template-4",
    name: "Tech Focus",
    preview: "/templates/tech.png",
    description: "Optimized for technical roles with skills emphasis",
    isPremium: false
  },
  {
    id: "template-5",
    name: "Executive",
    preview: "/templates/executive.png",
    description: "Sophisticated design for senior positions",
    isPremium: true
  },
  {
    id: "template-6",
    name: "ATS Optimized",
    preview: "/templates/ats.png",
    description: "Maximum ATS compatibility with clean formatting",
    isPremium: false
  }
];
