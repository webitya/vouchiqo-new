import { NextResponse } from "next/server";
import { env } from "@/utils/env";

export async function GET() {
  const isConfigured = !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
  return NextResponse.json({ isConfigured });
}
