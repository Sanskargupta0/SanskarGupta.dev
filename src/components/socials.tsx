import { ClassValue } from "clsx";
import { Linkedin, Mail } from "lucide-react";
import { FaInstagram, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { FiGithub } from "react-icons/fi";
import { TbBrandDiscord } from "react-icons/tb";
import { SiBuymeacoffee } from "react-icons/si";
import config from "~/config";
import { cn } from "~/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export const socialsIcons = [
  {
    id: 1,
    label: "Github",
    icon: <FiGithub className="size-[1.2rem]" />,
    href: config.social.github,
    className: "hover:bg-gray-400 hover:text-black" as ClassValue,
  },
  {
    id: 2,
    label: "Linkedin",
    icon: <Linkedin className="size-[1.2rem]" />,
    href: config.social.linkedin,
    className: "hover:bg-blue-700 hover:text-white" as ClassValue,
  },
  {
    id: 3,
    label: "Instagram",
    icon: <FaInstagram className="size-[1.2rem]" />,
    href: config.social.instagram,
    className: " hover:bg-gradient-to-r from-rose-400 to-red-500 hover:text-white" as ClassValue,
  },
  {
    id: 4,
    label: "Discord",
    icon: <TbBrandDiscord className="size-[1.2rem]" />,
    href: config.social.discord,
    className: "hover:bg-blue-400 hover:text-white" as ClassValue,
  },
  {
    id: 5,
    label: "Email",
    icon: <Mail className="size-[1.2rem]" />,
    href: `mailto:${config.social.email}`,
    className: "hover:bg-red-500 hover:text-black" as ClassValue,
  },
  {
    id: 6,
    label: "X (Twitter)",
    icon: <FaXTwitter className="size-[1.2rem]" />,
    href: config.social.twitter,
    className: "hover:bg-[#1DA1F2] hover:text-white" as ClassValue,
  },
  {
    id: 7,
    label: "Buy Me a Coffee",
    icon: <SiBuymeacoffee className="size-[1.2rem]" />,
    href: config.social.buymeacoffee,
    className: "hover:bg-yellow-500 hover:text-black" as ClassValue,
  },
];

const Socials = () => {
  const contactSocials = socialsIcons.map((social) =>
    social.label === "Discord"
      ? {
          ...social,
          label: "WhatsApp",
          icon: <FaWhatsapp className="size-[1.2rem]" />,
          href: `https://wa.me/${config.social.phone.replace(/\D/g, "")}`,
          className: "hover:bg-green-600 hover:text-white" as ClassValue,
        }
      : social
  );
  return (
    <ul className="flex items-center gap-2">
      {contactSocials.map((social) => (
        <li key={social.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={social.href}
                className={cn(
                  "flex size-9 items-center justify-center rounded-md border border-input bg-background ring-offset-background transition-colors hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  social.className
                )}
                aria-label={social.label}
                target={social.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="external"
              >
                {social.icon}
              </a>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span>{social.label}</span>
            </TooltipContent>
          </Tooltip>
        </li>
      ))}
    </ul>
  );
};

export default Socials;
