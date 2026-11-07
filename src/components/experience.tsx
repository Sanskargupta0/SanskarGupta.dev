"use client";

import { useId, useState, type AriaAttributes, type ComponentType } from "react";
import { ChevronDown, ChevronRight, ExternalLink, Plug, Theater, Workflow } from "lucide-react";
import {
  SiDocker,
  SiExpress,
  SiFastapi,
  SiGithubactions,
  SiGrafana,
  SiJenkins,
  SiJsonwebtokens,
  SiMongodb,
  SiNodedotjs,
  SiReact,
  SiTailwindcss,
} from "react-icons/si";
import { cn } from "~/lib/utils";
import Image from "next/image";
import CornerHeading from "~/components/ui/corner-heading";

type Experience = {
  role: string;
  company: string;
  companyUrl: string;
  logo: string;
  period: string;
  location: string;
  bullets: string[];
  stack: string[];
};

const experiences: Experience[] = [
  {
    role: "Software Developer",
    company: "Piovation GmbH",
    logo: "/images/companies/piovation.png",
    companyUrl: "https://piovation.com/",
    period: "10/2025 - Present",
    location: "Grasbrunn, Germany",
    bullets: [
      "Build PioWorker, an AI workflow automation platform, developing backend connectors, custom code execution, and a revamped frontend for smoother workflow configuration.",
      "Automate end-to-end testing with Playwright and Jenkins, reducing manual testing by ~90%; deliver Grafana dashboards for team-wide visibility into test results.",
    ],
    stack: ["Playwright", "Jenkins", "Grafana", "Workflow Automation", "API Integrations"],
  },
  {
    role: "Software Developer",
    company: "Electronicx GmbH",
    logo: "/images/companies/electronicx.ico",
    companyUrl: "https://electronicx.de/",
    period: "10/2024 - 09/2025",
    location: "Hindenburgstr, Germany",
    bullets: [
      "Automate return processing and fraud detection for 5,000+ returns worth €520K+, reducing manual effort by ~90% and saving an estimated 2,000+ staff hours.",
      "Build analytics, notifications, and scraping microservices with Node.js, FastAPI, Docker, and GitHub Actions; deliver secure dashboards with JWT authentication and WebSockets.",
    ],
    stack: ["Node.js", "React", "FastAPI", "Docker", "TailwindCSS", "GitHub Actions"],
  },
  {
    role: "Full Stack Developer Intern",
    company: "AptiDude",
    logo: "/images/companies/aptidude.png",
    companyUrl: "https://aptidude.in/",
    period: "02/2024 - 09/2024",
    location: "Kharagpur, India",
    bullets: [
      "Build a MERN examination platform with real-time anti-cheating detection, JWT authentication, and multi-tenant access.",
      "Develop admin tools for test creation, user management, and performance analytics.",
    ],
    stack: ["MongoDB", "Express", "React", "Node.js", "JWT"],
  },
];

const technologies: Record<
  string,
  {
    Icon: ComponentType<{ className?: string; "aria-hidden"?: AriaAttributes["aria-hidden"] }>;
    color: string;
  }
