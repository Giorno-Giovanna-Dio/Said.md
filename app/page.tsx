import { Converter } from "@/components/converter";

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
          <p className="text-sm text-[#7a7166]">Public captions · local download</p>
        </div>
      </header>

      <main className="flex-1 px-6 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="max-w-3xl font-serif text-4xl leading-tight text-[#1c1915] sm:text-6xl">
            Turn a YouTube transcript into a downloadable Markdown file.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#5e564c]">
            Paste a public video link, pull the existing captions, then preview,
            copy, or download a
            <span className="whitespace-nowrap"> .md</span>
            {" "}file. A Chrome side panel is available so you don’t need a new tab.
          </p>
        </div>

        <div className="mt-10">
          <Converter />
        </div>
      </main>
    </div>
  );
}
