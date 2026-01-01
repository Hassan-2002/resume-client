"use client";

import { useState } from "react";
import {
  User,
  Briefcase,
  FolderKanban,
  GraduationCap,
  Wrench,
  Award,
  Plus,
  Settings2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Eye,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Section configuration type
export interface SectionConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  order: number;
  required?: boolean;
  description?: string;
}

// Default sections configuration
export const defaultSections: SectionConfig[] = [
  {
    id: "personalInfo",
    name: "Personal Information",
    icon: <User className="size-4" />,
    enabled: true,
    order: 0,
    required: true,
    description: "Your name, contact info, and professional summary",
  },
  {
    id: "experience",
    name: "Work Experience",
    icon: <Briefcase className="size-4" />,
    enabled: true,
    order: 1,
    description: "Your professional work history and achievements",
  },
  {
    id: "projects",
    name: "Projects",
    icon: <FolderKanban className="size-4" />,
    enabled: true,
    order: 2,
    description: "Personal projects, portfolio items, or open-source contributions",
  },
  {
    id: "education",
    name: "Education",
    icon: <GraduationCap className="size-4" />,
    enabled: true,
    order: 3,
    description: "Your academic background and qualifications",
  },
  {
    id: "skills",
    name: "Skills",
    icon: <Wrench className="size-4" />,
    enabled: true,
    order: 4,
    description: "Technical and soft skills organized by category",
  },
  {
    id: "certifications",
    name: "Certifications",
    icon: <Award className="size-4" />,
    enabled: true,
    order: 5,
    description: "Professional certifications and licenses",
  },
];

interface SectionManagerProps {
  sections: SectionConfig[];
  onSectionsChange: (sections: SectionConfig[]) => void;
  onAddSection?: (sectionId: string) => void;
}

export function SectionManager({
  sections,
  onSectionsChange,
  onAddSection,
}: SectionManagerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSection = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section?.required) return; // Don't toggle required sections

    const updated = sections.map((s) =>
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    );
    onSectionsChange(updated);
  };

  const moveSection = (sectionId: string, direction: "up" | "down") => {
    const currentIndex = sections.findIndex((s) => s.id === sectionId);
    if (currentIndex === -1) return;

    const newIndex =
      direction === "up"
        ? Math.max(1, currentIndex - 1) // Can't move above personalInfo (index 0)
        : Math.min(sections.length - 1, currentIndex + 1);

    if (currentIndex === newIndex) return;

    const newSections = [...sections];
    const [removed] = newSections.splice(currentIndex, 1);
    newSections.splice(newIndex, 0, removed);

    // Update order numbers
    onSectionsChange(newSections.map((s, i) => ({ ...s, order: i })));
  };

  const enabledCount = sections.filter((s) => s.enabled).length;
  const disabledCount = sections.filter((s) => !s.enabled).length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-dashed">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
                  <Settings2 className="size-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Manage Sections</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {enabledCount} active{disabledCount > 0 ? `, ${disabledCount} hidden` : ""}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                {isOpen ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="space-y-2">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    section.enabled
                      ? "bg-background"
                      : "bg-muted/30 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Drag Handle (visual only for now) */}
                    {!section.required && index > 0 && (
                      <div className="flex flex-col -space-y-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-6"
                          onClick={() => moveSection(section.id, "up")}
                          disabled={index === 1 || !section.enabled}
                        >
                          <ChevronUp className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-6"
                          onClick={() => moveSection(section.id, "down")}
                          disabled={
                            index === sections.length - 1 || !section.enabled
                          }
                        >
                          <ChevronDown className="size-3" />
                        </Button>
                      </div>
                    )}
                    {(section.required || index === 0) && (
                      <div className="w-6 h-8" /> // Spacer for required sections
                    )}

                    <div
                      className={`flex items-center justify-center size-8 rounded-lg ${
                        section.enabled ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      <span
                        className={section.enabled ? "text-primary" : "text-muted-foreground"}
                      >
                        {section.icon}
                      </span>
                    </div>

                    <div>
                      <Label
                        htmlFor={`section-${section.id}`}
                        className="font-medium cursor-pointer"
                      >
                        {section.name}
                        {section.required && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (Required)
                          </span>
                        )}
                      </Label>
                      {section.description && (
                        <p className="text-xs text-muted-foreground">
                          {section.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!section.required && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {section.enabled ? (
                            <Eye className="size-3.5 inline mr-1" />
                          ) : (
                            <EyeOff className="size-3.5 inline mr-1" />
                          )}
                          {section.enabled ? "Visible" : "Hidden"}
                        </span>
                        <Switch
                          id={`section-${section.id}`}
                          checked={section.enabled}
                          onCheckedChange={() => toggleSection(section.id)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick add section hint */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                💡 Tip: Hide sections that aren&apos;t relevant to your target role.
                ATS systems work best with focused resumes.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// Helper hook for managing sections
export function useSectionManager(initialSections = defaultSections) {
  const [sections, setSections] = useState<SectionConfig[]>(initialSections);

  const isSectionEnabled = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    return section?.enabled ?? true;
  };

  const getEnabledSections = () => {
    return sections.filter((s) => s.enabled).sort((a, b) => a.order - b.order);
  };

  const resetSections = () => {
    setSections(defaultSections);
  };

  return {
    sections,
    setSections,
    isSectionEnabled,
    getEnabledSections,
    resetSections,
  };
}
