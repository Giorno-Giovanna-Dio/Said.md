import { formatTimestamp } from "@/lib/markdown";
import type { TranscriptTurn } from "@/lib/types";

const speakerClass = [
  "border-[#c45c3e] text-[#7a2e1c]",
  "border-[#2f6f78] text-[#1d4f56]",
] as const;

export function TranscriptPreview({
  videoId,
  turns,
}: {
  videoId: string;
  turns: TranscriptTurn[];
}) {
  return (
    <div className="max-h-[32rem] space-y-5 overflow-auto px-5 py-5">
      {turns.map((turn, index) => {
        const seconds = Math.floor(turn.startMs / 1000);
        const stamp = formatTimestamp(turn.startMs);
        return (
          <article
            key={`${turn.startMs}-${index}`}
            className={`border-l-2 pl-4 ${speakerClass[turn.speaker]}`}
          >
            <a
              href={`https://youtu.be/${videoId}?t=${seconds}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs tracking-wide text-current/70 hover:text-current"
            >
              {stamp}
            </a>
            <p className="mt-1 text-[15px] leading-7">{turn.text}</p>
          </article>
        );
      })}
    </div>
  );
}
