import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-zinc-950 text-white font-sans">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-zinc-800 bg-zinc-900/50 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-zinc-900/50 lg:p-4">
          Lazydlp Monorepo &nbsp;
          <code className="font-mono font-bold text-orange-500">v1.2.1</code>
        </p>
      </div>

      <div className="relative flex place-items-center mt-32 mb-16">
        <h1 className="text-6xl font-extrabold tracking-tight">
          Lazydlp
        </h1>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left gap-8">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-zinc-800 hover:bg-zinc-900/50">
          <h2 className="mb-3 text-2xl font-semibold text-orange-500">
            What is it?{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-70">
            A conversational, interactive Terminal UI (TUI) wrapper around yt-dlp.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-zinc-800 hover:bg-zinc-900/50">
          <h2 className="mb-3 text-2xl font-semibold text-orange-500">
            CLI Tool{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-70">
            It lives in the <code>packages/cli</code> directory. It's built with React Ink and has a Claude Code-like aesthetic.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-zinc-800 hover:bg-zinc-900/50">
          <h2 className="mb-3 text-2xl font-semibold text-orange-500">
            Setup{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-70">
            Type <code>/configure</code> in the CLI and it automatically downloads and sets up the yt-dlp binaries for your OS!
          </p>
        </div>
      </div>
    </main>
  );
}
