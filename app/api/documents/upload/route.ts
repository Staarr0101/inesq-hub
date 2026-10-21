import { NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/current-user";


const MAX_FILES = 10;
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;

const MIME_BY_EXTENSION: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx":
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xml": "application/xml",
};


function validarAssinaturaArquivo(
  extensao: string,
  conteudo: Buffer,
): boolean {
  if (conteudo.length < 4) return false;

  switch (extensao) {
    case ".pdf":
      return conteudo.subarray(0, 5).toString("ascii") === "%PDF-";

    case ".png":
      return conteudo.subarray(0, 8).equals(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      );

    case ".jpg":
    case ".jpeg":
      return (
        conteudo[0] === 0xff &&
        conteudo[1] === 0xd8 &&
        conteudo[2] === 0xff
      );

    case ".webp":
      return (
        conteudo.subarray(0, 4).toString("ascii") === "RIFF" &&
        conteudo.subarray(8, 12).toString("ascii") === "WEBP"
      );

    case ".doc":
    case ".xls":
      return conteudo.subarray(0, 8).equals(
        Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
      );

    case ".docx":
    case ".xlsx":
      return (
        conteudo[0] === 0x50 &&
        conteudo[1] === 0x4b &&
        [0x03, 0x05, 0x07].includes(conteudo[2]) &&
        [0x04, 0x06, 0x08].includes(conteudo[3])
      );

    case ".xml": {
      const texto = conteudo.toString("utf8")
        .replace(/^\uFEFF/, "")
        .trimStart();

      return (
        !texto.includes("\u0000") &&
        /^<\?xml(?:\s|\?>)/i.test(texto) ||
        (
          !texto.includes("\u0000") &&
          /^<[A-Za-z_:]/.test(texto)
        )
      );
    }

    default:
      return false;
  }
}

const STORAGE_DIRECTORY = path.join(
  process.cwd(),
  "storage",
  "documents",
);

export async function PUT(request: Request) {
  const arquivosGravados: string[] = [];

  try {
    // Exige uma sessÃ£o vÃ¡lida.
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Sua sessÃ£o expirou. Entre novamente." },
        { status: 401 },
      );
    }

    // UsuÃ¡rios somente de consulta nÃ£o podem enviar documentos.
    if (user.role === "VIEWER") {
      return NextResponse.json(
        { error: "Seu perfil nÃ£o tem permissÃ£o para enviar documentos." },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const entradas = formData.getAll("files");

    const arquivos = entradas.filter(
      (entrada): entrada is File => entrada instanceof File,
    );

    if (arquivos.length === 0) {
      return NextResponse.json(
        { error: "Selecione pelo menos um arquivo." },
        { status: 400 },
      );
    }

    if (arquivos.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Envie no mÃ¡ximo ${MAX_FILES} arquivos por lote.` },
        { status: 400 },
      );
    }

    let tamanhoTotal = 0;

    for (const arquivo of arquivos) {
      if (arquivo.size <= 0) {
        return NextResponse.json(
          { error: `O arquivo "${arquivo.name}" estÃ¡ vazio.` },
          { status: 400 },

        );
      }

      if (arquivo.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `"${arquivo.name}" ultrapassa o limite de 20 MB por arquivo.`,
          },
          { status: 413 },
        );
      }

      tamanhoTotal += arquivo.size;

      const extensao = path.extname(arquivo.name).toLowerCase();

      if (!MIME_BY_EXTENSION[extensao]) {
        return NextResponse.json(
          {
            error: `O formato de "${arquivo.name}" nÃ£o Ã© permitido.`,
          },
          { status: 400 },
        );
      }
    }

    if (tamanhoTotal > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        { error: "O lote ultrapassa o limite total de 50 MB." },
        { status: 413 },
      );
    }

    // Prepara os arquivos e calcula o SHA-256 de cada conteÃºdo.
    const arquivosPreparados = [];

    for (const arquivo of arquivos) {
      const extensao = path.extname(arquivo.name).toLowerCase();
      const conteudo = Buffer.from(await arquivo.arrayBuffer());
      if (!validarAssinaturaArquivo(extensao, conteudo)) {
  return NextResponse.json(
    {
      error: `O conteÃºdo de "${arquivo.name}" nÃ£o corresponde ao formato informado.`,
    },
    { status: 400 },
  );
}
      const sha256 = createHash("sha256")
        .update(conteudo)
        .digest("hex");

      arquivosPreparados.push({
        originalName: path.basename(arquivo.name),
        storageKey: `${randomUUID()}${extensao}`,
        mimeType: MIME_BY_EXTENSION[extensao],
        sizeBytes: conteudo.length,
        sha256,
        conteudo,
      });
    }

    // Pesquisa conteÃºdo idÃªntico dentro do setor do usuÃ¡rio.
    const hashes = [
      ...new Set(arquivosPreparados.map((arquivo) => arquivo.sha256)),
    ];

    const existentes = await prisma.document.findMany({
      where: {
        sectorId: user.sectorId,
        sha256: { in: hashes },
      },
      select: { sha256: true },
    });

    const hashesExistentes = new Set(
      existentes.map((documento) => documento.sha256),
    );

    const hashesDesteLote = new Set<string>();

    // O diretÃ³rio fica fora de "public".
    await mkdir(STORAGE_DIRECTORY, { recursive: true });

    for (const arquivo of arquivosPreparados) {
      const caminho = path.join(
        STORAGE_DIRECTORY,
        arquivo.storageKey,
      );

      await writeFile(caminho, arquivo.conteudo, {
        flag: "wx",
        mode: 0o600,
      });

      arquivosGravados.push(caminho);
    }

    // Registra lote e documentos no banco.
    // O setor vem do usuÃ¡rio autenticado, nÃ£o do formulÃ¡rio.
    const lote = await prisma.documentBatch.create({
      data: {
        name: `Recebimento ${new Date().toLocaleString("pt-BR")}`,
        sectorId: user.sectorId,
        createdByUserId: user.id,
        documents: {
          create: arquivosPreparados.map((arquivo) => {
            const repetidoNesteLote = hashesDesteLote.has(
              arquivo.sha256,
            );

            const possivelDuplicado =
              hashesExistentes.has(arquivo.sha256) ||
              repetidoNesteLote;

            hashesDesteLote.add(arquivo.sha256);

            return {
              originalName: arquivo.originalName,
              storageKey: arquivo.storageKey,
              mimeType: arquivo.mimeType,
              sizeBytes: arquivo.sizeBytes,
              sha256: arquivo.sha256,
              duplicateReviewRequired: possivelDuplicado,
              sectorId: user.sectorId,
              uploadedByUserId: user.id,
            };
          }),
        },
      },
      include: {
        documents: {
          select: {
            id: true,
            originalName: true,
            sizeBytes: true,
            status: true,
            duplicateReviewRequired: true,
            receivedAt: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        ok: true,
        batchId: lote.id,
        documents: lote.documents,
        message: "Arquivos recebidos e registrados.",
      },
      { status: 201 },
    );
  } catch (error) {
    // Se o registro falhar, remove os arquivos jÃ¡ gravados.
    await Promise.all(
      arquivosGravados.map((arquivo) =>
        unlink(arquivo).catch(() => undefined),
      ),
    );

    console.error("Erro ao receber documentos:", error);

    return NextResponse.json(
      { error: "NÃ£o foi possÃ­vel registrar os arquivos recebidos." },
      { status: 500 },
    );
  }
}
