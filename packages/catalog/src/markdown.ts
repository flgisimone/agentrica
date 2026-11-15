// Lettura minima dei file di ruolo: titolo (#), testo introduttivo e sezioni (##).
// ponytail: niente parser Markdown completo; i corpi restano Markdown grezzo. Quando il sito dovrà
// mostrarli formattati (F3) li rende Astro o una dipendenza approvata, non questo file.

export interface Section {
  heading: string;
  body: string;
}

export interface ParsedRole {
  title: string;
  intro: string;
  sections: Section[];
}

export function parseRole(markdown: string): ParsedRole {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const titleIndex = lines.findIndex((line) => line.startsWith("# "));
  if (titleIndex === -1) throw new Error("file di ruolo senza titolo «# …»");

  const title = lines[titleIndex]!.slice(2).trim();
  const intro: string[] = [];
  const sections: Section[] = [];
  let current: { heading: string; lines: string[] } | null = null;

  for (const line of lines.slice(titleIndex + 1)) {
    if (line.startsWith("## ")) {
      if (current) sections.push(close(current));
      current = { heading: line.slice(3).trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else {
      intro.push(line);
    }
  }
  if (current) sections.push(close(current));

  return { title, intro: intro.join("\n").trim(), sections };
}

function close(section: { heading: string; lines: string[] }): Section {
  return { heading: section.heading, body: section.lines.join("\n").trim() };
}
