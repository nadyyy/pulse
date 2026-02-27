import { NextResponse } from "next/server";

import { destroySession } from "@/lib/auth";

async function handleLogout(request: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/", request.url));
}

export async function GET(request: Request) {
  return handleLogout(request);
}

export async function POST(request: Request) {
  return handleLogout(request);
}

