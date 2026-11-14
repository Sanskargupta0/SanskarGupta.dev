import { NextResponse } from "next/server";
import { getListeningStatus } from "~/lib/listening";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
export const runtime = "nodejs";
export async function GET() {
  return NextResponse.json(await getListeningStatus(), {
    headers: { "Cache-Control": "no-store" },
  });
}
