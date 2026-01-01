"use client";

import { useState } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  GripVertical,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import {
  Experience,
  Project,
  Education,
  Skill,
  Certification,
  PersonalInfo,
  AIReviewResult,
} from "./types";

// Base Section Header Component
interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  onAddItem?: () => void;
  onAIReview?: () => void;
  hasAIReview?: boolean;
  aiScore?: number;
  itemCount?: number;
}

export function SectionHeader({
  title,
  icon,
  onAddItem,
  onAIReview,
  hasAIReview,
  aiScore,
  itemCount,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {itemCount !== undefined && (
            <p className="text-sm text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {hasAIReview && aiScore !== undefined && (
          <Badge variant={aiScore >= 80 ? "success" : aiScore >= 60 ? "warning" : "outline"}>
            {aiScore >= 80 ? (
              <CheckCircle2 className="size-3 mr-1" />
            ) : (
              <AlertCircle className="size-3 mr-1" />
            )}
            {aiScore}/100
          </Badge>
        )}
        {onAIReview && (
          <Button variant="outline" size="sm" onClick={onAIReview}>
            <Sparkles className="size-4 mr-1" />
            Write with AI
          </Button>
        )}
        {onAddItem && (
          <Button variant="outline" size="sm" onClick={onAddItem}>
            <Plus className="size-4 mr-1" />
            Add
          </Button>
        )}
      </div>
    </div>
  );
}

// Personal Info Section
interface PersonalInfoSectionProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
  onAIReview: () => void;
  aiReview?: AIReviewResult;
}

