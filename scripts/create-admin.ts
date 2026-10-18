
import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL não está configurada no .env.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  const terminal = createInterface({ input: stdin, output: stdout });

  try {
    const name = (await terminal.question("Nome do administrador: ")).trim();
    const email = (
      await terminal.question("E-mail do administrador: ")
    ).trim().toLowerCase();
    const password = await terminal.question(
      "Senha (mínimo de 8 caracteres): "
    );

    if (!name || !email.includes("@") || password.length < 8) {
      throw new Error(
        "Informe um nome, um e-mail válido e uma senha com pelo menos 8 caracteres."
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("Já existe um usuário com esse e-mail.");
    }

    const sector = await prisma.sector.upsert({
      where: { slug: "qualifica-df-movel" },
      update: {},
      create: {
        name: "Qualifica DF Móvel",
        slug: "qualifica-df-movel",
        description: "Setor do Qualifica DF Móvel",
      },
    });

    const passwordHash = await bcrypt.hash(password, 8);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN",
        sectorId: sector.id,
      },
    });

    console.log("\nAdministrador criado com sucesso!");
    console.log(`Setor: ${sector.name}`);
    console.log(`E-mail: ${email}`);
  } finally {
    terminal.close();
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("\nNão foi possível criar o administrador:", error.message);
  process.exitCode = 1;
});
