"use client";

import { PortfolioStar } from "~/components/portfolio-actions";
import ListeningWidget from "~/components/listening-widget";
import ProfileHeadline from "~/components/profile-headline";
import { cn } from "~/lib/utils";
import { typo } from "./ui/typograpghy";
import ProfilePicture from "~/components/profile-picture";
import CompanyBadge from "~/components/ui/company-badge";
// import { annotationsConfig } from "~/constants/anime";

const AboutSection = () => {
  return (
    <section id="about" className="grid gap-8 sm:gap-4 md:grid-cols-3" aria-label="About">
      <div className="order-2 space-y-3 sm:order-1 md:col-span-2">
        <div>
          <h1 className="font-ubuntu text-lg font-semibold sm:text-xl">
            Sanskar Gupta{" "}
            <span className="inline-flex items-center gap-1.5">
              <span className="text-italic font-normal text-[#00adb5]">aka Ayush</span>
              <PortfolioStar />
            </span>
          </h1>
          <ProfileHeadline />
        </div>

        <p className={typo({ variant: "paragraph", font: "sans" })}>
          <span>Product-focused Software Developer</span> who ships fast and builds for impact. I
          turn ideas into <span className="text-[#00adb5]">scalable, production-ready systems</span>{" "}
          and obsess over the details that make software reliable, efficient, and secure.
        </p>

        <p className={typo({ variant: "paragraph", font: "sans" })}>
          Building <span className="text-[#00adb5]">PioWorker</span> at{" "}
          <CompanyBadge company="piovation" />, spanning UI/UX, backend connectors, and code
          execution; automated QA with{" "}
          <span className="text-[#00adb5]">Playwright, Jenkins, and Grafana</span>, cutting manual
          testing by <span className="text-[#00adb5]">~90%</span>.
        </p>

        <p className={typo({ variant: "paragraph", font: "sans" })}>
          Built <CompanyBadge company="electronicx" />
          's return automation handling{" "}
          <span className="text-[#00adb5]">€520K+ across 5,000+ returns</span>, saving{" "}
          <span className="text-[#00adb5]">2,000+ staff hours</span>. Previously developed{" "}
          <span className="text-[#00adb5]">Studdy-Buddy</span> using{" "}
          <span className="text-[#00adb5]">Gemini AI and RAG</span>, and{" "}
          <CompanyBadge company="aptidude" />
          's <span className="text-[#00adb5]">MERN examination platform</span> with real-time
          anti-cheating detection.
        </p>

        <p className={typo({ variant: "paragraph", font: "sans" })}>
          <span className="text-[#00adb5]">3+ years</span> building.{" "}
          <span className="text-[#00adb5]">30+ freelance products</span> shipped. I don't chase
          trends - I build systems that work.
          <span className="text-[#00adb5]"> 0 → 1 → 100.</span> Head down, code up, goal clear.
        </p>

        <p className={cn(typo({ variant: "paragraph", font: "sans" }), "sm:!mt-4")}>
          <span className="text-[#00adb5]">Open to Work:</span> Full-Time, Freelance, or Collabs.{" "}
          <a href="#contact" aria-label="Hire Me" className="el-focus-styles text-ring">
            Let's talk.
          </a>
        </p>
      </div>

      <div className="order-1 min-w-0 space-y-6 sm:order-2">
        <div className="sm:hidden md:block">
          <ProfilePicture />
        </div>
        <ListeningWidget />
      </div>
    </section>
  );
};

export default AboutSection;
