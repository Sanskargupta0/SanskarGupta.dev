import { education } from "~/constants/education";
import { FRONTEND_STACKS, BACKEND_STACKS } from "~/constants/stack";
import { experiences } from "~/constants/experience";
import config from "~/config";
import { origin, markdownResponse } from "~/lib/agent-content";
import { resumeConfig } from "~/constants/resume";
export function GET() {
  return markdownResponse(
    `# Sanskar Gupta

${config.appDescription}

Canonical: ${origin}/

## Experience
${experiences
  .map(
    (item) => `### ${item.role}, ${item.company}
${item.period} | ${item.location}

${item.bullets.map((bullet) => `- ${bullet}`).join("\n")}

Technologies: ${item.stack.join(", ")}
`
  )
  .join("\n")}
## Skills
${Object.keys({ ...FRONTEND_STACKS, ...BACKEND_STACKS }).join(", ")}

## Education
${education.map((entry) => `### ${entry.institute}\n${entry.degree} | ${entry.years} | ${entry.grade}\n\n${entry.paragraphs.join("\n\n")}`).join("\n\n")}

## Links
- [Resume](${resumeConfig.viewUrl})
- [Projects](${origin}/projects)
- [Blog](${origin}/blog)
- [GitHub](${config.social.github})
- [LinkedIn](${config.social.linkedin})
- [X](${config.social.twitter})
- [Instagram](${config.social.instagram})
- Email: ${config.social.email}
`,
    `${origin}/`
  );
}
