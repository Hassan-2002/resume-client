"use client";

import { useState } from "react";

import {
  Sparkles,
  Check,
  X,
  RefreshCw,
  ArrowRight,
  Lightbulb,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

import { AIReviewResult, AISuggestion } from "./types";

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sectionTitle: string;
  originalContent: string;
  aiReview: AIReviewResult | null;
  onReplace: (newContent: string) => void;
  isLoading?: boolean;
}

export function AISidebar({
  isOpen,
  onClose,
  sectionTitle,
  originalContent,
  aiReview,
  onReplace,
  isLoading = false,
}: AISidebarProps) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null);
  const [customContent, setCustomContent] = useState("");
  const [activeTab, setActiveTab] = useState<"suggestions" | "custom">("suggestions");

  const handleAcceptSuggestion = (suggestion: AISuggestion) => {
    onReplace(suggestion.suggested);
    onClose();
  };

  const handleAcceptCustom = () => {
    if (customContent.trim()) {
      onReplace(customContent);
      onClose();
    }
  };

  const handleRegenerate = () => {
    // This would trigger a new AI call in the real implementation
    console.log("Regenerating suggestions...");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-10 rounded-full bg-primary/10">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div>
              <SheetTitle>AI Writing Assistant</SheetTitle>
              <SheetDescription>Enhance your {sectionTitle}</SheetDescription>
            </div>
          </div>

          {aiReview && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Content Score</span>
                <Badge variant={aiReview.score >= 80 ? "success" : aiReview.score >= 60 ? "warning" : "destructive"}>
                  {aiReview.score}/100
                </Badge>
              </div>
              <Progress value={aiReview.score} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {aiReview.overallFeedback}
              </p>
            </div>
          )}
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Tab Selection */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setActiveTab("suggestions")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === "suggestions"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              AI Suggestions
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === "custom"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Custom Edit
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="size-12 rounded-full border-4 border-muted animate-pulse" />
                <Sparkles className="absolute inset-0 m-auto size-5 text-primary animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">AI is analyzing your content...</p>
            </div>
          ) : activeTab === "suggestions" ? (
            <div className="space-y-4">
              {/* Original Content */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Original
                  </span>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {originalContent}
                  </p>
                </div>
              </div>

              <Separator />

              {/* AI Suggestions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    AI Suggestions
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRegenerate}
                    className="h-7 text-xs"
                  >
                    <RefreshCw className="size-3 mr-1" />
                    Regenerate
                  </Button>
                </div>

                {aiReview?.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`rounded-lg border p-4 space-y-3 transition-all cursor-pointer hover:border-primary/50 ${
                      selectedSuggestion === suggestion
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                    onClick={() => setSelectedSuggestion(suggestion)}
                  >
                    <p className="text-sm leading-relaxed">{suggestion.suggested}</p>
                    
                    <div className="flex items-start gap-2 pt-2 border-t">
                      <Lightbulb className="size-4 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        {suggestion.reasoning}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptSuggestion(suggestion);
                        }}
                        className="flex-1"
                      >
                        <Check className="size-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSuggestion(null);
                        }}
                        className="flex-1"
                      >
                        <X className="size-3 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ))}

                {(!aiReview?.suggestions || aiReview.suggestions.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="size-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No suggestions available</p>
                    <p className="text-xs">Your content looks great!</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Write your own version
                </span>
                <Textarea
                  placeholder="Enter your custom content here..."
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  className="min-h-40"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lightbulb className="size-3" />
                <span>Tip: Use action verbs and quantify your achievements</span>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="mt-6 pt-4 border-t">
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Keep Original
            </Button>
            {activeTab === "custom" && (
              <Button
                onClick={handleAcceptCustom}
                disabled={!customContent.trim()}
                className="flex-1"
              >
                Apply Changes
                <ArrowRight className="size-4 ml-1" />
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
