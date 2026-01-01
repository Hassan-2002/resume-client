"use client";

import { useState, useRef, useEffect } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  CheckCircle2,
  XCircle,
  Upload,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  Clock,
  Briefcase,
  Building2,
  Loader2,
} from "lucide-react";

import { Background } from "@/components/background";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { atsApi, AtsReport as ApiAtsReport, resumeBuilderApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

// Rate limiting constants
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
const MAX_REQUESTS = 3; // Max 3 requests per minute

// IndexedDB helper for storing file before login
const DB_NAME = 'resumeAI_ats';
const STORE_NAME = 'pendingFiles';

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

async function savePendingFile(file: File, jobInfo: JobInfo): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  
  // Convert file to ArrayBuffer for storage
  const buffer = await file.arrayBuffer();
  
  store.put({
    id: 'pending',
    fileName: file.name,
    fileType: file.type,
    fileData: buffer,
    jobInfo,
    timestamp: Date.now(),
  });
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getPendingFile(): Promise<{ file: File; jobInfo: JobInfo } | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get('pending');
      request.onsuccess = () => {
        const data = request.result;
        if (!data) {
          resolve(null);
          return;
        }
        
        // Check if data is too old (more than 1 hour)
        if (Date.now() - data.timestamp > 3600000) {
          clearPendingFile();
          resolve(null);
          return;
        }
        
        // Reconstruct the File object
        const file = new File([data.fileData], data.fileName, { type: data.fileType });
        resolve({ file, jobInfo: data.jobInfo });
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

async function clearPendingFile(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete('pending');
  } catch {
    // Ignore errors
  }
}

// Types
interface ContactDetails {
  phone?: string;
  email?: string;
  linkedin?: string;
}

interface Subsection {
  subheading: string;
  passed: boolean;
  summary: string;
  details?: ContactDetails;
}

interface UrgentFix {
  subheading: string;
  passed: boolean;
  summary: string;
  action: string;
}

interface AtsReport {
  overallScore?: number;
  atsEssentials?: Subsection[];
  content?: Subsection[];
  sections?: Subsection[];
  urgentFixes?: UrgentFix[];
}

interface JobInfo {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
}

// Components
const ScoreBadge = ({ passed }: { passed: boolean }) => (
  <div
    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
      passed
        ? "bg-green-50 text-green-700 border border-green-200"
        : "bg-red-50 text-red-700 border border-red-200"
    }`}
  >
    {passed ? (
      <CheckCircle2 className="size-3.5" />
    ) : (
      <XCircle className="size-3.5" />
    )}
    {passed ? "Passed" : "Action needed"}
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start gap-3 text-sm">
    <span className="text-muted-foreground uppercase tracking-wide w-24 shrink-0">
      {label}
    </span>
    <span className="text-foreground">{value}</span>
  </div>
);

interface FileUploadSectionProps {
  onFileSelect: (file: File, jobInfo: JobInfo) => void;
  isRateLimited: boolean;
  remainingTime: number;
  isLoading: boolean;
}

const FileUploadSection = ({ 
  onFileSelect, 
  isRateLimited,
  remainingTime,
  isLoading,
}: FileUploadSectionProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobInfo, setJobInfo] = useState<JobInfo>({
    jobTitle: '',
    companyName: '',
    jobDescription: '',
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (!isRateLimited && e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isRateLimited && e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onFileSelect(selectedFile, jobInfo);
    }
  };

  return (
    <div className="container max-w-3xl py-20">
      {/* Back Button */}
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="size-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold tracking-tight mb-4">
          Get Your Free ATS Score
        </h1>
        <p className="text-muted-foreground text-lg">
          Upload your resume and get instant feedback from our AI-powered ATS analyzer
        </p>
      </div>

      {isRateLimited && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="size-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">Rate limit reached</p>
                <p className="text-sm text-yellow-700">
                  Please wait {Math.ceil(remainingTime / 1000)} seconds before uploading another resume
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {/* File Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Your Resume</CardTitle>
            <CardDescription>
              We&apos;ll analyze your resume against ATS requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isRateLimited 
                  ? "border-muted bg-muted/20 cursor-not-allowed"
                  : dragActive
                    ? "border-primary bg-primary/5"
                    : selectedFile
                      ? "border-green-500 bg-green-50"
                      : "border-border hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle2 className="size-8 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className={`size-10 mx-auto mb-3 ${isRateLimited ? "text-muted" : "text-muted-foreground"}`} />
                  <h3 className="text-lg font-medium mb-2">
                    {isRateLimited ? "Rate limit reached" : "Drop your resume here"}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Supports PDF, DOC, DOCX (Max 5MB)
                  </p>
                  <input
                    type="file"
                    id="resume-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleChange}
                    disabled={isRateLimited}
                  />
                  <Button asChild disabled={isRateLimited}>
                    <label htmlFor="resume-upload" className={isRateLimited ? "cursor-not-allowed" : "cursor-pointer"}>
                      Select File
                    </label>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Job Description Card (Optional) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job Details (Optional)</CardTitle>
            <CardDescription>
              Add job details for a more tailored analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">
                  <Briefcase className="size-3.5 inline mr-1" />
                  Job Title
                </Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Software Engineer"
                  value={jobInfo.jobTitle}
                  onChange={(e) => setJobInfo({ ...jobInfo, jobTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  <Building2 className="size-3.5 inline mr-1" />
                  Company Name
                </Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Google"
                  value={jobInfo.companyName}
                  onChange={(e) => setJobInfo({ ...jobInfo, companyName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the job description here for a more accurate analysis..."
                value={jobInfo.jobDescription}
                onChange={(e) => setJobInfo({ ...jobInfo, jobDescription: e.target.value })}
                className="min-h-24"
              />
            </div>
          </CardContent>
        </Card>

        {/* Analyze Button */}
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleSubmit}
          disabled={!selectedFile || isRateLimited || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              Analyze My Resume
              <ArrowRight className="size-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

interface ReportViewProps {
  report: AtsReport;
  onFixResume: () => void;
  isFixingResume?: boolean;
  jobInfo?: JobInfo;
}

const ReportView = ({ report, onFixResume, isFixingResume = false, jobInfo }: ReportViewProps) => {
  const essentials = report.atsEssentials ?? [];
  const content = report.content ?? [];
  const sections = report.sections ?? [];
  const fixes = report.urgentFixes ?? [];

  const totalIssues = [...essentials, ...content, ...sections, ...fixes].filter(
    (entry) => !entry.passed
  ).length;

  const overallScore = report.overallScore ?? 0;

  const CategorySection = ({
    title,
    items,
  }: {
    title: string;
    items: Subsection[];
  }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl uppercase tracking-wide">{title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {items.filter((i) => !i.passed).length} issues
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {items.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <span className="font-medium">{item.subheading}</span>
                  <ScoreBadge passed={item.passed} />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 pb-4 space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {item.summary}
                  </p>
                  {item.subheading === "Contact Information" && item.details && (
                    <div className="space-y-2 pt-2 border-t">
                      <DetailRow label="Phone" value={item.details.phone ?? "Not found"} />
                      <DetailRow label="Email" value={item.details.email ?? "Not found"} />
                      <DetailRow label="LinkedIn" value={item.details.linkedin ?? "Not found"} />
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );

  const FixesSection = ({ fixes }: { fixes: UrgentFix[] }) => {
    const failedFixes = fixes.filter((fix) => !fix.passed);

    if (failedFixes.length === 0) {
      return (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-6 text-green-600" />
              <div>
                <p className="font-medium text-green-900">All Clear!</p>
                <p className="text-sm text-green-700">
                  No fixes required right now. Great job!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl uppercase tracking-wide text-orange-900">
              Urgent Fixes
            </CardTitle>
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
              <AlertCircle className="size-3.5" />
              {failedFixes.length} to resolve
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {failedFixes.map((fix, idx) => (
              <AccordionItem key={idx} value={`fix-${idx}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-medium text-orange-900">{fix.subheading}</span>
                    <ScoreBadge passed={false} />
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2 pb-4 space-y-3">
                    <p className="text-muted-foreground leading-relaxed">
                      {fix.summary}
                    </p>
                    <div className="pt-2 border-t">
                      <p className="text-sm font-semibold text-orange-900 mb-1">
                        Recommended action
                      </p>
                      <p className="text-sm text-orange-800">{fix.action}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container max-w-7xl py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">ATS Score Report</h1>
            {jobInfo?.jobTitle && (
              <p className="text-sm text-muted-foreground">
                {jobInfo.jobTitle} {jobInfo.companyName && `at ${jobInfo.companyName}`}
              </p>
            )}
          </div>
        </div>
        <Button onClick={onFixResume} disabled={isFixingResume}>
          {isFixingResume ? (
            <>
              <div className="size-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Parsing Resume...
            </>
          ) : (
            <>
              Fix Resume
              <ArrowRight className="size-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-8 items-start">
        {/* Sidebar Score Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardDescription className="uppercase tracking-wide">
                Your Score
              </CardDescription>
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-6xl font-semibold">{overallScore}</span>
                <span className="text-2xl text-muted-foreground">/ 100</span>
              </div>
              <p className="text-sm text-muted-foreground pt-1">
                {totalIssues} open {totalIssues === 1 ? "issue" : "issues"}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress bars for each category */}
              <div className="space-y-4">
                {[
                  { label: "ATS Essentials", items: essentials },
                  { label: "Content", items: content },
                  { label: "Sections", items: sections },
                ].map(({ label, items }) => {
                  const passedCount = items.filter((i) => i.passed).length;
                  const percentage = items.length
                    ? Math.round((passedCount / items.length) * 100)
                    : 0;

                  return (
                    <div key={label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{label}</span>
                        <span className="text-muted-foreground">{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>

              {/* Fixes overview */}
              <Card className="bg-muted/50 border-muted">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">Fixes overview</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Address these items to strengthen your resume
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700">
                      {fixes.filter((f) => !f.passed).length}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <CategorySection title="ATS Essentials" items={essentials} />
          <CategorySection title="Content" items={content} />
          <CategorySection title="Sections" items={sections} />
          <FixesSection fixes={fixes} />
        </div>
      </div>
    </div>
  );
};

export default function AtsScorePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user, updateCredits } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AtsReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [analyzedFile, setAnalyzedFile] = useState<File | null>(null);
  const [isFixingResume, setIsFixingResume] = useState(false);
  const [currentJobInfo, setCurrentJobInfo] = useState<JobInfo>({ jobTitle: '', companyName: '', jobDescription: '' });
  const [checkingPending, setCheckingPending] = useState(true);
  
  // Rate limiting state
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const requestTimestamps = useRef<number[]>([]);

  // Check for pending file after login
  useEffect(() => {
    const checkPendingFile = async () => {
      if (!authLoading && isAuthenticated) {
        const pending = await getPendingFile();
        if (pending) {
          // Clear the pending file and auto-analyze
          await clearPendingFile();
          setCurrentJobInfo(pending.jobInfo);
          analyzeResume(pending.file, pending.jobInfo);
        }
      }
      setCheckingPending(false);
    };
    
    checkPendingFile();
  }, [authLoading, isAuthenticated]);

  // Check rate limit
  const checkRateLimit = (): boolean => {
    const now = Date.now();
    // Remove timestamps outside the window
    requestTimestamps.current = requestTimestamps.current.filter(
      ts => now - ts < RATE_LIMIT_WINDOW
    );
    
    if (requestTimestamps.current.length >= MAX_REQUESTS) {
      const oldestRequest = requestTimestamps.current[0];
      const timeUntilReset = RATE_LIMIT_WINDOW - (now - oldestRequest);
      setRemainingTime(timeUntilReset);
      setIsRateLimited(true);
      
      // Auto-reset rate limit after time expires
      setTimeout(() => {
        setIsRateLimited(false);
        setRemainingTime(0);
      }, timeUntilReset);
      
      return true;
    }
    
    return false;
  };

  const handleFileSelect = async (file: File, jobInfo: JobInfo) => {
    // Check rate limit first
    if (checkRateLimit()) {
      return;
    }

    // If not authenticated, save file and redirect to login
    if (!isAuthenticated) {
      try {
        await savePendingFile(file, jobInfo);
        router.push('/login?redirect=/ats-score');
      } catch (err) {
        console.error('Failed to save pending file:', err);
        setError('Failed to save file. Please try again.');
      }
      return;
    }

    // Check if user has credits (free plan only)
    if (user?.plan === 'free' && (user?.credits ?? 0) <= 0) {
      setNeedsUpgrade(true);
      setError('You have used all your free credits. Please upgrade to continue.');
      return;
    }

    // User is authenticated, proceed with analysis
    setCurrentJobInfo(jobInfo);
    await analyzeResume(file, jobInfo);
  };

  const analyzeResume = async (file: File, jobInfo: JobInfo) => {
    setLoading(true);
    setError(null);
    setNeedsUpgrade(false);
    
    // Record this request for rate limiting
    requestTimestamps.current.push(Date.now());

    try {
      const response = await atsApi.analyzeResume(file, {
        jobTitle: jobInfo.jobTitle,
        jobDescription: jobInfo.jobDescription,
        companyName: jobInfo.companyName,
      });

      if (response.success && response.analysis) {
        setReport(response.analysis);
        setAnalyzedFile(file);
        // Update credits in auth context
        if (response.credits !== undefined && response.credits >= 0) {
          updateCredits(response.credits);
        }
      } else {
        setError("Failed to analyze resume");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect to server";
      setError(errorMessage);
      // Check if this is a credits error
      if (errorMessage.includes('credits') || errorMessage.includes('upgrade')) {
        setNeedsUpgrade(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Fix Resume - parse the file and redirect to resume builder
  const handleFixResume = async () => {
    if (!analyzedFile) {
      router.push('/resume-builder');
      return;
    }

    setIsFixingResume(true);
    try {
      const response = await resumeBuilderApi.parseResume(analyzedFile);
      if (response.success && response.resumeData) {
        sessionStorage.setItem('pendingResumeData', JSON.stringify(response.resumeData));
        router.push('/resume-builder');
      } else {
        router.push('/resume-builder');
      }
    } catch (error) {
      console.error('Failed to parse resume for builder:', error);
      router.push('/resume-builder');
    } finally {
      setIsFixingResume(false);
    }
  };

  // Show loading while checking auth or pending file
  if (authLoading || checkingPending) {
    return (
      <Background>
        <div className="flex h-screen flex-col items-center justify-center">
          <div className="mb-4 size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-lg font-medium text-muted-foreground">Loading...</p>
        </div>
      </Background>
    );
  }

  if (error) {
    return (
      <Background>
        <div className="container max-w-2xl py-20">
          <Card className={needsUpgrade ? "border-yellow-200 bg-yellow-50" : "border-red-200 bg-red-50"}>
            <CardHeader>
              <CardTitle className={needsUpgrade ? "text-yellow-900" : "text-red-900"}>
                {needsUpgrade ? "Credits Exhausted" : "Error"}
              </CardTitle>
              <CardDescription className={needsUpgrade ? "text-yellow-700" : "text-red-700"}>
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              {needsUpgrade ? (
                <>
                  <Button asChild>
                    <Link href="/pricing">Upgrade Now</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setError(null)}>
                  Try Again
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </Background>
    );
  }

  if (report) {
    return (
      <Background>
        <ReportView 
          report={report} 
          onFixResume={handleFixResume}
          isFixingResume={isFixingResume}
          jobInfo={currentJobInfo}
        />
      </Background>
    );
  }

  return (
    <Background>
      <FileUploadSection 
        onFileSelect={handleFileSelect} 
        isRateLimited={isRateLimited}
        remainingTime={remainingTime}
        isLoading={loading}
      />
    </Background>
  );
}