import { FLAME, CARBON } from "../lib/constants";

export function RenderAI({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-[13px] leading-relaxed" style={{ color: CARBON }}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const boldParsed = line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
          j % 2 === 1 ? <strong key={j} className="font-black">{part}</strong> : part
        );
        if (line.startsWith("→") || line.startsWith("•")) {
          return (
            <div key={i} className="flex items-start gap-2 pl-1">
              <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: FLAME }} />
              <span>{line.replace(/^[→•]\s*/, "").split(/\*\*(.*?)\*\*/g).map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</span>
            </div>
          );
        }
        return <p key={i}>{boldParsed}</p>;
      })}
    </div>
  );
}
