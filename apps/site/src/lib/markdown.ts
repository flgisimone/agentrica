// Markdown dei file di agents/: paragrafi, elenchi piatti, blocchi di codice, grassetto e codice in linea.
// ponytail: copre solo ciò che i file usano oggi (plan/03-reparti.md); tabelle, link o titoli dentro le sezioni
// diventerebbero testo semplice. Se un file di ruolo li introduce, si estende qui o si valuta una dipendenza.

export type Inline = { type: "text" | "strong" | "code"; text: string };

export type Block =
  | { type: "p"; inlines: Inline[] }
  | { type: "ul" | "ol"; items: Inline[][] }
  | { type: "code"; text: string };

const BULLET = /^[-*] (.*)$/;
const NUMBER = /^\d+\. (.*)$/;

export function parseMarkdown(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length) blocks.push({ type: "p", inlines: parseInline(paragraph.join(" ")) });
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (line.startsWith("```")) {
      flush();
      const code: string[] = [];
      while (++i < lines.length && !lines[i]!.trim().startsWith("```")) code.push(lines[i]!);
      blocks.push({ type: "code", text: code.join("\n") });
      continue;
    }
    const item = BULLET.exec(line) ?? NUMBER.exec(line);
    if (item) {
      flush();
      const type = BULLET.test(line) ? "ul" : "ol";
      const last = blocks.at(-1);
      const inlines = parseInline(item[1]!);
      if (last?.type === type) last.items.push(inlines);
      else blocks.push({ type, items: [inlines] });
      continue;
    }
    if (line === "") flush();
    else paragraph.push(line);
  }
  flush();
  return blocks;
}

export function parseInline(text: string): Inline[] {
  return text
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/)
    .filter((part) => part !== "")
    .map((part): Inline => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return { type: "strong", text: part.slice(2, -2) };
      if (part.startsWith("`") && part.endsWith("`") && part.length > 2) return { type: "code", text: part.slice(1, -1) };
      return { type: "text", text: part };
    });
}
