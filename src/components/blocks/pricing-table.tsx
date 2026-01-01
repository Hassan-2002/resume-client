"use client";

import { useState } from "react";
import Link from "next/link";

import { Check, ChevronsUpDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FeatureSection {
  category: string;
  features: {
    name: string;
    free: true | false | null | string;
    startup: true | false | null | string;
    enterprise: true | false | null | string;
  }[];
}

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    button: {
      text: "Get started",
      variant: "outline" as const,
      href: "/signup",
    },
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    button: {
      text: "Upgrade now",
      variant: "default" as const,
      href: "/signup?plan=pro",
    },
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    button: {
      text: "Contact sales",
      variant: "outline" as const,
      href: "/contact",
    },
  },
];

const comparisonFeatures: FeatureSection[] = [
  {
    category: "Resume Analysis",
    features: [
      {
        name: "ATS Score Analysis",
        free: "3 credits",
        startup: "Unlimited",
        enterprise: "Unlimited",
      },
      {
        name: "Keyword Optimization",
        free: true,
        startup: true,
        enterprise: true,
      },
      {
        name: "Job Description Matching",
        free: true,
        startup: true,
        enterprise: true,
      },
      {
        name: "Detailed Recommendations",
        free: true,
        startup: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Resume Builder",
    features: [
      {
        name: "Professional Templates",
        free: "3 templates",
        startup: "All templates",
        enterprise: "Custom templates",
      },
      {
        name: "AI-Powered Suggestions",
        free: null,
        startup: true,
        enterprise: true,
      },
      {
        name: "Export to PDF",
        free: true,
        startup: true,
        enterprise: true,
      },
      {
        name: "Multiple Resume Versions",
        free: "1 resume",
        startup: "Unlimited",
        enterprise: "Unlimited",
      },
    ],
  },
  {
    category: "AI Features",
    features: [
      {
        name: "Gemini AI Integration",
        free: null,
        startup: true,
        enterprise: true,
      },
      {
        name: "Smart Content Generation",
        free: null,
        startup: true,
        enterprise: true,
      },
      {
        name: "Industry-Specific Optimization",
        free: null,
        startup: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Support",
    features: [
      {
        name: "Email Support",
        free: true,
        startup: true,
        enterprise: true,
      },
      {
        name: "Priority Support",
        free: null,
        startup: true,
        enterprise: true,
      },
      {
        name: "Dedicated Account Manager",
        free: null,
        startup: null,
        enterprise: true,
      },
    ],
  },
];

const renderFeatureValue = (value: true | false | null | string) => {
  if (value === true) {
    return <Check className="size-5 text-green-600" />;
  }
  if (value === false) {
    return <X className="size-5 text-red-500" />;
  }
  if (value === null) {
    return <span className="text-muted-foreground">—</span>;
  }
  // String value
  return (
    <div className="flex items-center gap-2">
      <Check className="size-4 text-green-600" />
      <span className="text-muted-foreground">{value}</span>
    </div>
  );
};

export const PricingTable = () => {
  const [selectedPlan, setSelectedPlan] = useState(1); // Default to Pro plan

  return (
    <section className="pb-28 lg:py-32">
      <div className="container">
        <PlanHeaders
          selectedPlan={selectedPlan}
          onPlanChange={setSelectedPlan}
        />
        <FeatureSections selectedPlan={selectedPlan} />
      </div>
    </section>
  );
};

const PlanHeaders = ({
  selectedPlan,
  onPlanChange,
}: {
  selectedPlan: number;
  onPlanChange: (index: number) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="">
      {/* Mobile View */}
      <div className="md:hidden">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="">
          <div className="flex items-center justify-between border-b py-4">
            <CollapsibleTrigger className="flex items-center gap-2">
              <div>
                <h3 className="text-2xl font-semibold">
                  {pricingPlans[selectedPlan].name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {pricingPlans[selectedPlan].price}
                  {pricingPlans[selectedPlan].period}
                </p>
              </div>
              <ChevronsUpDown
                className={`size-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </CollapsibleTrigger>
            <Button
              variant={pricingPlans[selectedPlan].button.variant}
              className="w-fit"
              asChild
            >
              <Link href={pricingPlans[selectedPlan].button.href}>
                {pricingPlans[selectedPlan].button.text}
              </Link>
            </Button>
          </div>
          <CollapsibleContent className="flex flex-col space-y-2 p-2">
            {pricingPlans.map(
              (plan, index) =>
                index !== selectedPlan && (
                  <Button
                    size="lg"
                    variant="secondary"
                    key={index}
                    onClick={() => {
                      onPlanChange(index);
                      setIsOpen(false);
                    }}
                  >
                    {plan.name} - {plan.price}{plan.period}
                  </Button>
                ),
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Desktop View */}
      <div className="grid grid-cols-4 gap-4 max-md:hidden">
        <div className="col-span-1 max-md:hidden"></div>

        {pricingPlans.map((plan, index) => (
          <div key={index} className="">
            <h3 className="mb-1 text-2xl font-semibold">{plan.name}</h3>
            <p className="text-muted-foreground mb-3">
              <span className="text-foreground text-3xl font-bold">{plan.price}</span>
              {plan.period}
            </p>
            <Button variant={plan.button.variant} className="" asChild>
              <Link href={plan.button.href}>{plan.button.text}</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const FeatureSections = ({ selectedPlan }: { selectedPlan: number }) => (
  <>
    {comparisonFeatures.map((section, sectionIndex) => (
      <div key={sectionIndex} className="">
        <div className="border-primary/40 border-b py-4">
          <h3 className="text-lg font-semibold">{section.category}</h3>
        </div>
        {section.features.map((feature, featureIndex) => (
          <div
            key={featureIndex}
            className="text-foreground grid grid-cols-2 font-medium max-md:border-b md:grid-cols-4"
          >
            <span className="inline-flex items-center py-4">
              {feature.name}
            </span>
            {/* Mobile View - Only Selected Plan */}
            <div className="md:hidden">
              <div className="flex items-center gap-1 py-4 md:border-b">
                {renderFeatureValue(
                  [feature.free, feature.startup, feature.enterprise][
                    selectedPlan
                  ],
                )}
              </div>
            </div>
            {/* Desktop View - All Plans */}
            <div className="hidden md:col-span-3 md:grid md:grid-cols-3 md:gap-4">
              {[feature.free, feature.startup, feature.enterprise].map(
                (value, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 border-b py-4"
                  >
                    {renderFeatureValue(value)}
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    ))}
  </>
);
