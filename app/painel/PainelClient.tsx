"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type PainelProps = {
  nomeUsuario?: string;
};

const menuGroups = [
  {
    label: "VISÃO GERAL",
    items: [{ name: "Início", icon: "⌂" }],
  },
  {
    label: "DOCUMENTOS",
    items: [
      { name: "Receber documentos", icon: "↧" },
      { name: "Documentos PDF", icon: "▤" },
      { name: "Organização inteligente", icon: "✧" },
    ],
  },
  {
    label: "GESTÃO",
    items: [
      { name: "Pessoas e empresas", icon: "♙" },
      { name: "Instrutores", icon: "♧" },
      { name: "Contratos e serviços", icon: "▣" },
      { name: "Parcelas", icon: "◷" },
      { name: "Financeiro", icon: "¤" },
      { name: "Relatórios", icon: "▥" },
    ],
  },
  {
    label: "SISTEMA",
    items: [{ name: "Configurações", icon: "⚙" }],
  },
];

const indicadores = [
  {
    titulo: "DOCUMENTOS RECEBIDOS",
    descricao: "No período selecionado",
    icon: "▤",
    cor: "blue",
  },
  {
    titulo: "DOCUMENTOS PENDENTES",
    descricao: "Aguardando conferência ou regularização",
    icon: "!",
    cor: "orange",
  },
  {
    titulo: "PARCELAS PENDENTES",
    descricao: "Que exigem acompanhamento",
    icon: "◷",
    cor: "blue",
  },
  {
    titulo: "PAGAMENTOS A ACOMPANHAR",
    descricao: "Conforme os registros financeiros",
    icon: "¤",
    cor: "blue",
  },
];

const acessosRapidos = [
  {
    titulo: "Receber documentos",
    descricao: "Consultar e conferir arquivos recebidos.",
    icon: "↧",
    destino: "Receber documentos",
  },
  {
    titulo: "Ferramentas de PDF",
    descricao: "Acessar as ferramentas de documentos PDF.",
    icon: "▤",
    destino: "Documentos PDF",
  },
  {
    titulo: "Pessoas e empresas",
    descricao: "Acessar o cadastro central.",
    icon: "♙",
    destino: "Pessoas e empresas",
  },
  {
    titulo: "Contratos e serviços",
    descricao: "Consultar a área de contratos.",
    icon: "▣",
    destino: "Contratos e serviços",
  },
];

const descricoesAreas: Record<string, string> = {
  "Receber documentos":
    "Área planejada para receber lotes de documentos, conferir os dados e identificar possíveis duplicados sem vinculá-los automaticamente.",
  "Documentos PDF":
    "Área destinada às ferramentas de PDF, como separar, unir, renomear e converter arquivos.",
  "Organização inteligente":
    "Área planejada para classificar documentos automaticamente quando houver confiança suficiente e encaminhar dúvidas para conferência humana.",
  "Pessoas e empresas":
    "Cadastro central para organizar os registros de pessoas e empresas e apoiar as demais áreas do sistema.",
  Instrutores:
    "Área planejada para cadastro e acompanhamento dos instrutores e de sua documentação.",
  "Contratos e serviços":
    "Área planejada para consultar contratos, serviços e seus documentos relacionados.",
  Parcelas:
    "Área planejada para acompanhar parcelas, comprovantes e pendências financeiras.",
  Financeiro:
    "Área financeira separada para acompanhar os registros de pagamentos e valores previstos, pagos e pendentes, conforme as permissões.",
  Relatórios:
    "Área planejada para relatórios de acompanhamento, planejamento e execução.",
  Configurações:
    "Área planejada para configurações individuais, preferências e opções de aparência.",
};

