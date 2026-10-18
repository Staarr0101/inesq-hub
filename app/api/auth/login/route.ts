
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { startSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("email" in body) ||
      !("password" in body) ||
      typeof body.email !== "string" ||
      typeof body.password !== "string" ||
      body.email.length > 254 ||
      body.password.length > 1024
    ) {
      return NextResponse.json(
        { error: "Informe seu login e sua senha." },
        { status: 400 }
      );
    }

    const email = body.email.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Informe seu login e sua senha." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        passwordHash: true,
        active: true,
        sector: {
          select: { active: true },
        },
      },
    });

    if (!user || !user.active || !user.sector.active) {
      return NextResponse.json(
        { error: "Login ou senha inválidos." },
        { status: 401 }
      );
    }

    const validPassword = await verifyPassword(
      password,
      user.passwordHash
    );

    if (!validPassword) {
      return NextResponse.json(
        { error: "Login ou senha inválidos." },
        { status: 401 }
      );
    }

    await startSession(user.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro durante a autenticação:", error);

    return NextResponse.json(
      { error: "Não foi possível realizar o login agora." },
      { status: 500 }
    );
  }
}
