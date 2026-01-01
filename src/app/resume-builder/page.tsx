"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Briefcase,
  FolderKanban,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Save,
  Sparkles,
  FileText,
  Loader2,
  Upload,
  FileUp,
  PenLine,
} from "lucide-react";

import { AISidebar } from "./ai-sidebar";
import { TemplateSelection, ResumePreview } from "./template-selection";
import {
  PersonalInfoSection,
  ExperienceItem,
  ProjectItem,
  EducationItem,
  SkillsSection,
  CertificationsSection,
} from "./section-components";
import { SectionManager, defaultSections, SectionConfig } from "./section-manager";
import {
  ResumeData,
  Experience,
  Project,
  Education,
  AIReviewResult,
  Template,
  emptyResumeData,
} from "./types";

import { Background } from "@/components/background";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resumeBuilderApi, pdfApi, ResumeData as ApiResumeData } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type BuilderStep = "initial" | "edit" | "templates";

export default function ResumeBuilderPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [step, setStep] = useState<BuilderStep>("initial");
  const [resumeData, setResumeData] = useState<ResumeData>(emptyResumeData);
  const [aiReviews, setAIReviews] = useState<Record<string, AIReviewResult>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Section management state
  const [sections, setSections] = useState<SectionConfig[]>(defaultSections);

  // Helper to check if a section is enabled
  const isSectionEnabled = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    return section?.enabled ?? true;
  };

  // AI Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [activeSectionTitle, setActiveSectionTitle] = useState<string>("");
  const [activeOriginalContent, setActiveOriginalContent] = useState<string>("");
  const [activeAIReview, setActiveAIReview] = useState<AIReviewResult | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/resume-builder');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        const response = await resumeBuilderApi.getTemplates();
        if (response.success && response.templates) {
          setTemplates(response.templates as unknown as Template[]);
        }
      } catch (error) {
        // Use fallback templates from types
        const { dummyTemplates } = await import("./types");
        setTemplates(dummyTemplates);
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  // Check for pending resume data from ATS page
  useEffect(() => {
    const pendingResumeData = sessionStorage.getItem('pendingResumeData');
    if (pendingResumeData) {
      try {
        const parsed = JSON.parse(pendingResumeData) as ResumeData;
        setResumeData(parsed);
        setStep("edit");
        sessionStorage.removeItem('pendingResumeData');
      } catch (error) {
        console.error('Failed to parse pending resume data:', error);
        sessionStorage.removeItem('pendingResumeData');
      }
    }
  }, []);

  // Handle file upload and parsing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setUploadError('Please upload a PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      return;
    }

    setUploadError(null);
    setIsParsingResume(true);

    try {
      const response = await resumeBuilderApi.parseResume(file);
      if (response.success && response.resumeData) {
        // Map the API response to our ResumeData format
        const parsedData = response.resumeData as unknown as ResumeData;
        setResumeData(parsedData);
        setStep("edit");
      } else {
        setUploadError('Failed to parse resume. Please try again.');
      }
    } catch (error) {
      console.error('Failed to parse resume:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse resume. Please try again.';
      
      // Check if this is a credit error
      if (errorMessage.toLowerCase().includes('credit') || errorMessage.toLowerCase().includes('upgrade')) {
        setUploadError('You have run out of credits. Please upgrade your plan to continue using AI features.');
      } else {
        setUploadError(errorMessage);
      }
    } finally {
      setIsParsingResume(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Start fresh with empty data
  const handleStartFresh = () => {
    setResumeData(emptyResumeData);
    setStep("edit");
  };

  // Fetch AI suggestions for a section
  const fetchAISuggestions = useCallback(async (
    sectionType: 'summary' | 'experience' | 'project' | 'skills' | 'education',
    content: Record<string, unknown>,
    sectionId: string
  ) => {
    setIsLoadingAI(true);
    try {
      const response = await resumeBuilderApi.getSuggestions(sectionType, content);
      if (response.success && response.suggestions) {
        const suggestions = response.suggestions as unknown as AIReviewResult;
        setAIReviews(prev => ({
          ...prev,
          [sectionId]: suggestions
        }));
        return suggestions;
      }
    } catch (error) {
      // Failed to fetch AI suggestions
    } finally {
      setIsLoadingAI(false);
    }
    return null;
  }, []);

  // Calculate completion and score
  const calculateProgress = () => {
    let completed = 0;
    const total = 6;

    if (resumeData.personalInfo.fullName && resumeData.personalInfo.email) completed++;
    if (resumeData.personalInfo.summary) completed++;
    if (resumeData.experiences.length > 0) completed++;
    if (resumeData.projects.length > 0) completed++;
    if (resumeData.education.length > 0) completed++;
    if (resumeData.skills.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const calculateOverallScore = () => {
    const scores = Object.values(aiReviews).map((r) => r.score);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  // Show loading while checking auth
  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <Background>
        <div className="flex h-screen flex-col items-center justify-center">
          <div className="mb-4 size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-lg font-medium text-muted-foreground">
            {authLoading ? "Loading..." : "Redirecting to login..."}
          </p>
        </div>
      </Background>
    );
  }

  // Handlers
  const handleOpenAISidebar = async (
    sectionId: string,
    sectionTitle: string,
    originalContent: string
  ) => {
    setActiveSectionId(sectionId);
    setActiveSectionTitle(sectionTitle);
    setActiveOriginalContent(originalContent);
    
    // Check if we already have a review for this section
    if (aiReviews[sectionId]) {
      setActiveAIReview(aiReviews[sectionId]);
      setSidebarOpen(true);
      return;
    }

    setSidebarOpen(true);
    setIsLoadingAI(true);

    // Determine section type and content for API call
    try {
      let sectionType: 'summary' | 'experience' | 'project' | 'skills' | 'education';
      let content: Record<string, unknown>;

      if (sectionId === "personalInfo") {
        sectionType = "summary";
        content = { summary: resumeData.personalInfo.summary };
      } else if (sectionId.startsWith("exp-")) {
        sectionType = "experience";
        const exp = resumeData.experiences.find(e => e.id === sectionId);
        content = exp ? { ...exp } : {};
      } else if (sectionId.startsWith("proj-")) {
        sectionType = "project";
        const proj = resumeData.projects.find(p => p.id === sectionId);
        content = proj ? { ...proj } : {};
      } else if (sectionId.startsWith("edu-")) {
        sectionType = "education";
        const edu = resumeData.education.find(e => e.id === sectionId);
        content = edu ? { ...edu } : {};
      } else {
        sectionType = "skills";
        content = { skills: resumeData.skills };
      }

      const review = await fetchAISuggestions(sectionType, content, sectionId);
      setActiveAIReview(review);
    } catch (error) {
      console.error("Error fetching AI review:", error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleReplaceContent = (newContent: string) => {
    // Handle replacing content based on the active section
    if (activeSectionId === "personalInfo") {
      setResumeData({
        ...resumeData,
        personalInfo: { ...resumeData.personalInfo, summary: newContent },
      });
    } else if (activeSectionId.startsWith("exp-")) {
      const updatedExperiences = resumeData.experiences.map((exp) => {
        if (exp.id === activeSectionId) {
          return { ...exp, highlights: [newContent, ...exp.highlights.slice(1)] };
        }
        return exp;
      });
      setResumeData({ ...resumeData, experiences: updatedExperiences });
    } else if (activeSectionId.startsWith("proj-")) {
      const updatedProjects = resumeData.projects.map((proj) => {
        if (proj.id === activeSectionId) {
          return { ...proj, highlights: [newContent, ...proj.highlights.slice(1)] };
        }
        return proj;
      });
      setResumeData({ ...resumeData, projects: updatedProjects });
    }
  };

  // Experience handlers
  const addExperience = () => {
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      highlights: [""],
    };
    setResumeData({ ...resumeData, experiences: [...resumeData.experiences, newExp] });
  };

  const updateExperience = (index: number, exp: Experience) => {
    const updated = [...resumeData.experiences];
    updated[index] = exp;
    setResumeData({ ...resumeData, experiences: updated });
  };

  const deleteExperience = (index: number) => {
    setResumeData({
      ...resumeData,
      experiences: resumeData.experiences.filter((_, i) => i !== index),
    });
  };

  // Project handlers
  const addProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: "",
      description: "",
      technologies: [],
      highlights: [""],
    };
    setResumeData({ ...resumeData, projects: [...resumeData.projects, newProj] });
  };

  const updateProject = (index: number, proj: Project) => {
    const updated = [...resumeData.projects];
    updated[index] = proj;
    setResumeData({ ...resumeData, projects: updated });
  };

  const deleteProject = (index: number) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.filter((_, i) => i !== index),
    });
  };

  // Education handlers
  const addEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      institution: "",
      degree: "",
      field: "",
      location: "",
      startDate: "",
      endDate: "",
      highlights: [],
    };
    setResumeData({ ...resumeData, education: [...resumeData.education, newEdu] });
  };

  const updateEducation = (index: number, edu: Education) => {
    const updated = [...resumeData.education];
    updated[index] = edu;
    setResumeData({ ...resumeData, education: updated });
  };

  const deleteEducation = (index: number) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter((_, i) => i !== index),
    });
  };

  // Save resume draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await resumeBuilderApi.saveResume(resumeData as unknown as ApiResumeData, selectedTemplate || undefined);
      // Show success toast/notification here
      console.log("Resume saved successfully!");
    } catch (error) {
      console.error("Failed to save resume:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Download PDF
  const handleDownload = async () => {
    if (!selectedTemplate) {
      alert("Please select a template first");
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const blob = await pdfApi.generatePDF(resumeData as unknown as ApiResumeData, selectedTemplate);
      
      // Verify we got a valid PDF blob
      if (!blob || blob.size === 0) {
        throw new Error('Received empty PDF');
      }
      
      // Create download link with proper blob type
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const progress = calculateProgress();
  const overallScore = calculateOverallScore();

  if (step === "templates") {
    return (
      <Background>
        <section className="py-20 lg:py-28">
          <div className="container max-w-7xl">
            {isLoadingTemplates ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : (
              <TemplateSelection
                templates={templates}
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
                onBack={() => setStep("edit")}
                onDownload={handleDownload}
                onPreview={() => setIsPreviewOpen(true)}
                resumeData={resumeData}
                isGenerating={isGeneratingPDF}
              />
            )}

            <ResumePreview
              isOpen={isPreviewOpen}
              onClose={() => setIsPreviewOpen(false)}
              template={templates.find((t) => t.id === selectedTemplate) || null}
              resumeData={resumeData}
            />
          </div>
        </section>
      </Background>
    );
  }

  // Initial step - Upload or start fresh
  if (step === "initial") {
    return (
      <Background>
        <section className="py-20 lg:py-28">
          <div className="container max-w-4xl">
            {/* Back Button */}
            <div className="mb-4">
              <Button variant="ghost" asChild>
                <Link href="/">
                  <ArrowLeft className="size-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>

            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-semibold tracking-tight mb-4">Resume Builder</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Create a professional, ATS-optimized resume with AI-powered suggestions.
                Upload your existing resume to get started or start fresh.
              </p>
            </div>

            {/* Options */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Upload Resume Card */}
              <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors cursor-pointer group">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={isParsingResume}
                />
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    {isParsingResume ? (
                      <Loader2 className="size-8 text-primary animate-spin" />
                    ) : (
                      <FileUp className="size-8 text-primary" />
                    )}
                  </div>
                  <CardTitle className="text-xl">Upload Your Resume</CardTitle>
                  <CardDescription className="text-sm">
                    Upload your existing resume and we&apos;ll parse it into an editable format
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="py-8 px-4 border-2 border-dashed rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-colors">
                    <Upload className="size-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium">
                      {isParsingResume ? "Parsing resume..." : "Drop your PDF here or click to browse"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports PDF files up to 10MB
                    </p>
                  </div>
                  {uploadError && (
                    <div className="mt-3 text-center">
                      <p className="text-sm text-destructive">{uploadError}</p>
                      {uploadError.includes('credits') && (
                        <Button variant="outline" size="sm" asChild className="mt-2">
                          <Link href="/pricing">Upgrade Now</Link>
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Start Fresh Card */}
              <Card 
                className="border-2 hover:border-primary/50 transition-colors cursor-pointer group"
                onClick={handleStartFresh}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <PenLine className="size-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Start From Scratch</CardTitle>
                  <CardDescription className="text-sm">
                    Build your resume from the ground up with our guided editor
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="py-8 px-4 border-2 border-dashed rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-colors">
                    <Sparkles className="size-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium">Create a new resume</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      AI-powered suggestions as you write
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Features */}
            <div className="mt-12 grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">AI</div>
                <p className="text-sm text-muted-foreground">Smart suggestions to improve your content</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">ATS</div>
                <p className="text-sm text-muted-foreground">Optimized for applicant tracking systems</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">PDF</div>
                <p className="text-sm text-muted-foreground">Export to professional PDF templates</p>
              </div>
            </div>
          </div>
        </section>
      </Background>
    );
  }

  return (
    <Background>
      <section className="py-20 lg:py-28">
        <div className="container max-w-6xl">
          {/* Back Button */}
          <div className="mb-4">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="size-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">Resume Builder</h1>
                <p className="text-muted-foreground mt-1">
                  Build your professional resume with AI-powered suggestions
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="size-4 mr-2" />
                  )}
                  Save Draft
                </Button>
                <Button onClick={() => setStep("templates")}>
                  Choose Template
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Completion</span>
                    <Badge variant="secondary">{progress}%</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">AI Score</span>
                    <Badge variant={overallScore >= 80 ? "success" : overallScore >= 60 ? "warning" : "outline"}>
                      {overallScore}/100
                    </Badge>
                  </div>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
              <TabsTrigger value="all">All Sections</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {/* Section Manager */}
              <SectionManager
                sections={sections}
                onSectionsChange={setSections}
              />

              {/* Personal Info - Always visible */}
              <PersonalInfoSection
                data={resumeData.personalInfo}
                onChange={(data) =>
                  setResumeData({ ...resumeData, personalInfo: data })
                }
                onAIReview={() =>
                  handleOpenAISidebar(
                    "personalInfo",
                    "Professional Summary",
                    resumeData.personalInfo.summary
                  )
                }
                aiReview={aiReviews["personalInfo"]}
              />

              {/* Experience */}
              {isSectionEnabled("experience") && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
                          <Briefcase className="size-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Work Experience</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {resumeData.experiences.length} positions
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={addExperience}>
                        Add Experience
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {resumeData.experiences.map((exp, index) => (
                      <ExperienceItem
                        key={exp.id}
                        experience={exp}
                        onChange={(updated) => updateExperience(index, updated)}
                        onDelete={() => deleteExperience(index)}
                        onAIReview={() =>
                          handleOpenAISidebar(
                            exp.id,
                            `${exp.position} at ${exp.company}`,
                            exp.highlights.join("\n")
                          )
                        }
                        aiReview={aiReviews[exp.id]}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Projects */}
              {isSectionEnabled("projects") && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
                          <FolderKanban className="size-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Projects</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {resumeData.projects.length} projects
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={addProject}>
                        Add Project
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {resumeData.projects.map((proj, index) => (
                      <ProjectItem
                        key={proj.id}
                        project={proj}
                        onChange={(updated) => updateProject(index, updated)}
                        onDelete={() => deleteProject(index)}
                        onAIReview={() =>
                          handleOpenAISidebar(
                            proj.id,
                            proj.name,
                            proj.highlights.join("\n")
                          )
                        }
                        aiReview={aiReviews[proj.id]}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Education */}
              {isSectionEnabled("education") && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
                          <GraduationCap className="size-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Education</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {resumeData.education.length} entries
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={addEducation}>
                        Add Education
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {resumeData.education.map((edu, index) => (
                      <EducationItem
                        key={edu.id}
                        education={edu}
                        onChange={(updated) => updateEducation(index, updated)}
                        onDelete={() => deleteEducation(index)}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Skills */}
              {isSectionEnabled("skills") && (
                <SkillsSection
                  skills={resumeData.skills}
                  onChange={(skills) => setResumeData({ ...resumeData, skills })}
                />
              )}

              {/* Certifications */}
              {isSectionEnabled("certifications") && (
                <CertificationsSection
                  certifications={resumeData.certifications}
                  onChange={(certifications) =>
                    setResumeData({ ...resumeData, certifications })
                  }
                />
              )}
            </TabsContent>

            <TabsContent value="experience" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
                        <Briefcase className="size-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Work Experience</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {resumeData.experiences.length} positions
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={addExperience}>
                      Add Experience
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resumeData.experiences.map((exp, index) => (
                    <ExperienceItem
                      key={exp.id}
                      experience={exp}
                      onChange={(updated) => updateExperience(index, updated)}
                      onDelete={() => deleteExperience(index)}
                      onAIReview={() =>
                        handleOpenAISidebar(
                          exp.id,
                          `${exp.position} at ${exp.company}`,
                          exp.highlights.join("\n")
                        )
                      }
                      aiReview={aiReviews[exp.id]}
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
                        <FolderKanban className="size-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Projects</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {resumeData.projects.length} projects
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={addProject}>
                      Add Project
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resumeData.projects.map((proj, index) => (
                    <ProjectItem
                      key={proj.id}
                      project={proj}
                      onChange={(updated) => updateProject(index, updated)}
                      onDelete={() => deleteProject(index)}
                      onAIReview={() =>
                        handleOpenAISidebar(
                          proj.id,
                          proj.name,
                          proj.highlights.join("\n")
                        )
                      }
                      aiReview={aiReviews[proj.id]}
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
                        <GraduationCap className="size-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Education</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {resumeData.education.length} entries
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={addEducation}>
                      Add Education
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resumeData.education.map((edu, index) => (
                    <EducationItem
                      key={edu.id}
                      education={edu}
                      onChange={(updated) => updateEducation(index, updated)}
                      onDelete={() => deleteEducation(index)}
                    />
                  ))}
                </CardContent>
              </Card>

              <CertificationsSection
                certifications={resumeData.certifications}
                onChange={(certifications) =>
                  setResumeData({ ...resumeData, certifications })
                }
              />
            </TabsContent>

            <TabsContent value="skills" className="space-y-6">
              <SkillsSection
                skills={resumeData.skills}
                onChange={(skills) => setResumeData({ ...resumeData, skills })}
              />
            </TabsContent>
          </Tabs>

          {/* Floating Action */}
          <div className="fixed bottom-6 right-6 z-40">
            <Button
              size="lg"
              onClick={() => setStep("templates")}
              className="shadow-lg"
            >
              <FileText className="size-5 mr-2" />
              Generate Resume
            </Button>
          </div>
        </div>
      </section>

      {/* AI Sidebar */}
      <AISidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sectionTitle={activeSectionTitle}
        originalContent={activeOriginalContent}
        aiReview={activeAIReview}
        onReplace={handleReplaceContent}
        isLoading={isLoadingAI}
      />
    </Background>
  );
}
