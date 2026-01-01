import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const categories = [
  {
    title: "AI & ATS Optimization",
    questions: [
      {
        question: "How does the AI optimize my resume for ATS systems?",
        answer:
          "Our AI uses advanced natural language processing from Gemini and OpenAI to analyze job descriptions, identify key requirements, and automatically optimize your resume with the right keywords, formatting, and structure that ATS systems prefer.",
      },
      {
        question: "What ATS systems does this work with?",
        answer:
          "Our resume builder is compatible with all major ATS systems including Workday, Greenhouse, Lever, BambooHR, and many others. We continuously update our algorithms to ensure maximum compatibility.",
      },
      {
        question: "How accurate is the ATS score?",
        answer:
          "Our ATS scoring algorithm is trained on thousands of resumes and hiring data. It provides 95%+ accuracy in predicting how well your resume will perform with automated screening systems.",
      },
    ],
  },
  {
    title: "Features & Usage",
    questions: [
      {
        question: "Can I customize the AI suggestions?",
        answer:
          "Yes! While our AI provides intelligent recommendations, you have full control to accept, modify, or reject any suggestions. The tool learns from your preferences to provide better recommendations over time.",
      },
      {
        question: "How long does it take to create a resume?",
        answer:
          "Most users create a fully optimized, ATS-friendly resume in under 10 minutes. The AI handles the heavy lifting of keyword optimization and formatting while you focus on your content.",
      },
    ],
  },
  {
    title: "Success & Results",
    questions: [
      {
        question: "How much can this improve my job application success?",
        answer:
          "Our users report getting 3-5x more interview callbacks after using our AI resume builder. The ATS optimization ensures your resume gets past automated screening to reach human recruiters.",
      },
      {
        question: "Do you guarantee job placement?",
        answer:
          "While we can't guarantee specific job outcomes, our AI-optimized resumes significantly increase your chances of getting past ATS systems and landing interviews at top companies. Success depends on various factors including market conditions and individual qualifications.",
      },
    ],
  },
];

export const FAQ = ({
  headerTag = "h2",
  className,
  className2,
}: {
  headerTag?: "h1" | "h2";
  className?: string;
  className2?: string;
}) => {
  return (
    <section className={cn("py-28 lg:py-32", className)}>
      <div className="container max-w-5xl">
        <div className={cn("mx-auto grid gap-16 lg:grid-cols-2", className2)}>
          <div className="space-y-4">
            {headerTag === "h1" ? (
              <h1 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
                Got Questions?
              </h1>
            ) : (
              <h2 className="text-2xl tracking-tight md:text-4xl lg:text-5xl">
                Got Questions?
              </h2>
            )}
            <p className="text-muted-foreground max-w-md leading-snug lg:mx-auto">
              Learn more about our AI-powered resume optimization.{" "}
              <Link href="/contact" className="underline underline-offset-4">
                Contact support
              </Link>
              .
            </p>
          </div>

          <div className="grid gap-6 text-start">
            {categories.map((category, categoryIndex) => (
              <div key={category.title} className="">
                <h3 className="text-muted-foreground border-b py-4">
                  {category.title}
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, i) => (
                    <AccordionItem key={i} value={`${categoryIndex}-${i}`}>
                      <AccordionTrigger>{item.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
