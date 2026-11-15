"use client";

import Image from "next/image";
import portrait from "~/assets/images/profile-portrait.png";
import { SmoothMascot } from "~/components/smooth-mascot";
import PortraitToggle from "~/components/portrait-toggle";
import { usePortrait } from "~/providers/portrait";

export default function ProfilePicture() {
  const { showPhoto } = usePortrait();
  return (
    <div className="relative aspect-square" data-profile-picture>
      <div className="absolute inset-0 -z-10 rounded-md bg-[#00adb5]" />
      <div className="relative size-full -rotate-3 [perspective:1000px]">
        <div
          className="relative size-full rounded-md shadow-md transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none"
          style={{ transform: showPhoto ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          <div
            aria-hidden={showPhoto}
            className="absolute inset-0 overflow-hidden rounded-md bg-background [backface-visibility:hidden]"
            style={{ pointerEvents: showPhoto ? "none" : "auto" }}
          >
            <SmoothMascot
              directions="/mascots/sanskar-directions.webp"
              reactions="/mascots/sanskar-reactions.webp"
              directionGrid={5}
              label="Sanskar mascot"
              tracking={!showPhoto}
              size={280}
              className="!size-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            />
          </div>
          <div
            aria-hidden={!showPhoto}
            className="absolute inset-0 overflow-hidden rounded-md bg-background [backface-visibility:hidden] [transform:rotateY(180deg)]"
            style={{ pointerEvents: showPhoto ? "auto" : "none" }}
          >
            <Image
              src={portrait}
              alt="Sanskar Gupta"
              fill
              priority
              placeholder="blur"
              sizes="(min-width: 1024px) 280px, (min-width: 768px) 30vw, 100vw"
              className="pointer-events-none select-none object-cover"
            />
          </div>
        </div>
        <PortraitToggle />
      </div>
      <span className="sr-only" role="status">
        {showPhoto ? "Profile photo" : "Interactive mascot"} of Sanskar Gupta.
      </span>
    </div>
  );
}
