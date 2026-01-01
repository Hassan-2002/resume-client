import Image from "next/image";

import {
  ArrowRight,
  Blend,
  ChartNoAxesColumn,
  CircleDot,
  Diamond,
} from "lucide-react";

import { DashedLine } from "@/components/dashed-line";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Gemini AI Optimization",
    description:
      "Powered by Google's advanced Gemini AI to craft perfect resumes.",
    icon: CircleDot,
  },
  {
    title: "ATS-Friendly Format",
    description:
      "100% compatible with Applicant Tracking Systems used by top companies.",
    icon: Blend,
  },
  {
    title: "Smart Keywords",
    description:
      "AI analyzes job descriptions and optimizes your resume keywords.",
    icon: Diamond,
  },
  {
    title: "Real-Time Scoring",
    description:
      "Get instant ATS compatibility scores and improvement suggestions.",
    icon: ChartNoAxesColumn,
  },
];

export const Hero = () => {
  return (
    <section className="py-28 lg:py-32 lg:pt-44">
      <div className="container flex flex-col justify-between gap-8 md:gap-14 lg:flex-row lg:gap-30">
        {/* Left side - Main content */}
        <div className="flex-1">
          <h1 className="text-foreground max-w-160 text-4xl tracking-tight md:text-4xl lg:text-3xl">
            Land Your Dream Job with{" "}
            <span className="text-5xl lg:text-6xl">
              <span className="mr-4 underline decoration-indigo-600 decoration-8 underline-offset-3">
                AI
              </span>
              Powered Resume Builder
            </span>
          </h1>
          <p className="text-muted-foreground text-1xl mt-5 md:text-xl">
            Create ATS-friendly resumes in minutes using advanced Gemini AI
            technology. Beat the bots and get noticed by hiring managers.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 lg:flex-nowrap">
            <Button asChild>
              <a href="/ats-score">Get your ATS Score!</a>
            </Button>
            <Button
              variant="outline"
              className="from-background h-auto gap-2 bg-linear-to-r to-transparent shadow-md"
              asChild
            >
              <a
                href="/resume-builder"
                className="max-w-56 truncate text-start md:max-w-none"
              >
                Build your resume
                <ArrowRight className="stroke-3" />
              </a>
            </Button>
          </div>
        </div>

        {/* Right side - Features */}
        <div className="relative flex flex-1 flex-col justify-center space-y-5 max-lg:pt-10 lg:pl-10">
          <DashedLine
            orientation="vertical"
            className="absolute top-0 left-0 max-lg:hidden"
          />
          <DashedLine
            orientation="horizontal"
            className="absolute top-0 lg:hidden"
          />
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="flex gap-2.5 lg:gap-5">
                <Icon className="text-foreground mt-1 size-4 shrink-0 lg:size-5" />
                <div>
                  <h2 className="font-text text-foreground font-semibold">
                    {feature.title}
                  </h2>
                  <p className="text-muted-foreground max-w-76 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 max-lg:ml-6 max-lg:h-[550px] max-lg:overflow-hidden md:mt-20 lg:container lg:mt-24">
        <div className="relative h-[793px] w-full">
          <Image
            src="/mainpagefeature.png"
            alt="Mainline CV Resume Builder"
            fill
            className="rounded-2xl object-cover object-left-top shadow-lg max-lg:rounded-tr-none"
          />
        </div>
      </div>
    </section>
  );
};
