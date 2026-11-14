import { NextResponse } from "next/server";
import { getListeningStatus } from "~/lib/listening";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
export async function GET() {
  const { track } = await getListeningStatus();
  const destination = track
    ? "https://open.spotify.com/" + track.kind + "/" + track.id
    : "https://open.spotify.com/user/31ne3c5fannnnfr4vr24ba4tqime";
  return NextResponse.redirect(destination, {
    status: 302,
    headers: { "Cache-Control": "no-store" },
  });
}
