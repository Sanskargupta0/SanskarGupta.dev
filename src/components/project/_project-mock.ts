import { createId } from "@paralleldrive/cuid2";

// Project cover images
import studdyBuddyAiCover from "~/assets/images/cover/StuddyBuddyAi.png";
import ymgsPharmacyCover from "~/assets/images/cover/YMGS-Pharmacy.png";
import printifyCover from "~/assets/images/cover/Printify.png";
import nationhubCover from "~/assets/images/cover/NationsHub.png";
import httpServerCover from "~/assets/images/cover/HTTPServer.png";
import facequestCover from "~/assets/images/cover/FaceQuest.png";
import removeBgCover from "~/assets/images/cover/RemoveBg.png";
import sendEmailApiCover from "~/assets/images/cover/SendEmailApi.png";
import jcValvesCover from "~/assets/images/cover/JcValves.png";
import travelCover from "~/assets/images/cover/Travel.png";
import aiSummarizeCover from "~/assets/images/cover/AiSummarize.png";
import justYouAndMeCover from "~/assets/images/cover/JustYouAndMe.png";
import gamesUsingJsCover from "~/assets/images/cover/GamesUsingJs.png";

export const categories = [
  { id: "all", label: "All Projects" },
  { id: "fullstack", label: "Full Stack" },
  { id: "uiux", label: "UI/UX" },
  { id: "ai", label: "AI" },
  { id: "saas", label: "SaaS" },
  { id: "tools", label: "Tools" },
  { id: "automation", label: "Automation" },
  { id: "make-life-easy", label: "Make Life Easy" },
  { id: "just-for-fun", label: "Just For Fun" },
];

