"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

import {
  FileText,
  Plus,
  ArrowRight,
  Trash2,
  Eye,
  BarChart3,
  Target,
  Calendar,
  Building2,
  Briefcase,
  TrendingUp,
  Loader2,
  AlertCircle,
  Download,
  Coins,
} from "lucide-react";

import { Background } from "@/components/background";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { atsApi, ResumeAnalysis, DashboardStats } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

function getScoreBadgeVariant(score: number): "success" | "warning" | "destructive" {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "destructive";
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analyses, setAnalyses] = useState<ResumeAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [statsRes, historyRes] = await Promise.all([
        atsApi.getDashboardStats(),
        atsApi.getHistory(1, 20),
      ]);

      if (statsRes.success) {
        setStats(statsRes.stats);
      }
      
      if (historyRes.success) {
        setAnalyses(historyRes.analyses);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await atsApi.deleteAnalysis(id);
      if (res.success) {
        setAnalyses(prev => prev.filter(a => a._id !== id));
        // Refresh stats
        const statsRes = await atsApi.getDashboardStats();
        if (statsRes.success) {
          setStats(statsRes.stats);
        }
      }
    } catch (err) {
      console.error('Failed to delete analysis:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Show loading while checking auth
  if (authLoading || !isAuthenticated) {
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

  if (isLoading) {
    return (
      <Background>
        <div className="flex h-screen flex-col items-center justify-center">
          <Loader2 className="size-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            Loading your dashboard...
          </p>
        </div>
      </Background>
    );
  }

  if (error) {
    return (
      <Background>
        <div className="container max-w-4xl py-20">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900 flex items-center gap-2">
                <AlertCircle className="size-5" />
                Error Loading Dashboard
              </CardTitle>
              <CardDescription className="text-red-700">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={fetchDashboardData}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </Background>
    );
  }

  return (
    <Background>
      <div className="container max-w-7xl pt-28 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your resume analyses and improve your ATS scores
            </p>
          </div>
          <Button asChild>
            <Link href="/ats-score">
              <Plus className="size-4 mr-2" />
              New Analysis
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          {/* Credits Card - Only show for free plan */}
          {user?.plan === 'free' && (
            <Card className={user.credits <= 0 ? "border-yellow-200 bg-yellow-50" : ""}>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Coins className="size-4" />
                  Credits Remaining
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${user.credits <= 0 ? 'text-yellow-600' : ''}`}>
                  {user.credits}
                </div>
                {user.credits <= 0 ? (
                  <Button variant="outline" size="sm" asChild className="mt-2">
                    <Link href="/pricing">Upgrade Now</Link>
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {user.credits} / 10 analyses left
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <FileText className="size-4" />
                Total Analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalAnalyses || 0}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Resumes analyzed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="size-4" />
                Average Score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getScoreColor(stats?.averageScore || 0)}`}>
                {Math.round(stats?.averageScore || 0)}
              </div>
              <Progress 
                value={stats?.averageScore || 0} 
                className="h-2 mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Target className="size-4" />
                Quick Actions
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href="/ats-score">
                  <BarChart3 className="size-4 mr-1" />
                  Analyze
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href="/resume-builder">
                  <FileText className="size-4 mr-1" />
                  Build
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Analyses Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Resume Analyses</CardTitle>
                <CardDescription>
                  View and manage your analyzed resumes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {analyses.length === 0 ? (
              <div className="text-center py-12">
                <div className="relative mx-auto mb-6 h-48 w-full max-w-[400px] overflow-hidden rounded-lg shadow-md">
                  <Image 
                    src="/aianalysingsuggestions.png" 
                    alt="AI Analysis Preview" 
                    fill 
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent" />
                </div>
                <h3 className="text-lg font-medium mb-2">No analyses yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Upload your first resume to get detailed AI feedback and an ATS score. 
                  See exactly what to improve to land more interviews.
                </p>
                <Button asChild>
                  <Link href="/ats-score">
                    <Plus className="size-4 mr-2" />
                    Analyze Resume
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resume</TableHead>
                    <TableHead>Job Applied For</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="text-center">ATS Score</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyses.map((analysis) => (
                    <TableRow key={analysis._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="size-4 text-muted-foreground" />
                          <span className="font-medium truncate max-w-[200px]">
                            {analysis.fileName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {analysis.jobTitle ? (
                          <div className="flex items-center gap-1">
                            <Briefcase className="size-3 text-muted-foreground" />
                            <span className="truncate max-w-[150px]">
                              {analysis.jobTitle}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {analysis.companyName ? (
                          <div className="flex items-center gap-1">
                            <Building2 className="size-3 text-muted-foreground" />
                            <span className="truncate max-w-[120px]">
                              {analysis.companyName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getScoreBadgeVariant(analysis.atsScore)}>
                          {analysis.atsScore}/100
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="size-3" />
                          {formatDistanceToNow(new Date(analysis.createdAt), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/ats-score/${analysis._id}`}>
                              <Eye className="size-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => atsApi.downloadResumeFile(analysis._id, analysis.fileName)}
                            title="Download Resume"
                          >
                            <Download className="size-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                disabled={deletingId === analysis._id}
                              >
                                {deletingId === analysis._id ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <Trash2 className="size-4 text-destructive" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Analysis</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this analysis? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(analysis._id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pro Tips Section */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pro Tip: Use Smart Sections</CardTitle>
              <CardDescription>
                Easily add detailed project sections with customizable options to showcase your technical skills effectively.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video w-full overflow-hidden rounded-md border shadow-sm">
                <Image 
                  src="/egprojectsectionwithoptions.png"
                  alt="Project Section Builder"
                  fill
                  className="object-cover object-top"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Understand Your Score</CardTitle>
              <CardDescription>
                Get a detailed breakdown of what ATS systems look for, including keyword matching and section formatting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video w-full overflow-hidden rounded-md border shadow-sm">
                <Image 
                  src="/detailedsectionschecks.png"
                  alt="Detailed ATS Checks"
                  fill
                  className="object-cover object-top"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Background>
  );
}
