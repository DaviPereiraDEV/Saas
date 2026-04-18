import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encryptAccountPassword } from "@/lib/accountCrypto";
import {
  mapInstagramError,
  validateLoginAndSerialize,
} from "@/lib/instagramService";

export const runtime = "nodejs";

export async function GET() {
  const rows = await prisma.privateInstagramAccount.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      lastError: true,
      sessionJson: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    accounts: rows.map((r) => ({
      id: r.id,
      username: r.username,
      hasSession: Boolean(r.sessionJson),
      lastError: r.lastError,
      createdAt: r.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = body?.username;
    const password = body?.password;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username e senha são obrigatórios." },
        { status: 400 },
      );
    }

    const u = String(username).replace("@", "").trim();
    if (!u) {
      return NextResponse.json({ error: "Username inválido." }, { status: 400 });
    }

    const sessionJson = await validateLoginAndSerialize(u, String(password));
    const passwordEnc = encryptAccountPassword(String(password));

    const acc = await prisma.privateInstagramAccount.upsert({
      where: { username: u },
      create: { username: u, passwordEnc, sessionJson },
      update: { passwordEnc, sessionJson, lastError: null },
    });

    return NextResponse.json({
      ok: true,
      id: acc.id,
      username: acc.username,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: mapInstagramError(error) },
      { status: 400 },
    );
  }
}
