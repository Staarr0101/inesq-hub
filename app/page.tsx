import Image from "next/image";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Fundo azul escuro */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/azul-fundo.png')" }} />

      {/* QUALIFICA DF — canto superior esquerdo */}
<div className="absolute left-8 top-8 z-30 text-white">
    <span className="font-[family-name:var(--font-anton)] text-3xl tracking-widest text-[#168BFF] drop-shadow-md sm:text-4xl">
     QUALIFICA DF
    </span>
</div>

{/* INESQ — canto superior direito */}
<div className="absolute right-8 top-8 z-30 text-white">
   <span className="font-[family-name:var(--font-anton)] text-xl tracking-widest drop-shadow-md sm:text-2xl">
    INESQ
  </span>
</div>

      {/* Painel de login */}
      <section className="absolute left-1/2 top-1/2 z-10 w-[min(90%,420px)] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-white/30 bg-white/10 p-10 shadow-[0_8px_32px_rgba(0,0,0,0.25),0_0_20px_rgba(56,189,248,0.08)] backdrop-blur-xl">
        <div className="space-y-8">
          <div>
            <label className="mb-3 block font-[family-name:var(--font-anton)] text-lg tracking-wider text-white">
              LOGIN
            </label>

            <input
              type="text"
              className="h-12 w-full rounded-xl border border-white/40 bg-white/20 px-4 text-white outline-none backdrop-blur-md transition duration-200 placeholder:text-white/65 focus:border-cyan-300 focus:bg-white/25 focus:ring-2 focus:ring-cyan-300/30"

              placeholder="Digite seu login"
            />
          </div>

          <div>
            <label className="mb-3 block font-[family-name:var(--font-anton)] text-lg tracking-wider text-white">
              SENHA
            </label>

            <input
              type="password"
              className="h-12 w-full rounded-xl border border-white/40 bg-white/20 px-4 text-white outline-none backdrop-blur-md transition duration-200 placeholder:text-white/65 focus:border-cyan-300 focus:bg-white/25 focus:ring-2 focus:ring-cyan-300/30"
              placeholder="Digite sua senha"
            />
          </div>

          <button
            type="button"
            className="h-12 w-full rounded-xl bg-[#102F68] font-[family-name:var(--font-anton)] text-lg tracking-wider text-white shadow-lg shadow-blue-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#17438A] hover:shadow-lg hover:shadow-cyan-400/20 active:translate-y-0 active:scale-[0.99]"
          >
            ENTRAR
          </button>
        </div>

        {/* Mascote preso ao painel */}
        <div className="absolute -bottom-28 -right-24 z-30 w-[190px] sm:-bottom-32 sm:-right-32 sm:w-[240px]">
          <Image
            src="/images/mascote.png"
            alt="Mascote"
            width={600}
            height={800}
            className="h-auto w-full"
            priority
          />
        </div>
      </section>
    </main>
  );
}