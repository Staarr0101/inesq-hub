import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Sua sessão expirou. Entre novamente." },
        { status: 401 }
      );
    }

    const documents = await prisma.document.findMany({
      where: {
        sectorId: user.sectorId,
      },
      orderBy: {
        receivedAt: "desc",
      },
      take: 10,
      select: {
        id: true,
        originalName: true,
        sizeBytes: true,
        status: true,
        duplicateReviewRequired: true,
        receivedAt: true,
      },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Erro ao consultar documentos:", error);

    return NextResponse.json(
      { error: "Não foi possível consultar os documentos." },
      { status: 500 }
    );
  }
}
