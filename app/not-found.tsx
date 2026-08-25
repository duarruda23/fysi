import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      <Image
        src="/brand/logo-horizontal-preto.png"
        alt="Fysi"
        width={160}
        height={48}
        priority
        className="mb-10 h-auto w-40"
      />

      <p className="mb-2 text-sm uppercase tracking-[0.2em] text-[#ccb72f]">
        Página não encontrada
      </p>

      <h1
        className="mb-4 text-4xl text-[#11100e] sm:text-5xl"
        style={{ fontFamily: "var(--font-cormorant), serif" }}
      >
        Essa peça saiu de linha
      </h1>

      <p className="mb-10 max-w-md text-base text-[#11100e]/70">
        O link que você acessou não existe mais ou mudou de lugar. Mas o catálogo continua cheio
        de novidade — dá uma olhada.
      </p>

      <Link
        href="/produtos"
        className="rounded-full bg-[#11100e] px-8 py-3 text-sm font-medium uppercase tracking-wide text-[#f8f5ef] transition-opacity hover:opacity-90"
      >
        Ver catálogo
      </Link>
    </main>
  );
}