> = {
  Playwright: { Icon: Theater, color: "text-green-600 dark:text-green-400" },
  Jenkins: { Icon: SiJenkins, color: "text-red-600 dark:text-red-400" },
  Grafana: { Icon: SiGrafana, color: "text-orange-500" },
  "Workflow Automation": { Icon: Workflow, color: "text-violet-500 dark:text-violet-400" },
  "API Integrations": { Icon: Plug, color: "text-sky-600 dark:text-sky-400" },
  "Node.js": { Icon: SiNodedotjs, color: "text-green-600 dark:text-green-400" },
  React: { Icon: SiReact, color: "text-sky-500" },
  FastAPI: { Icon: SiFastapi, color: "text-teal-600 dark:text-teal-400" },
  Docker: { Icon: SiDocker, color: "text-blue-500" },
  TailwindCSS: { Icon: SiTailwindcss, color: "text-sky-500" },
  "GitHub Actions": { Icon: SiGithubactions, color: "text-blue-500" },
  MongoDB: { Icon: SiMongodb, color: "text-green-600 dark:text-green-400" },
  Express: { Icon: SiExpress, color: "text-foreground" },
  JWT: { Icon: SiJsonwebtokens, color: "text-pink-600 dark:text-pink-400" },
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
function formatPeriod(period: string, compact = false) {
  return period
    .split(" - ")
    .map((part) => {
      const match = /^(\d{2})\/(\d{4})$/.exec(part);
      if (!match) return part;
      const month = months[Number(match[1]) - 1];
      return compact ? month.slice(0, 3) + " " + match[2].slice(2) : month + " " + match[2];
    })
    .join(" - ");
}

function HighlightMetrics({ text }: { text: string }) {
  return (
    <>
      {text.split(/((?:~|\u20ac)?\d[\d,]*(?:\.\d+)?[KM]?(?:\+|%)?)/g).map((part, index) =>
        index % 2 ? (
          <strong
            key={index}
            data-experience-metric
            className="font-semibold text-teal-700 dark:text-[#00adb5]"
          >
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </>
  );
}

function Technology({ name }: { name: string }) {
  const { Icon, color } = technologies[name];
  return (
    <span
      role="img"
      aria-label={name}
      tabIndex={0}
      title={name}
      className="group inline-flex items-center gap-0 rounded-md border border-dashed border-border bg-muted/50 px-2 py-1 text-sm font-medium text-foreground outline-none transition-all duration-200 hover:gap-1.5 hover:bg-muted focus-visible:gap-1.5 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
    >
      <Icon className={cn("size-4 shrink-0", color)} aria-hidden={true} />
      <span
        aria-hidden="true"
        className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:max-w-40 group-hover:opacity-100 group-focus-visible:max-w-40 group-focus-visible:opacity-100 motion-reduce:transition-none"
      >
        {name}
      </span>
    </span>
  );
}

function ExperienceRow({ experience }: { experience: Experience }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const current = experience.period.endsWith("Present");
  return (
    <article
      aria-label={experience.company}
      className="group/experience relative py-3 pl-11 pr-3 sm:pr-4"
    >
      <span
        aria-hidden="true"
        data-experience-dot={current ? "active" : "past"}
        className={cn(
          "absolute left-[29px] top-8 z-10 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background",
          current
            ? "bg-[#02ff67] shadow-[0_0_6px_rgba(2,255,103,0.5)]"
            : "bg-[#ff3333] shadow-[0_0_6px_rgba(255,51,51,0.5)]"
        )}
      />
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[7px] bg-[#151515]">
            <Image
              src={experience.logo}
              alt={experience.company + " logo"}
              width={40}
              height={40}
              unoptimized
              className="size-10 object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex min-h-[22px] flex-wrap items-center gap-1.5">
              <h3 className="text-sm font-semibold leading-tight">
                <a
                  href={experience.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-sm transition-colors hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:text-[#00adb5]"
                >
                  {experience.company}
                  <ExternalLink
                    aria-hidden="true"
                    className="size-3 shrink-0 text-muted-foreground"
                  />
                </a>
              </h3>
              <span
                className={cn(
                  "inline-flex h-[18px] items-center gap-1 rounded px-1.5 text-[10px] text-muted-foreground",
                  current ? "bg-green-500/10" : "bg-red-500/10"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn("size-1 rounded-full", current ? "bg-[#02ff67]" : "bg-[#ff3333]")}
                />
                {current ? "Active" : "Done"}
              </span>
            </div>
            <p className="text-[13px] leading-5 text-muted-foreground">{experience.role}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-start gap-2">
          <div className="hidden text-right text-xs leading-5 text-muted-foreground sm:block">
            <p>{formatPeriod(experience.period)}</p>
            <p>{experience.location}</p>
          </div>
          <button
            type="button"
            aria-label={(open ? "Collapse " : "Expand ") + experience.company + " details"}
            aria-expanded={open}
            aria-controls={id}
            onClick={() => setOpen((value) => !value)}
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:opacity-0 md:focus-visible:opacity-100 md:group-hover/experience:opacity-100",
              open && "bg-muted text-foreground md:opacity-100"
            )}
          >
            {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-2 pl-12 text-xs leading-5 text-muted-foreground sm:hidden">
        <span>{formatPeriod(experience.period, true)}</span>
        <span>{experience.location}</span>
      </div>
      <div id={id} hidden={!open} className="mt-4 space-y-4 border-t border-border pt-4">
        <div>
          <h4 className="mb-2 text-sm font-semibold">Technologies &amp; Tools</h4>
          <div className="flex flex-wrap gap-2">
            {experience.stack.map((name) => (
              <Technology key={name} name={name} />
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold">What I've done</h4>
          <ul className="list-disc space-y-1 pl-3.5 text-sm leading-relaxed text-muted-foreground marker:text-muted-foreground/70">
            {experience.bullets.map((bullet) => (
              <li key={bullet}>
                <HighlightMetrics text={bullet} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

export default function Experience() {
  return (
    <section aria-label="experience">
      <CornerHeading>Work Experience</CornerHeading>
      <div className="relative my-3 py-3">
        <div
          aria-hidden="true"
          data-experience-connector
          className="absolute bottom-0 left-7 top-0 w-0.5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, hsl(var(--muted-foreground) / 0.5) 0px, hsl(var(--muted-foreground) / 0.5) 6px, transparent 6px, transparent 10px)",
          }}
        />
        {experiences.map((experience) => (
          <ExperienceRow key={experience.company} experience={experience} />
        ))}
      </div>
    </section>
  );
}
