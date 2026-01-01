import { DashedLine } from "@/components/dashed-line";

const stats = [
  {
    value: "50K+",
    label: "Resumes Created",
  },
  {
    value: "95%",
    label: "ATS Pass Rate",
  },
  {
    value: "10K+",
    label: "Jobs Landed",
  },
  {
    value: "4.9",
    label: "User Rating",
  },
];

export function AboutHero() {
  return (
    <section className="">
      <div className="container flex max-w-5xl flex-col justify-between gap-8 md:gap-20 lg:flex-row lg:items-center lg:gap-24 xl:gap-24">
        <div className="flex-[1.5]">
          <h1 className="text-3xl tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Your AI-Powered Career Partner
          </h1>

          <p className="text-muted-foreground mt-5 text-2xl md:text-3xl lg:text-4xl">
            Mainline CV helps you land your dream job with AI-optimized resumes.
          </p>

          <p className="text-muted-foreground mt-8 hidden max-w-lg space-y-6 text-lg text-balance md:block lg:mt-12">
            At Mainline CV, we&apos;re dedicated to transforming how job seekers present 
            themselves to potential employers. Our AI-powered platform analyzes job 
            descriptions, optimizes keywords, and ensures your resume passes through 
            Applicant Tracking Systems with flying colors.
            <br />
            <br />
            We&apos;re obsessed with your career success — investing in cutting-edge AI 
            technology to understand exactly what recruiters are looking for. Whether 
            you&apos;re a fresh graduate or a seasoned professional, Mainline CV gives 
            you the competitive edge you need to stand out in today&apos;s job market.
          </p>
        </div>

        <div
          className={`relative flex flex-1 flex-col justify-center gap-3 pt-10 lg:pt-0 lg:pl-10`}
        >
          <DashedLine
            orientation="vertical"
            className="absolute top-0 left-0 max-lg:hidden"
          />
          <DashedLine
            orientation="horizontal"
            className="absolute top-0 lg:hidden"
          />
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <div className="font-display text-4xl tracking-wide md:text-5xl">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
