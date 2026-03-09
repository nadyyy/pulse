import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { destroySession } from "@/lib/auth";

async function handleLogout(request: Request) {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") ?? h.get("host");

  if (origin && host) {
    const originHost = (() => {
      try {
        return new URL(origin).host;
      } catch {
        return "";
      }
    })();
    if (originHost && originHost !== host) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
  }

  await destroySession();
  return NextResponse.redirect(new URL("/", request.url));
}

export async function GET(request: Request) {
  void request;
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function POST(request: Request) {
  return handleLogout(request);
}
