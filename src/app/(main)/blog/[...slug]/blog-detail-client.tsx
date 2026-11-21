"use client";

import { Post } from "#site/content";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import BackButton from "~/components/back-btn";
import { MDXContent } from "~/components/mdx";
import { PostMetadata, TableOfContent } from "~/components/post";
import Tags from "~/components/tags";
import { useRef } from "react";
import { cn } from "~/lib/utils";

interface BlogDetailClientProps {
  post: Post;
}

export default function BlogDetailClient({ post }: BlogDetailClientProps) {
  const { t } = useTranslation(["common", "blog"]);
  const articleRef = useRef<HTMLElement>(null);

  return (
    <article ref={articleRef} lang="en" className="relative w-full pb-16">
      <div className="flex items-center justify-between">
        <BackButton>{t("common:blog.backToPosts")}</BackButton>
      </div>
      <div className="mb-6 mt-2 space-y-6">
        <PostMetadata
          isDetailPage
          title={post.title}
          metadata={post.metadata}
          date={post.date}
          dateType={post.dateType}
          slug={post.slugAsParams}
        />

        <div className="relative aspect-video">
          <Image
            src={post.cover}
            alt={post.title}
            placeholder="blur"
            priority
            fill
            quality={95}
            className="size-full rounded-md object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>

      <div className={cn("mdx-content prose prose-invert max-w-none")}>
        <MDXContent code={post.body} />
      </div>

      <TableOfContent key={post.slug} toc={post.toc} articleRef={articleRef} />

      <div className="my-4 space-y-1">
        <hr className="!mb-4" />
        <h3 className="font-bold">{t("common:blog.tags")}</h3>
        <Tags tags={post.tags} />
      </div>
    </article>
  );
}
