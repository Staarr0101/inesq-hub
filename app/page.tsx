export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12">
          <p className="mb-2 text-sm font-medium text-blue-600">
            INESQ
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
            INESQ Hub
          </h1>

          <p className="mt-3 max-w-2xl text-lg text-zinc-600">
            Central de documentos e automação.
          </p>
        </header>

        <section>
          <h2 className="mb-6 text-2xl font-semibold text-zinc-900">
            Ferramentas
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <button className="rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md">
              <h3 className="text-lg font-semibold text-zinc-900">
                Dividir PDF
              </h3>

              <p className="mt-2 text-sm text-zinc-600">
                Separe um PDF em vários arquivos.
              </p>
            </button>

            <button className="rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md">
              <h3 className="text-lg font-semibold text-zinc-900">
                Unir PDFs
              </h3>

              <p className="mt-2 text-sm text-zinc-600">
                Combine vários PDFs em um único arquivo.
              </p>
            </button>

            <button className="rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md">
              <h3 className="text-lg font-semibold text-zinc-900">
                Renomear arquivos
              </h3>

              <p className="mt-2 text-sm text-zinc-600">
                Organize e padronize nomes de documentos.
              </p>
            </button>

            <button className="rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md">
              <h3 className="text-lg font-semibold text-zinc-900">
                PDF → Word
              </h3>

              <p className="mt-2 text-sm text-zinc-600">
                Converta documentos PDF para Word.
              </p>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}