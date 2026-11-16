import { z } from "zod";
import { db } from "~/server/db";

export const dynamic = "force-dynamic";

interface Options {
  params: { slug: string[] };
}

const slugSchema = z.array(z.string().min(1)).min(1).transform((parts) => parts.join("/"));

export async function GET(_: Request, { params }: Options) {
  const parsed = slugSchema.safeParse(params.slug);
  if (!parsed.success) return Response.json({ message: "Invalid slug" }, { status: 400 });
  const slug = parsed.data;
  try {
    const views = await db.views.findUnique({
      where: { slug },
      select: { count: true },
    });
    return Response.json({ views: { slug, count: views?.count ?? 0 } }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to fetch view count:", error);
    return Response.json({ message: "Failed to fetch view count" }, { status: 500 });
  }
}

export async function POST(_: Request, { params }: Options) {
  const parsed = slugSchema.safeParse(params.slug);
  if (!parsed.success) return Response.json({ message: "Invalid slug" }, { status: 400 });
  const slug = parsed.data;
  try {
    await db.views.upsert({
      where: { slug },
      create: { slug, count: 1 },
      update: { count: { increment: 1 } },
    });
    return Response.json({ message: "Count incremented successfully" });
  } catch (error) {
    console.error("Failed to increment view count:", error);
    return Response.json({ message: "Failed to increment view count" }, { status: 500 });
  }
}
