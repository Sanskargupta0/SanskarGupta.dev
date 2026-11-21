import { ConfigProps } from "./types/config";

export const config = {
  appName: "Sanskar Gupta",
  appDesignation: "Software Developer",
  appDescription: `Software developer building full-stack products, AI-powered tools, and workflow automation.`,

  domainName: "www.sanskargupta.dev",

  colors: {
    theme: "dark",
    main: "#000000",
  },

  social: {
    github: "https://github.com/Sanskargupta0",
    linkedin: "https://www.linkedin.com/in/sanskarguptadev/",
    instagram: "https://www.instagram.com/sanskargupta.dev/",
    discord: "https://discordapp.com/users/sanskargupta0",
    email: "Sanskar362002@gmail.com",
    phone: "+919169444674",
    youtube: "https://www.youtube.com/@sanskargupta9454",
    twitter: "https://x.com/sanskarGuptaDev",
    buymeacoffee: "https://buymeacoffee.com/sanskargupta0",
  },

  auth: {
    loginUrl: "/api/auth/signin",
    callbackUrl: "/dashboard",
  },
} as ConfigProps;

export default config;
