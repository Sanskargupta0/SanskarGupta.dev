"use client";
import { Eye } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useIncrementViewCount } from "~/actions/mutations";
import { usePostViews } from "~/actions/queries";

const PostViews = ({ slug }: { slug: string }) => {
  const { data, isLoading, isError } = usePostViews(slug);
  const incrCount = useIncrementViewCount();

  const countedSlug = useRef<string | null>(null);
  const { mutate } = incrCount;

  useEffect(() => {
    if (countedSlug.current === slug) return;
    countedSlug.current = slug;
    mutate(slug);
  }, [slug, mutate]);

  return (
    <dl>
      <dt className="sr-only">Blog Post views</dt>
      <dd className="flex items-center gap-1 text-sm text-muted-foreground">
        <Eye className="size-4" aria-hidden="true" />
        <span>
          {isLoading
            ? "..."
            : isError || data?.views?.count == null
              ? "Views unavailable"
              : `${data?.views?.count ?? 0} Views`}
        </span>
      </dd>
    </dl>
  );
};

export default PostViews;
