import { Converter } from "@/components/converter";

const GITHUB_URL = "https://github.com/Giorno-Giovanna-Dio/Said.md";
const isHosted = process.env.VERCEL === "1";

const cloneCommands = `git clone ${GITHUB_URL}.git
cd Said.md
npm install
npm run dev`;

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-[#eadfcf] px-6 py-5">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
          <p className="flex items-center gap-2 font-serif text-lg tracking-tight text-[#1c1915]">
            <img
              src="/said-icon.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-sm object-cover"
            />
            Said<span className="text-[#c45c3e]">.md</span>
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[#7a7166] underline-offset-4 hover:text-[#1c1915] hover:underline"
          >
            GitHub
          </a>
        </div>
      </header>

      <main className="flex-1 px-6 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="max-w-3xl font-serif text-4xl leading-tight text-[#1c1915] sm:text-6xl">
            Turn a YouTube transcript into a downloadable Markdown file.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#5e564c]">
            Said.md is open source. Run it on your computer so YouTube captions
            are fetched from your network, not from a datacenter IP.
          </p>
        </div>

        <section className="mx-auto mt-10 w-full max-w-5xl rounded-sm border border-[#e4d9c8] bg-[#fbf6ec] px-5 py-6 sm:px-8 sm:py-8">
          <p className="text-sm tracking-[0.18em] text-[#c45c3e]">
            RUN IT LOCALLY
          </p>
          <h2 className="mt-2 font-serif text-2xl text-[#1c1915]">
            Use it from GitHub
          </h2>
          {isHosted ? (
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#5e564c]">
              This hosted page cannot convert videos. YouTube blocks caption
              requests from Vercel. Clone the repo and run the app locally
              instead.
            </p>
          ) : (
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#5e564c]">
              Keep this local server running while you convert, including when
              you use the Chrome side panel.
            </p>
          )}

          <ol className="mt-6 flex flex-col gap-5 text-base leading-7 text-[#1c1915]">
            <li>
              <p>
                <span className="text-[#c45c3e]">1.</span> Clone and start the
                app. You need Node.js 20+.
              </p>
              <pre className="mt-2 overflow-x-auto rounded-sm border border-[#eadfcf] bg-[#fffdf8] px-4 py-3 font-mono text-sm text-[#1c1915]">
                {cloneCommands}
              </pre>
            </li>
            <li>
              <p>
                <span className="text-[#c45c3e]">2.</span> Open{" "}
                <span className="whitespace-nowrap font-mono text-sm">
                  http://localhost:3000
                </span>{" "}
                and paste a public YouTube URL that has captions/CC.
              </p>
            </li>
            <li>
              <p>
                <span className="text-[#c45c3e]">3.</span> Optional Chrome side
                panel: go to{" "}
                <span className="whitespace-nowrap font-mono text-sm">
                  chrome://extensions
                </span>
                , enable Developer mode, Load unpacked, and select the{" "}
                <span className="font-mono text-sm">extension/</span> folder.
                Leave <span className="font-mono text-sm">npm run dev</span>{" "}
                running.
              </p>
            </li>
          </ol>

          <p className="mt-6 text-sm text-[#7a7166]">
            Source and issues:{" "}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="text-[#c45c3e] underline-offset-4 hover:underline"
            >
              {GITHUB_URL.replace("https://", "")}
            </a>
          </p>
        </section>

        {isHosted ? null : (
          <div className="mt-10">
            <Converter />
          </div>
        )}
      </main>
    </div>
  );
}
