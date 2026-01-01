"use client";

import { useState } from "react";
import {
  Check,
  Crown,
  Download,
  Eye,
  FileText,
  ArrowLeft,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { Template, ResumeData } from "./types";

interface TemplateSelectionProps {
  templates: Template[];
  selectedTemplate: string | null;
  onSelectTemplate: (templateId: string) => void;
  onBack: () => void;
  onDownload: () => void;
  onPreview: () => void;
  resumeData: ResumeData;
  isGenerating?: boolean;
}

// Mini-preview component for template cards - renders actual resume data
function TemplatePreviewThumbnail({ templateId, resumeData }: { templateId: string; resumeData: ResumeData }) {
  const { personalInfo, experiences, skills, education } = resumeData;
  const name = personalInfo.fullName || "Your Name";
  const email = personalInfo.email || "email@example.com";
  const phone = personalInfo.phone || "+1 234 567 890";
  const location = personalInfo.location || "City, Country";
  const summary = personalInfo.summary || "Your professional summary will appear here...";
  const firstExp = experiences[0];
  const firstEdu = education[0];
  const allSkills = skills.flatMap(s => s.items).slice(0, 6);

  // Wrapper that scales down the full resume to fit in the card
  const ScaledWrapper = ({ children, bgClass = "bg-white" }: { children: React.ReactNode; bgClass?: string }) => (
    <div className={`absolute inset-0 overflow-hidden ${bgClass}`}>
      <div 
        className="origin-top-left"
        style={{ 
          transform: "scale(0.28)", 
          width: "357%", // 100% / 0.28 ≈ 357%
          height: "357%",
        }}
      >
        {children}
      </div>
    </div>
  );

  switch (templateId) {
    case "template-1": // Professional Classic
      return (
        <ScaledWrapper>
          <div className="p-8 font-serif">
            {/* Header - centered */}
            <div className="text-center pb-4 border-b-2 border-gray-300 mb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{name}</h1>
              <p className="text-sm text-gray-600">{email} • {phone} • {location}</p>
            </div>
            {/* Summary */}
            <div className="mb-4">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">Professional Summary</h2>
              <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">{summary}</p>
            </div>
            {/* Experience */}
            {firstExp && (
              <div className="mb-4">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">Experience</h2>
                <div>
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold text-gray-900">{firstExp.position}</span>
                    <span className="text-xs text-gray-500">{firstExp.startDate} - {firstExp.current ? "Present" : firstExp.endDate}</span>
                  </div>
                  <p className="text-xs text-gray-600">{firstExp.company}</p>
                  <ul className="mt-1 space-y-0.5">
                    {firstExp.highlights.slice(0, 2).map((h, i) => (
                      <li key={i} className="text-xs text-gray-700 flex"><span className="mr-1">•</span>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {/* Skills */}
            <div>
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">Skills</h2>
              <p className="text-xs text-gray-700">{allSkills.join(" • ")}</p>
            </div>
          </div>
        </ScaledWrapper>
      );

    case "template-2": // Modern Minimal
      return (
        <ScaledWrapper>
          <div className="p-8 font-sans">
            {/* Header - left aligned, minimal */}
            <div className="pb-4 mb-4 border-b-2 border-black">
              <h1 className="text-3xl font-light text-black tracking-tight">{name}</h1>
              <p className="text-xs text-gray-500 mt-1">{email} | {phone} | {location}</p>
            </div>
            {/* Summary */}
            <div className="mb-4">
              <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{summary}</p>
            </div>
            {/* Experience */}
            {firstExp && (
              <div className="mb-4">
                <h2 className="text-xs font-bold text-black uppercase tracking-widest mb-2">Experience</h2>
                <div>
                  <p className="text-xs font-medium text-black">{firstExp.position}</p>
                  <p className="text-xs text-gray-500">{firstExp.company} • {firstExp.startDate} - {firstExp.current ? "Present" : firstExp.endDate}</p>
                </div>
              </div>
            )}
            {/* Education */}
            {firstEdu && (
              <div className="mb-4">
                <h2 className="text-xs font-bold text-black uppercase tracking-widest mb-2">Education</h2>
                <p className="text-xs text-black">{firstEdu.degree} in {firstEdu.field}</p>
                <p className="text-xs text-gray-500">{firstEdu.institution}</p>
              </div>
            )}
          </div>
        </ScaledWrapper>
      );

    case "template-3": // Creative Bold
      return (
        <ScaledWrapper bgClass="bg-white">
          <div className="flex h-full min-h-[400px]">
            {/* Sidebar */}
            <div className="w-2/5 bg-gradient-to-br from-purple-600 to-indigo-700 p-6 text-white">
              <div className="w-16 h-16 rounded-full bg-white/20 mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl font-bold">{name.charAt(0)}</span>
              </div>
              <h1 className="text-lg font-bold text-center mb-1">{name}</h1>
              <p className="text-xs text-center text-purple-200 mb-4">{personalInfo.tagline || "Professional"}</p>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide mb-1 text-purple-200">Contact</h3>
                  <p className="text-xs text-purple-100">{email}</p>
                  <p className="text-xs text-purple-100">{phone}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide mb-1 text-purple-200">Skills</h3>
                  <div className="flex flex-wrap gap-1">
                    {allSkills.slice(0, 4).map((skill, i) => (
                      <span key={i} className="text-xs bg-white/20 px-1.5 py-0.5 rounded">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Main content */}
            <div className="flex-1 p-6">
              <div className="mb-4">
                <h2 className="text-sm font-bold text-purple-700 mb-2">About Me</h2>
                <p className="text-xs text-gray-700 line-clamp-2">{summary}</p>
              </div>
              {firstExp && (
                <div>
                  <h2 className="text-sm font-bold text-purple-700 mb-2">Experience</h2>
                  <p className="text-xs font-semibold text-gray-900">{firstExp.position}</p>
                  <p className="text-xs text-gray-500">{firstExp.company}</p>
                </div>
              )}
            </div>
          </div>
        </ScaledWrapper>
      );

    case "template-4": // Tech Focus
      return (
        <ScaledWrapper bgClass="bg-slate-900">
          <div className="p-8 font-mono">
            {/* Header with accent */}
            <div className="pb-4 border-b border-cyan-500/30 mb-4">
              <h1 className="text-2xl font-bold text-cyan-400">{name}</h1>
              <p className="text-xs text-slate-400 mt-1">{email} | {phone}</p>
            </div>
            {/* Skills emphasis */}
            <div className="mb-4">
              <h2 className="text-xs font-bold text-cyan-400 uppercase mb-2">// Tech Stack</h2>
              <div className="flex gap-1.5 flex-wrap">
                {allSkills.map((skill, i) => (
                  <span key={i} className="text-xs bg-slate-800 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded">{skill}</span>
                ))}
              </div>
            </div>
            {/* Experience */}
            {firstExp && (
              <div className="mb-4">
                <h2 className="text-xs font-bold text-cyan-400 uppercase mb-2">// Experience</h2>
                <div>
                  <p className="text-xs font-semibold text-slate-200">{firstExp.position}</p>
                  <p className="text-xs text-slate-500">{firstExp.company} | {firstExp.startDate}</p>
                  <ul className="mt-1">
                    {firstExp.highlights.slice(0, 1).map((h, i) => (
                      <li key={i} className="text-xs text-slate-400 flex"><span className="text-cyan-500 mr-1">→</span>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </ScaledWrapper>
      );

    case "template-5": // Executive
      return (
        <ScaledWrapper bgClass="bg-stone-50">
          <div className="p-8 font-serif">
            {/* Elegant header */}
            <div className="text-center pb-4 mb-4">
              <h1 className="text-2xl font-light text-stone-800 tracking-wide">{name.toUpperCase()}</h1>
              <div className="w-16 h-px bg-amber-600 mx-auto my-2" />
              <p className="text-xs text-stone-500">{email} • {phone} • {location}</p>
            </div>
            {/* Executive summary */}
            <div className="border-l-2 border-amber-600 pl-4 mb-4">
              <p className="text-xs text-stone-600 italic leading-relaxed line-clamp-2">{summary}</p>
            </div>
            {/* Experience */}
            {firstExp && (
              <div className="mb-4">
                <h2 className="text-xs font-bold text-stone-700 uppercase tracking-widest mb-2">Professional Experience</h2>
                <div>
                  <p className="text-xs font-semibold text-stone-800">{firstExp.position}</p>
                  <p className="text-xs text-stone-500">{firstExp.company} | {firstExp.startDate} - {firstExp.current ? "Present" : firstExp.endDate}</p>
                </div>
              </div>
            )}
            {/* Education */}
            {firstEdu && (
              <div>
                <h2 className="text-xs font-bold text-stone-700 uppercase tracking-widest mb-2">Education</h2>
                <p className="text-xs text-stone-800">{firstEdu.degree} in {firstEdu.field}</p>
                <p className="text-xs text-stone-500">{firstEdu.institution}</p>
              </div>
            )}
          </div>
        </ScaledWrapper>
      );

    case "template-6": // ATS Optimized
      return (
        <ScaledWrapper>
          <div className="p-8 font-sans">
            {/* Simple header */}
            <div className="pb-3 border-b border-gray-400 mb-3">
              <h1 className="text-xl font-bold text-gray-900">{name}</h1>
              <p className="text-xs text-gray-600">{email} | {phone} | {location}</p>
            </div>
            {/* Summary */}
            <div className="mb-3">
              <h2 className="text-xs font-bold text-gray-900 uppercase mb-1">Summary</h2>
              <p className="text-xs text-gray-700 line-clamp-2">{summary}</p>
            </div>
            {/* Experience */}
            {firstExp && (
              <div className="mb-3">
                <h2 className="text-xs font-bold text-gray-900 uppercase mb-1">Experience</h2>
                <p className="text-xs font-medium text-gray-800">{firstExp.position} - {firstExp.company}</p>
                <p className="text-xs text-gray-600">{firstExp.startDate} - {firstExp.current ? "Present" : firstExp.endDate}</p>
              </div>
            )}
            {/* Skills */}
            <div className="mb-3">
              <h2 className="text-xs font-bold text-gray-900 uppercase mb-1">Skills</h2>
              <p className="text-xs text-gray-700">{allSkills.join(", ")}</p>
            </div>
            {/* Education */}
            {firstEdu && (
              <div>
                <h2 className="text-xs font-bold text-gray-900 uppercase mb-1">Education</h2>
                <p className="text-xs text-gray-700">{firstEdu.degree} in {firstEdu.field} - {firstEdu.institution}</p>
              </div>
            )}
          </div>
        </ScaledWrapper>
      );

    default:
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-muted to-muted/50">
          <FileText className="size-16 text-muted-foreground/30" />
        </div>
      );
  }
}

export function TemplateSelection({
  templates,
  selectedTemplate,
  onSelectTemplate,
  onBack,
  onDownload,
  onPreview,
  resumeData,
  isGenerating = false,
}: TemplateSelectionProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-semibold">Choose Your Template</h2>
            <p className="text-muted-foreground">
              Select a professional template that best represents you
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onPreview} disabled={!selectedTemplate || isGenerating}>
            <Eye className="size-4 mr-2" />
            Preview
          </Button>
          <Button onClick={onDownload} disabled={!selectedTemplate || isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="size-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`relative cursor-pointer transition-all hover:shadow-lg ${
              selectedTemplate === template.id
                ? "ring-2 ring-primary"
                : "hover:ring-1 hover:ring-border"
            }`}
            onClick={() => !template.isPremium && onSelectTemplate(template.id)}
            onMouseEnter={() => setHoveredTemplate(template.id)}
            onMouseLeave={() => setHoveredTemplate(null)}
          >
            {/* Premium Badge */}
            {template.isPremium && (
              <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">
                  <Crown className="size-3 mr-1" />
                  Premium
                </Badge>
              </div>
            )}

            {/* Selected Indicator */}
            {selectedTemplate === template.id && (
              <div className="absolute top-3 left-3 z-10">
                <div className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground">
                  <Check className="size-4" />
                </div>
              </div>
            )}

            <CardContent className="p-0">
              {/* Template Preview */}
              <div className="relative aspect-[3/4] bg-muted rounded-t-xl overflow-hidden">
                {/* Template mini-preview */}
                <TemplatePreviewThumbnail templateId={template.id} resumeData={resumeData} />

                {/* Hover Overlay */}
                {hoveredTemplate === template.id && !template.isPremium && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Button variant="secondary" size="sm">
                      <Eye className="size-4 mr-2" />
                      Quick Preview
                    </Button>
                  </div>
                )}

                {/* Premium Overlay */}
                {template.isPremium && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                    <Crown className="size-8 text-yellow-500" />
                    <Button variant="secondary" size="sm">
                      Upgrade to Premium
                    </Button>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="p-4 space-y-2">
                <h3 className="font-semibold">{template.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-full bg-primary/10">
                <FileText className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">ATS-Friendly Templates</p>
                <p className="text-sm text-muted-foreground">
                  All our templates are optimized for Applicant Tracking Systems
                </p>
              </div>
            </div>
            <Badge variant="secondary">100% Compatible</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Resume Preview Modal Component
interface ResumePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template | null;
  resumeData: ResumeData;
}

export function ResumePreview({
  isOpen,
  onClose,
  template,
  resumeData,
}: ResumePreviewProps) {
  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">{template.name}</h3>
            <p className="text-sm text-muted-foreground">Preview</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button size="sm">
              <Download className="size-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-8 bg-muted/30">
          <div className="bg-white shadow-lg mx-auto" style={{ width: "8.5in", minHeight: "11in" }}>
            {/* Simple preview representation */}
            <div className="p-12 space-y-8">
              {/* Header */}
              <div className="text-center border-b pb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  {resumeData.personalInfo.fullName}
                </h1>
                <p className="text-gray-600 mt-2">
                  {resumeData.personalInfo.email} • {resumeData.personalInfo.phone} • {resumeData.personalInfo.location}
                </p>
                {resumeData.personalInfo.linkedin && (
                  <p className="text-gray-500 text-sm mt-1">
                    {resumeData.personalInfo.linkedin}
                  </p>
                )}
              </div>

              {/* Summary */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Professional Summary</h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {resumeData.personalInfo.summary}
                </p>
              </div>

              {/* Experience */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Experience</h2>
                {resumeData.experiences.map((exp) => (
                  <div key={exp.id} className="mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{exp.position}</h3>
                        <p className="text-gray-600 text-sm">{exp.company} • {exp.location}</p>
                      </div>
                      <span className="text-gray-500 text-sm">
                        {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {exp.highlights.map((highlight, i) => (
                        <li key={i} className="text-gray-700 text-sm flex items-start">
                          <span className="mr-2">•</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
                <div className="space-y-2">
                  {resumeData.skills.map((skill) => (
                    <div key={skill.id} className="flex">
                      <span className="font-medium text-gray-900 text-sm w-24">{skill.category}:</span>
                      <span className="text-gray-700 text-sm">{skill.items.join(", ")}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Education</h2>
                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {edu.degree} in {edu.field}
                      </h3>
                      <p className="text-gray-600 text-sm">{edu.institution}</p>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {edu.startDate} - {edu.endDate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