export function PersonalInfoSection({
  data,
  onChange,
  onAIReview,
  aiReview,
}: PersonalInfoSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl">Personal Information</CardTitle>
            {aiReview && (
              <Badge variant={aiReview.score >= 80 ? "success" : "warning"}>
                {aiReview.score}/100
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onAIReview}>
              <Sparkles className="size-4 mr-1" />
              Write with AI
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={data.fullName}
                onChange={(e) => onChange({ ...data, fullName: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => onChange({ ...data, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={data.phone}
                onChange={(e) => onChange({ ...data, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={data.location}
                onChange={(e) => onChange({ ...data, location: e.target.value })}
                placeholder="San Francisco, CA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={data.linkedin || ""}
                onChange={(e) => onChange({ ...data, linkedin: e.target.value })}
                placeholder="linkedin.com/in/johndoe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                value={data.github || ""}
                onChange={(e) => onChange({ ...data, github: e.target.value })}
                placeholder="github.com/johndoe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio</Label>
              <Input
                id="portfolio"
                value={data.portfolio || ""}
                onChange={(e) => onChange({ ...data, portfolio: e.target.value })}
                placeholder="johndoe.dev"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="summary">Professional Summary</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={onAIReview}
                className="h-7 text-xs"
              >
                <Sparkles className="size-3 mr-1" />
                Enhance with AI
              </Button>
            </div>
            <Textarea
              id="summary"
              value={data.summary}
              onChange={(e) => onChange({ ...data, summary: e.target.value })}
              placeholder="Write a brief professional summary..."
              className="min-h-24"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Experience Item Component
interface ExperienceItemProps {
  experience: Experience;
  onChange: (experience: Experience) => void;
  onDelete: () => void;
  onAIReview: () => void;
  aiReview?: AIReviewResult;
}

export function ExperienceItem({
  experience,
  onChange,
  onDelete,
  onAIReview,
  aiReview,
}: ExperienceItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...experience.highlights];
    newHighlights[index] = value;
    onChange({ ...experience, highlights: newHighlights });
  };

  const addHighlight = () => {
    onChange({ ...experience, highlights: [...experience.highlights, ""] });
  };

  const removeHighlight = (index: number) => {
    const newHighlights = experience.highlights.filter((_, i) => i !== index);
    onChange({ ...experience, highlights: newHighlights });
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1 cursor-grab text-muted-foreground hover:text-foreground">
            <GripVertical className="size-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{experience.position}</h4>
              {aiReview && (
                <Badge variant={aiReview.score >= 80 ? "success" : "warning"} className="text-xs">
                  {aiReview.score}%
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {experience.company} • {experience.location}
            </p>
            <p className="text-xs text-muted-foreground">
              {experience.startDate} - {experience.current ? "Present" : experience.endDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={onAIReview}>
            <Sparkles className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setIsEditing(!isEditing)}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <>
          {isEditing ? (
            <div className="space-y-4 pt-2 border-t">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input
                    value={experience.position}
                    onChange={(e) => onChange({ ...experience, position: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={experience.company}
                    onChange={(e) => onChange({ ...experience, company: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={experience.location}
                    onChange={(e) => onChange({ ...experience, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    value={experience.startDate}
                    onChange={(e) => onChange({ ...experience, startDate: e.target.value })}
                    placeholder="Jan 2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    value={experience.endDate}
                    onChange={(e) => onChange({ ...experience, endDate: e.target.value })}
                    placeholder="Present"
                    disabled={experience.current}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id={`current-${experience.id}`}
                    checked={experience.current}
                    onCheckedChange={(checked) =>
                      onChange({ ...experience, current: checked as boolean })
                    }
                  />
                  <Label htmlFor={`current-${experience.id}`}>Currently working here</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={experience.description}
                  onChange={(e) => onChange({ ...experience, description: e.target.value })}
                  placeholder="Brief description of your role..."
                />
              </div>
            </div>
          ) : null}

          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Key Achievements</Label>
              <Button variant="ghost" size="sm" onClick={addHighlight} className="h-7 text-xs">
                <Plus className="size-3 mr-1" />
                Add
              </Button>
            </div>
            <ul className="space-y-2">
              {experience.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-2.5 size-1.5 rounded-full bg-primary shrink-0" />
                  <Input
                    value={highlight}
                    onChange={(e) => updateHighlight(index, e.target.value)}
                    placeholder="Describe an achievement..."
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeHighlight(index)}
                    className="shrink-0"
                  >
                    <Trash2 className="size-3 text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

// Project Item Component
interface ProjectItemProps {
  project: Project;
  onChange: (project: Project) => void;
  onDelete: () => void;
  onAIReview: () => void;
  aiReview?: AIReviewResult;
}

export function ProjectItem({
  project,
  onChange,
  onDelete,
  onAIReview,
  aiReview,
}: ProjectItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...project.highlights];
    newHighlights[index] = value;
    onChange({ ...project, highlights: newHighlights });
  };

  const addHighlight = () => {
    onChange({ ...project, highlights: [...project.highlights, ""] });
  };

  const removeHighlight = (index: number) => {
    const newHighlights = project.highlights.filter((_, i) => i !== index);
    onChange({ ...project, highlights: newHighlights });
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1 cursor-grab text-muted-foreground hover:text-foreground">
            <GripVertical className="size-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{project.name}</h4>
              {aiReview && (
                <Badge variant={aiReview.score >= 80 ? "success" : "warning"} className="text-xs">
                  {aiReview.score}%
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{project.description}</p>
            <div className="flex flex-wrap gap-1 pt-1">
              {project.technologies.map((tech, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={onAIReview}>
            <Sparkles className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setIsEditing(!isEditing)}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <>
          {isEditing && (
            <div className="space-y-4 pt-2 border-t">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input
                    value={project.name}
                    onChange={(e) => onChange({ ...project, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link</Label>
                  <Input
                    value={project.link || ""}
                    onChange={(e) => onChange({ ...project, link: e.target.value })}
                    placeholder="github.com/user/project"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={project.description}
                  onChange={(e) => onChange({ ...project, description: e.target.value })}
                  placeholder="Brief description of your project..."
                />
              </div>
              <div className="space-y-2">
                <Label>Technologies (comma-separated)</Label>
                <Input
                  value={project.technologies.join(", ")}
                  onChange={(e) =>
                    onChange({
                      ...project,
                      technologies: e.target.value.split(",").map((t) => t.trim()),
                    })
                  }
                  placeholder="React, Node.js, MongoDB"
                />
              </div>
            </div>
          )}

          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Key Features</Label>
              <Button variant="ghost" size="sm" onClick={addHighlight} className="h-7 text-xs">
                <Plus className="size-3 mr-1" />
                Add
              </Button>
            </div>
            <ul className="space-y-2">
              {project.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-2.5 size-1.5 rounded-full bg-primary shrink-0" />
                  <Input
                    value={highlight}
                    onChange={(e) => updateHighlight(index, e.target.value)}
                    placeholder="Describe a feature or achievement..."
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeHighlight(index)}
                    className="shrink-0"
                  >
                    <Trash2 className="size-3 text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

// Education Item Component
interface EducationItemProps {
  education: Education;
  onChange: (education: Education) => void;
  onDelete: () => void;
}

export function EducationItem({
  education,
  onChange,
  onDelete,
}: EducationItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1 cursor-grab text-muted-foreground hover:text-foreground">
            <GripVertical className="size-4" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold">{education.degree} in {education.field}</h4>
            <p className="text-sm text-muted-foreground">
              {education.institution} • {education.location}
            </p>
            <p className="text-xs text-muted-foreground">
              {education.startDate} - {education.endDate}
              {education.gpa && ` • ${education.gpa}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => setIsEditing(!isEditing)}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && isEditing && (
        <div className="space-y-4 pt-2 border-t">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Institution</Label>
              <Input
                value={education.institution}
                onChange={(e) => onChange({ ...education, institution: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Degree</Label>
              <Input
                value={education.degree}
                onChange={(e) => onChange({ ...education, degree: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Field of Study</Label>
              <Input
                value={education.field}
                onChange={(e) => onChange({ ...education, field: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={education.location}
                onChange={(e) => onChange({ ...education, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Start Year</Label>
              <Input
                value={education.startDate}
                onChange={(e) => onChange({ ...education, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Year</Label>
              <Input
                value={education.endDate}
                onChange={(e) => onChange({ ...education, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>GPA (optional)</Label>
              <Input
                value={education.gpa || ""}
                onChange={(e) => onChange({ ...education, gpa: e.target.value })}
                placeholder="3.8/4.0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Skills Section Component
interface SkillsSectionProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

export function SkillsSection({ skills, onChange }: SkillsSectionProps) {
  const addCategory = () => {
    const newSkill: Skill = {
      id: `skill-${Date.now()}`,
      category: "New Category",
      items: [],
    };
    onChange([...skills, newSkill]);
  };

  const updateSkill = (index: number, skill: Skill) => {
    const newSkills = [...skills];
    newSkills[index] = skill;
    onChange(newSkills);
  };

  const deleteSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Skills</CardTitle>
          <Button variant="outline" size="sm" onClick={addCategory}>
            <Plus className="size-4 mr-1" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {skills.map((skill, index) => (
          <div key={skill.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Input
                value={skill.category}
                onChange={(e) =>
                  updateSkill(index, { ...skill, category: e.target.value })
                }
                className="max-w-48 font-medium"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => deleteSkill(index)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
            <Input
              value={skill.items.join(", ")}
              onChange={(e) =>
                updateSkill(index, {
                  ...skill,
                  items: e.target.value.split(",").map((s) => s.trim()),
                })
              }
              placeholder="Skill 1, Skill 2, Skill 3"
            />
            <div className="flex flex-wrap gap-1">
              {skill.items.filter(Boolean).map((item, i) => (
                <Badge key={i} variant="secondary">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Certifications Section Component
interface CertificationsSectionProps {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
}

export function CertificationsSection({
  certifications,
  onChange,
}: CertificationsSectionProps) {
  const addCertification = () => {
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: "",
      issuer: "",
      date: "",
    };
    onChange([...certifications, newCert]);
  };

  const updateCertification = (index: number, cert: Certification) => {
    const newCerts = [...certifications];
    newCerts[index] = cert;
    onChange(newCerts);
  };

  const deleteCertification = (index: number) => {
    onChange(certifications.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Certifications</CardTitle>
          <Button variant="outline" size="sm" onClick={addCertification}>
            <Plus className="size-4 mr-1" />
            Add Certification
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {certifications.map((cert, index) => (
          <div key={cert.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{cert.name || "New Certification"}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => deleteCertification(index)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                value={cert.name}
                onChange={(e) =>
                  updateCertification(index, { ...cert, name: e.target.value })
                }
                placeholder="Certification Name"
              />
              <Input
                value={cert.issuer}
                onChange={(e) =>
                  updateCertification(index, { ...cert, issuer: e.target.value })
                }
                placeholder="Issuing Organization"
              />
              <Input
                value={cert.date}
                onChange={(e) =>
                  updateCertification(index, { ...cert, date: e.target.value })
                }
                placeholder="Date (e.g., 2024)"
              />
              <Input
                value={cert.link || ""}
                onChange={(e) =>
                  updateCertification(index, { ...cert, link: e.target.value })
                }
                placeholder="Verification Link (optional)"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
