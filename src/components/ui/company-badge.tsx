import Image from "next/image";
import { cn } from "~/lib/utils";

const companies = {
  piovation: {
    name: "Piovation GmbH",
    href: "https://piovation.com/",
    logo: "/images/companies/piovation.png",
    color: "text-stone-700 bg-stone-200/70 dark:text-stone-300 dark:bg-stone-500/15",
    logoClass: "bg-[#090909]",
  },
  electronicx: {
    name: "Electronicx GmbH",
    href: "https://electronicx.de/",
    logo: "/images/companies/electronicx.ico",
    color: "text-red-700 bg-red-100/70 dark:text-red-300 dark:bg-red-500/10",
    logoClass: "bg-white",
  },
  aptidude: {
    name: "AptiDude",
    href: "https://aptidude.in/",
    logo: "/images/companies/aptidude.png",
    color: "text-sky-700 bg-sky-100/70 dark:text-sky-300 dark:bg-sky-500/10",
    logoClass: "bg-white",
  },
};

export default function CompanyBadge({ company }: { company: keyof typeof companies }) {
  const item = companies[company];
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex h-fit items-center gap-1.5 whitespace-nowrap rounded-sm px-1.5 py-0.5 align-middle text-xs transition-[filter] hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none",
        item.color
      )}
    >
      <Image
        src={item.logo}
        alt=""
        width={14}
        height={14}
        unoptimized
        style={{ margin: 0 }}
        className={cn("size-3.5 shrink-0 rounded-[2px] object-contain", item.logoClass)}
      />
      {item.name}
    </a>
  );
}