export default function Painel({ nomeUsuario }: PainelProps) {
  const [activeItem, setActiveItem] = useState("Início");
  const [periodo, setPeriodo] = useState("mes-atual");
  const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");
  const [sucessoEnvio, setSucessoEnvio] = useState("");
  type DocumentoRecente = {
  id: string;
  originalName: string;
  sizeBytes: number;
  status: "RECEIVED" | "UNDER_REVIEW" | "NEEDS_CORRECTION" | "VERIFIED";
  duplicateReviewRequired: boolean;
  receivedAt: string;
};

const [documentosRecentes, setDocumentosRecentes] = useState<
  DocumentoRecente[]
>([]);
const [carregandoDocumentos, setCarregandoDocumentos] = useState(true);
const [erroDocumentos, setErroDocumentos] = useState("");

const carregarDocumentos = useCallback(async () => {
  setCarregandoDocumentos(true);

  try {
    const resposta = await fetch("/api/documents", {
      cache: "no-store",
    });

    const dados = (await resposta.json()) as {
      documents?: DocumentoRecente[];
      error?: string;
    };

    if (!resposta.ok) {
      throw new Error(dados.error || "Não foi possível carregar os documentos.");
    }

    setDocumentosRecentes(dados.documents ?? []);
    setErroDocumentos("");
  } catch (erro) {
    setErroDocumentos(
      erro instanceof Error
        ? erro.message
        : "Erro ao consultar os documentos."
    );
  } finally {
    setCarregandoDocumentos(false);
  }
}, []);

useEffect(() => {
  void carregarDocumentos();
}, [carregarDocumentos]);
  const router = useRouter();

  const primeiroNome = nomeUsuario?.trim().split(/\s+/)[0];
  const inicial = primeiroNome?.charAt(0).toUpperCase() || "I";

  const hora = new Date().getHours();
  const saudacao =
    hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  const mesAtual = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  const periodoSelecionado: Record<string, string> = {
    "mes-atual": `Mês atual · ${mesAtual}`,
    "mes-anterior": "Mês anterior",
    "ultimos-tres-meses": "Últimos 3 meses",
    "ano-atual": "Ano atual",
    "registros-abertos": "Todos os registros em aberto",
  };
  async function enviarArquivos() {
  if (arquivosSelecionados.length === 0) {
    setErroEnvio("Selecione pelo menos um arquivo.");
    return;
  }

  setEnviando(true);
  setErroEnvio("");
  setSucessoEnvio("");

  try {
    const dados = new FormData();

    arquivosSelecionados.forEach((arquivo) => {
      dados.append("files", arquivo);
    });

    const resposta = await fetch("/api/documents/upload", {
      method: "PUT",
      body: dados,
    });

    const resultado = (await resposta.json().catch(() => ({}))) as {
      error?: string;
      batchId?: string;
      documents?: unknown[];
    };

    if (!resposta.ok) {
      throw new Error(
        resultado.error || "Não foi possível enviar os arquivos."
      );
    }

    const quantidade = resultado.documents?.length ?? arquivosSelecionados.length;

    await carregarDocumentos();

    setSucessoEnvio(
      `${quantidade} arquivo(s) recebido(s) e registrado(s) com sucesso.`
    );

    setArquivosSelecionados([]);
  } catch (erro) {
    setErroEnvio(
      erro instanceof Error
        ? erro.message
        : "Ocorreu um erro durante o envio."
    );
  } finally {
    setEnviando(false);
  }
}

  async function sairDaConta() {
    try {
      const resposta = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!resposta.ok) {
        alert("Não foi possível sair. Tente novamente.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      alert("Erro de conexão ao sair da conta.");
    }
  }

  function abrirArea(area: string) {
    setActiveItem(area);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-[#F2F6FC] text-[#172B4D]">
      {/* Menu lateral */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-[#0F2A5F] text-white md:flex">
        <div className="border-b border-white/15 px-6 py-6">
          <p className="text-2xl font-bold tracking-wide">
            INESQ <span className="text-[#8CC8FF]">HUB</span>
          </p>
          <p className="mt-1 text-xs text-blue-100/75">
            Central de documentos e automação
          </p>
        </div>

        <nav
          aria-label="Menu principal"
          className="flex-1 space-y-6 overflow-y-auto px-3 py-6"
        >
          {menuGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.16em] text-blue-200/60">
                {group.label}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const selecionado = activeItem === item.name;

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => abrirArea(item.name)}
                      aria-current={selecionado ? "page" : undefined}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                        selecionado
                          ? "bg-white/15 font-semibold text-white shadow-sm"
                          : "text-blue-100/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className="flex h-6 w-6 items-center justify-center text-lg">
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/15 px-4 py-4">
          <button
            type="button"
            onClick={sairDaConta}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-blue-100/80 transition hover:bg-white/10 hover:text-white"
          >
            <span className="w-6 text-center text-lg">↪</span>
            Sair da conta
          </button>

          <p className="px-3 pt-3 text-xs text-blue-100/50">
            INESQ Hub · Versão inicial
          </p>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="min-h-screen md:ml-64">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
          <div>
            <p className="text-xs text-slate-500">
              INESQ Hub / {activeItem}
            </p>
            <h1 className="mt-1 text-xl font-semibold text-[#172B4D] sm:text-2xl">
              {activeItem === "Início" ? "Visão geral" : activeItem}
            </h1>
          </div>

          <button
            type="button"
            aria-label="Perfil do usuário"
            title={nomeUsuario || "Perfil do usuário"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E2EDFF] font-semibold text-[#0F2A5F] ring-2 ring-white"
          >
            {inicial}
          </button>
        </header>

        <section className="space-y-6 p-5 sm:p-8">
          {activeItem === "Início" ? (
            <>
              {/* Saudação e período */}
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-[#52719D]">
                    Início / Visão geral
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#172B4D] sm:text-3xl">
                    {saudacao}
                    {primeiroNome ? `, ${primeiroNome}` : ""}!
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Aqui está o resumo das atividades do INESQ Hub.
                  </p>
                </div>

                <label className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center">
                  <span className="font-medium">Período dos indicadores</span>
                  <select
                    value={periodo}
                    onChange={(event) => setPeriodo(event.target.value)}
                    className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#172B4D] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="mes-atual">Mês atual</option>
                    <option value="mes-anterior">Mês anterior</option>
                    <option value="ultimos-tres-meses">Últimos 3 meses</option>
                    <option value="ano-atual">Ano atual</option>
                    <option value="registros-abertos">
                      Todos os registros em aberto
                    </option>
                  </select>
                </label>
              </div>

              {/* Indicadores principais */}
              <section aria-labelledby="indicadores-titulo">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2
                    id="indicadores-titulo"
                    className="text-base font-semibold text-[#172B4D]"
                  >
                    Indicadores principais
                  </h2>
                  <p className="text-xs capitalize text-slate-500">
                    {periodoSelecionado[periodo]}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                  {indicadores.map((indicador) => (
                    <article
                      key={indicador.titulo}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-semibold ${
                            indicador.cor === "orange"
                              ? "bg-orange-50 text-orange-600"
                              : "bg-[#EAF1FF] text-[#17438A]"
                          }`}
                        >
                          {indicador.icon}
                        </div>
                      </div>

                      <p className="mt-4 text-xs font-medium leading-5 tracking-wide text-slate-500">
                        {indicador.titulo}
                      </p>

                      <p className="mt-2 text-3xl font-semibold text-[#172B4D]">
                        —
                      </p>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {indicador.descricao}
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              {/* Atalhos */}
              <section
                aria-labelledby="acesso-rapido-titulo"
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <h2
                  id="acesso-rapido-titulo"
                  className="text-base font-semibold text-[#172B4D]"
                >
                  Acesso rápido
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Atalhos para as tarefas mais comuns.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {acessosRapidos.map((acesso) => (
                    <button
                      key={acesso.titulo}
                      type="button"
                      onClick={() => abrirArea(acesso.destino)}
                      className="group flex items-start gap-3 rounded-xl border border-transparent p-3 text-left transition hover:border-blue-100 hover:bg-[#F6F9FF]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF1FF] text-lg text-[#17438A]">
                        {acesso.icon}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-[#172B4D] group-hover:text-[#17438A]">
                          {acesso.titulo}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {acesso.descricao}
                        </span>
                      </span>

                      <span className="mt-2 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#17438A]">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Documentos recentes */}
              <section
                aria-labelledby="documentos-recentes-titulo"
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <h2
                      id="documentos-recentes-titulo"
                      className="text-base font-semibold text-[#172B4D]"
                    >
                      Documentos recentes
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Arquivos com nome, data de recebimento e situação.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => abrirArea("Receber documentos")}
                    className="self-start rounded-lg px-3 py-2 text-sm font-medium text-[#17438A] transition hover:bg-blue-50 sm:self-auto"
                  >
                    Acessar documentos →
                  </button>
                </div>

                <div className="grid grid-cols-12 gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                  <span className="col-span-6 sm:col-span-6">Documento</span>
                  <span className="col-span-3">Recebimento</span>
                  <span className="col-span-3">Situação</span>
                </div>

                {carregandoDocumentos ? (
  <div className="px-5 py-8 text-center text-sm text-slate-500">
    Carregando documentos...
  </div>
) : erroDocumentos ? (
  <div className="px-5 py-8 text-center">
    <p className="text-sm text-red-600">{erroDocumentos}</p>

    <button
      type="button"
      onClick={() => void carregarDocumentos()}
      className="mt-3 rounded-lg bg-blue-50 px-4 py-2 text-sm text-[#17438A]"
    >
      Tentar novamente
    </button>
  </div>
) : documentosRecentes.length === 0 ? (
  <div className="px-5 py-8 text-center">
    <p className="text-sm font-medium text-[#172B4D]">
      Nenhum documento recebido ainda
    </p>
    <p className="mt-1 text-xs text-slate-500">
      Os documentos registrados aparecerão aqui.
    </p>
  </div>
) : (
  <div className="divide-y divide-slate-100">
    {documentosRecentes.map((documento) => (
      <div
        key={documento.id}
        className="grid grid-cols-12 items-center gap-3 px-5 py-4 sm:px-6"
      >
        <div className="col-span-6 min-w-0">
          <p className="break-words text-sm font-medium text-[#172B4D]">
            {documento.originalName}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {(documento.sizeBytes / 1024).toFixed(1)} KB
          </p>

          {documento.duplicateReviewRequired && (
            <p className="mt-1 text-xs font-medium text-orange-600">
              Possível duplicado — conferir
            </p>
          )}
        </div>

        <div className="col-span-3 text-xs text-slate-500">
          {new Intl.DateTimeFormat("pt-BR").format(
            new Date(documento.receivedAt)
          )}
        </div>

        <div className="col-span-3">
          <span className="inline-block rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-[#17438A]">
            {documento.status === "RECEIVED"
              ? "Recebido"
              : documento.status === "UNDER_REVIEW"
                ? "Em conferência"
                : documento.status === "NEEDS_CORRECTION"
                  ? "Precisa de ajuste"
                  : "Conferido"}
          </span>
        </div>
      </div>
    ))}
  </div>
)}
              </section>

              {/* Pendências prioritárias */}
              <section
                aria-labelledby="pendencias-titulo"
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <h2
                  id="pendencias-titulo"
                  className="text-base font-semibold text-[#172B4D]"
                >
                  Pendências que merecem atenção
                </h2>

                <div className="mt-4 divide-y divide-slate-100">
                  <button
                    type="button"
                    onClick={() => abrirArea("Receber documentos")}
                    className="flex w-full items-start gap-3 rounded-lg py-4 text-left transition hover:bg-slate-50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-lg text-orange-600">
                      !
                    </span>

                    <span className="flex-1">
                      <span className="block text-sm font-medium text-[#172B4D]">
                        Comprovantes faltantes
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Documentos que precisam ser conferidos ou recebidos.
                      </span>
                    </span>

                    <span className="pt-1 text-slate-400">→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => abrirArea("Parcelas")}
                    className="flex w-full items-start gap-3 rounded-lg py-4 text-left transition hover:bg-slate-50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg text-[#17438A]">
                      ◷
                    </span>

                    <span className="flex-1">
                      <span className="block text-sm font-medium text-[#172B4D]">
                        Parcelas a verificar
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Registros que precisam de acompanhamento e confirmação
                        financeira.
                      </span>
                    </span>

                    <span className="pt-1 text-slate-400">→</span>
                  </button>
                </div>
              </section>

              <p className="px-1 text-xs leading-5 text-slate-400">
                Os indicadores estão aguardando integração com os registros
                reais. O envio de um arquivo, por si só, não confirma um
                pagamento.
              </p>
            </>
                    ) : activeItem === "Receber documentos" ? (
            <section className="space-y-6">
              {/* Cabeçalho da área */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#52719D]">
                  Documentos / Recebimento
                </p>

                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-[#172B4D] sm:text-3xl">
                      Receber documentos
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      Reúna os arquivos em lotes para preparar a conferência
                      e a organização documental.
                    </p>
                  </div>

                  <span className="w-fit rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-[#17438A]">
                    Prévia da interface
                  </span>
                </div>
              </div>

              {/* Etapas planejadas */}
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    numero: "01",
                    titulo: "Recebimento",
                    descricao: "Selecionar arquivos",
                    atual: true,
                  },
                  {
                    numero: "02",
                    titulo: "Conferência",
                    descricao: "Revisar dados e possíveis duplicados",
                    atual: false,
                  },
                  {
                    numero: "03",
                    titulo: "Registro",
                    descricao: "Registrar e acompanhar a situação",
                    atual: false,
                  },
                ].map((etapa) => (
                  <div
                    key={etapa.numero}
                    className={`rounded-2xl border p-4 ${
                      etapa.atual
                        ? "border-blue-200 bg-blue-50/70"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold ${
                          etapa.atual
                            ? "bg-[#17438A] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {etapa.numero}
                      </span>

                      <div>
                        <p className="text-sm font-semibold text-[#172B4D]">
                          {etapa.titulo}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {etapa.descricao}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Área de seleção de arquivos */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-5">
                  <h3 className="text-base font-semibold text-[#172B4D]">
                    Selecionar arquivos
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Escolha vários arquivos de uma vez ou arraste-os para a área.
                  </p>
                </div>

                <label
                  htmlFor="arquivos-inbox"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();

                    setArquivosSelecionados((atuais) => [
                      ...atuais,
                      ...Array.from(event.dataTransfer.files),
                    ]);
                  }}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-[#F7FAFF] px-5 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/70 sm:py-14"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl text-[#17438A] shadow-sm">
                    ↥
                  </span>

                  <span className="mt-4 text-base font-semibold text-[#172B4D]">
                    Arraste os arquivos até aqui
                  </span>

                  <span className="mt-2 text-sm text-slate-500">
                    ou clique para procurar no computador
                  </span>

                  <span className="mt-3 text-xs text-slate-400">
                    PDF, imagens, documentos, planilhas e XML
                  </span>

                  <input
                    id="arquivos-inbox"
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.xml"
                    className="sr-only"
                    onChange={(event) => {
                      const novosArquivos = Array.from(
                        event.currentTarget.files ?? []
                      );

                      setArquivosSelecionados((atuais) => [
                        ...atuais,
                        ...novosArquivos,
                      ]);

                      event.currentTarget.value = "";
                    }}
                  />
                </label>

                <p className="mt-3 text-xs leading-5 text-slate-400">
                  Nesta prévia, os arquivos ficam apenas na memória da página.
                  Eles não são enviados nem salvos no sistema.
                </p>
              </div>

              {/* Lista de arquivos selecionados */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <h3 className="font-semibold text-[#172B4D]">
                      Arquivos selecionados
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {arquivosSelecionados.length === 0
                        ? "Nenhum arquivo selecionado"
                        : `${arquivosSelecionados.length} arquivo(s) nesta seleção`}
                    </p>
                  </div>

                  {arquivosSelecionados.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setArquivosSelecionados([])}
                      className="self-start rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      Limpar seleção
                    </button>
                  )}
                </div>

                {arquivosSelecionados.length === 0 ? (
                  <div className="px-5 py-9 text-center">
                    <p className="text-sm font-medium text-slate-600">
                      Sua lista está vazia
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Os arquivos escolhidos aparecerão aqui para conferência visual.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {arquivosSelecionados.map((arquivo, indice) => (
                      <li
                        key={`${arquivo.name}-${indice}`}
                        className="flex items-center gap-3 px-5 py-4 sm:px-6"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF1FF] text-lg text-[#17438A]">
                          ▤
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="break-all text-sm font-medium text-[#172B4D]">
                            {arquivo.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {arquivo.size < 1024 * 1024
                              ? `${(arquivo.size / 1024).toFixed(1)} KB`
                              : `${(arquivo.size / (1024 * 1024)).toFixed(2)} MB`}
                            {" · "}
                            Selecionado localmente
                          </p>
                        </div>

                        <button
                          type="button"
                          aria-label={`Remover ${arquivo.name}`}
                          onClick={() =>
                            setArquivosSelecionados((atuais) =>
                              atuais.filter((_, i) => i !== indice)
                            )
                          }
                          className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          Remover
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
                  <div className="flex items-start gap-3">
                    <span className="text-lg text-[#17438A]">ⓘ</span>
                    <p className="text-xs leading-5 text-slate-500">
                      A conferência, a detecção de duplicados e o registro do
                      recebimento serão habilitados na etapa de integração.
                      Selecionar um arquivo não confirma pagamento nem altera
                      o status financeiro de qualquer parcela.
                    </p>
                  </div>
                </div>
              </div>

                 {erroEnvio && (
                <p
                   role="alert"
                  className="mx-5 mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700"
                >
                 {erroEnvio}
                </p>
             )}

              {sucessoEnvio && (
                <p
                role="status"
              className="mx-5 mb-3 rounded-xl bg-green-50 p-3 text-sm text-green-700"
              >
            {sucessoEnvio}
      </p>
    )}

      <div className="flex justify-end px-5 py-4">
    <button
  type="button"
   onClick={enviarArquivos}
  disabled={enviando || arquivosSelecionados.length === 0}
  className="rounded-xl bg-[#102F68] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17438A] disabled:cursor-not-allowed disabled:opacity-50"
  >
  {enviando ? "Enviando arquivos..." : "Enviar e registrar lote"}
  </button>
</div>
              {/* Regras previstas para o fluxo */}
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="font-semibold text-[#172B4D]">
                    Conferência documental
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Os dados extraídos deverão ser revisados quando houver
                    dúvida. Possíveis duplicados serão sinalizados para análise,
                    sem vinculação automática.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="font-semibold text-[#172B4D]">
                    Histórico e rastreabilidade
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    O sistema deverá registrar separadamente quem enviou e quem
                    conferiu cada documento, incluindo as respectivas datas.
                  </p>
                </div>
              </div>
            </section>
          ) : (
            /* Estrutura visual das demais áreas ainda não implementadas */
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF1FF] text-2xl text-[#17438A]">
                {menuGroups
                  .flatMap((group) => group.items)
                  .find((item) => item.name === activeItem)?.icon || "▤"}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold text-[#172B4D]">
                  {activeItem}
                </h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  Em planejamento
                </span>
              </div>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                {descricoesAreas[activeItem] ||
                  "Esta área será desenvolvida conforme o planejamento do INESQ Hub."}
              </p>

              <button
                type="button"
                onClick={() => abrirArea("Início")}
                className="mt-6 rounded-xl bg-[#102F68] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#17438A]"
              >
                ← Voltar à visão geral
              </button>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}