
import "server-only";
import { prisma } from "@/lib/prisma";
import { getSession } from "./session";

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      sectorId: true,
      sector: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!user || !user.active) {
  return null;
}

  return user;
}
