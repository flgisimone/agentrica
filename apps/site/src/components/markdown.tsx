import { parseMarkdown, type Inline } from "@/lib/markdown";
import { cn } from "@/lib/utils";

function Inlines({ inlines }: { inlines: Inline[] }) {
  return inlines.map((part, index) => {
    if (part.type === "strong") return <strong key={index}>{part.text}</strong>;
    if (part.type === "code")
      return (
        <code key={index} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.875em] wrap-break-word">
          {part.text}
        </code>
      );
    return part.text;
  });
}

/** Markdown di un file di agents/, reso al build. */
export function Markdown({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("grid gap-3", className)}>
      {parseMarkdown(text).map((block, index) => {
        if (block.type === "p")
          return (
            <p key={index}>
              <Inlines inlines={block.inlines} />
            </p>
          );
        if (block.type === "code")
          return (
            // tabIndex: il blocco scorre in orizzontale e deve essere raggiungibile da tastiera (WCAG 2.1.1).
            <pre
              key={index}
              tabIndex={0}
              aria-label="Esempio di codice"
              className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-[0.8125rem]"
            >
              <code>{block.text}</code>
            </pre>
          );
        const List = block.type;
        return (
          <List key={index} className={cn("grid gap-1.5 pl-5", List === "ul" ? "list-disc" : "list-decimal")}>
            {block.items.map((item, i) => (
              <li key={i} className="pl-1 marker:text-dept">
                <Inlines inlines={item} />
              </li>
            ))}
          </List>
        );
      })}
    </div>
  );
}