const projects = [
  {
    id: createId(),
    title: `Studdy-Buddy`,
    demoWarning: true,
    description:
      "AI-powered study companion platform that generates comprehensive study materials including notes, flashcards, quizzes, and Q&A sessions from any topic using Google Gemini AI.",
    deployedURL: "https://studdybuddyai.vercel.app/",
    cover: studdyBuddyAiCover,
    stacks: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "PostgreSQL",
      "Drizzle ORM",
      "Clerk",
      "Stripe",
      "Google Gemini AI",
      "Inngest",
    ],
    categories: ["fullstack", "ai", "automation", "uiux", "make-life-easy"],
    isRepo: true,
    repoUrl: "https://github.com/Sanskargupta0/Studdy-Buddy",
  },
  {
    id: createId(),
    title: `YMGS Pharmacy`,
    description:
      "Modern e-commerce platform for online medicine and healthcare product delivery. Built with React and Vite, featuring advanced product catalog, multiple payment methods, guest checkout, and comprehensive order management.",
    deployedURL: "https://ymgs-frontend.vercel.app/",
    cover: ymgsPharmacyCover,
    stacks: [
      "React",
      "Vite",
      "Tailwind CSS",
      "React Router DOM",
      "Axios",
      "Lucide React",
      "Swiper.js",
      "React Toastify",
      "Razorpay",
      "Stripe",
    ],
    categories: ["fullstack", "uiux", "make-life-easy"],
    isRepo: true,
    repoUrl: "https://github.com/Sanskargupta0/YMGS-Frontend",
  },
  {
    id: createId(),
    title: `HTTP Server (Go)`,
    description:
      "Educational Go project for building an HTTP/1.1 server from scratch. Implements TCP server, HTTP request parsing, and multi-client support as part of the CodeCrafters challenge.",
    deployedURL: "https://app.codecrafters.io/users/Sanskargupta0",
    cover: httpServerCover,
    stacks: ["Go", "TCP", "HTTP/1.1"],
    categories: ["tools", "automation"],
    isRepo: true,
    repoUrl: "https://github.com/Sanskargupta0/HTTP-Server-go",
  },
  {
    id: createId(),
    title: `FaceQuest`,
    isPrivate: true,
    description:
      "Python-based Telegram bot for face image search and verification. Supports user uploads, selfie verification, database storage, and multi-user handling. Uses dlib and face_recognition for image processing.",
    deployedURL: "https://t.me/FaceQuest_Bot",
    cover: facequestCover,
    stacks: ["Python", "Telegram Bot API", "dlib", "face_recognition", "SQLite"],
    categories: ["ai", "automation", "tools"],
    isRepo: false,
    repoUrl: "",
  },
  {
    id: createId(),
    title: `Printify`,
    description:
      "Dynamic React-based web application for product management and quotation generation. Features customizable product listings, email integration for quotation requests, PDF download, search, similar product suggestions, and interactive UI with animations.",
    deployedURL: "https://printify-five.vercel.app/",
    cover: printifyCover,
    stacks: [
      "React",
      "Vite",
      "Tailwind CSS",
      "AOS",
      "HTML2PDF.js",
      "React Router Dom",
      "React Icons",
      "React Slick Carousel",
      "React Toastify",
      "Styled Components",
    ],
    categories: ["fullstack", "automation", "uiux", "make-life-easy"],
    isRepo: true,
    repoUrl: "https://github.com/Sanskargupta0/Printify",
  },
    {
    id: createId(),
    title: `Remove Background`,
    description:
      "Web-based AI application for automatic background removal from images. Built with Flask, rembg (U2-Net), and TailwindCSS. Features batch processing, drag-and-drop, Unsplash API integration, Docker deployment, and modern responsive UI.",
    deployedURL: "https://remove-bg-rv88.onrender.com/",
    cover: removeBgCover,
    stacks: [
      "Flask",
      "Python",
      "rembg",
      "U2-Net",
      "OpenCV",
      "Pillow",
      "ONNX Runtime",
      "TailwindCSS",
      "Docker",
      "Gunicorn",
      "Unsplash API",
    ],
    categories: ["ai", "tools", "make-life-easy"],
    isRepo: true,
    repoUrl: "https://github.com/Sanskargupta0/Remove-bg",
  },
  {
    id: createId(),
    title: `Nations Hub`,
    description:
      "Interactive React app to explore country information, flags, and play geography quiz games. Features search, flag gallery, and multiple quiz modes using REST Countries API.",
    deployedURL: "https://nations-hub-phi.vercel.app/",
    cover: nationhubCover,
    stacks: ["React.js", "HTML5", "CSS3", "JavaScript", "REST Countries API"],
    categories: ["just-for-fun", "tools"],
    isRepo: true,
    repoUrl: "https://github.com/Sanskargupta0/Nations-Hub",
  },
  {
    id: createId(),
    title: `SendMail API`,
    description:
      "Node.js and Express API for sending dynamic emails with attachments and customizable templates. Supports Gmail OAuth2, secure environment config, and endpoints for subscription, contact, and quotation emails.",
    deployedURL: "https://email-send-api-67qp.onrender.com/",
    cover: sendEmailApiCover,
    stacks: ["Node.js", "Express", "Nodemailer", "OAuth2", "dotenv"],
    categories: ["tools", "automation", "make-life-easy"],
    isRepo: true,
    repoUrl: "https://github.com/Sanskargupta0/Email-Send-API",
  },
  {
    id: createId(),
    title: `DNS Server (Go)`,
    description:
      "Educational Go project for building a DNS server from scratch. Implements DNS packet parsing, query handling, record types, and recursive resolution as part of the CodeCrafters challenge.",
    deployedURL: "https://app.codecrafters.io/users/Sanskargupta0",
    cover: httpServerCover,
    stacks: ["Go", "DNS", "UDP", "Networking"],
    categories: ["tools", "automation"],
    isRepo: true,
    repoUrl: "https://github.com/Sanskargupta0/DNS-Server-go",
  },
  {
    id: createId(),
    title: `JC Valves MTC Manager`,
    description:
      "Enterprise-grade Flask web app for managing Material Test Certificates (MTC) in the valve manufacturing industry. Features role-based access, PDF generation, version control, advanced material property tracking, and supplier MTC management.",
    deployedURL: "https://sanskargupta0.pythonanywhere.com/",
    cover: jcValvesCover,
    stacks: ["Flask", "SQLAlchemy", "Bootstrap", "Jinja2", "Python", "SQLite", "Flask-Login", "Flask-Migrate"],
    categories: ["fullstack", "automation", "make-life-easy"],
    isRepo: true,
    repoUrl: "https://github.com/Sanskargupta0/jcvalves",
  },
  {
    id: createId(),
    title: `Travel UI UX`,
    description:
      "Modern Next.js and Tailwind CSS travel website UI/UX demo. Features hero, camp exploration, travel guide, feature-rich sections, mobile app CTA, and responsive design.",
    deployedURL: "https://sanskarguptadev.vercel.app/",
    cover: travelCover,
    stacks: ["Next.js", "Tailwind CSS"],
    categories: ["just-for-fun", "uiux"],
    isRepo: true,
    repoUrl: "https://github.com/adrianhajdin/travel_ui_ux",
  },
  {
    id: createId(),
    title: `AI Summarizer`,
    description:
      "AI-powered app to condense lengthy articles into concise summaries. Paste an article URL and get an AI-generated summary. Features light/dark mode, local storage, and built with React, Tailwind, and Redux Toolkit Query.",
    deployedURL: "https://ai-summarizer-one-vert.vercel.app/",
    cover: aiSummarizeCover,
    stacks: ["React", "Tailwind", "Rapid API", "Redux Toolkit Query"],
    categories: ["ai", "tools", "make-life-easy"],
    isRepo: true,
    repoUrl: "https://github.com/Sanskargupta0/AI-Summarizer",
  },
  {
    id: createId(),
    title: `Sorry-I-Can-t-Afford-Flowers`,
    description:
      "A playful, interactive HTML & CSS flower garden web app. Personalize with custom messages and names via URL parameters. Features pure CSS animations, glassmorphism, mobile optimization, and glowing effects.",
    deployedURL: "https://justyouandme.netlify.app/",
    cover: justYouAndMeCover,
    stacks: ["HTML", "CSS", "JavaScript"],
    categories: ["just-for-fun"],
    isRepo: true,
    repoUrl: "https://github.com/Sanskargupta0/Sorry-I-Can-t-Afford-Flowers",
  },
  {
    id: createId(),
    title: `Games_Using_JS`,
    description:
      "A collection of classic browser games built using JavaScript, HTML, and CSS. Includes 2D Breakout, Memory Game, Rock Paper Scissors, Sound Game, and Whac-a-mole. Each game is in its own folder for easy exploration.",
    deployedURL: "https://sanskargupta0.github.io/Memory-Game/",
    cover: gamesUsingJsCover,
    stacks: ["JavaScript", "HTML", "CSS"],
    categories: ["just-for-fun"],
    isRepo: true,
    repoUrl: "https://github.com/Sanskargupta0/Games_Using_JS",
  },

];

export default projects;
export type TProject = (typeof projects)[0];
