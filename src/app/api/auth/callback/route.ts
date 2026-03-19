import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/session";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("oauth_state")?.value;
  cookieStore.delete("oauth_state");

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(new URL("/?error=invalid_state", request.url));
  }

  // Exchange code for token
  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: process.env.SECONDME_CLIENT_ID!,
    client_secret: process.env.SECONDME_CLIENT_SECRET!,
    redirect_uri: process.env.SECONDME_REDIRECT_URI!,
  });

  const tokenRes = await fetch(process.env.SECONDME_TOKEN_ENDPOINT!, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenParams.toString(),
  });

  const tokenJson = await tokenRes.json();
  if (tokenJson.code !== 0) {
    return NextResponse.redirect(new URL("/?error=token_failed", request.url));
  }

  const { accessToken, refreshToken, expiresIn } = tokenJson.data;

  // Get user info
  const userRes = await fetch(
    `${process.env.SECONDME_API_BASE_URL}/api/secondme/user/info`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const userJson = await userRes.json();
  if (userJson.code !== 0) {
    return NextResponse.redirect(new URL("/?error=user_failed", request.url));
  }

  const smUser = userJson.data;
  const tokenExpiresAt = expiresIn
    ? new Date(Date.now() + expiresIn * 1000)
    : null;

  // Upsert user
  const user = await prisma.user.upsert({
    where: { secondmeId: smUser.userId || smUser.id },
    update: {
      name: smUser.name || smUser.username,
      avatar: smUser.avatar,
      accessToken,
      refreshToken: refreshToken || null,
      tokenExpiresAt,
    },
    create: {
      secondmeId: smUser.userId || smUser.id,
      name: smUser.name || smUser.username,
      avatar: smUser.avatar,
      accessToken,
      refreshToken: refreshToken || null,
      tokenExpiresAt,
    },
  });

  const sessionToken = await createSession({
    userId: user.id,
    secondmeId: user.secondmeId,
    name: user.name || undefined,
    avatar: user.avatar || undefined,
  });

  await setSessionCookie(sessionToken);

  // Check if setup is done
  const profile = await prisma.avatarProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile || !profile.setupDone) {
    return NextResponse.redirect(new URL("/setup", request.url));
  }

  return NextResponse.redirect(new URL("/avatar", request.url));
}
