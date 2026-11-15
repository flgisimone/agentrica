// Glifo di una stella (plan/09-simboli.md, stile B · costellazione): da 4 a 7 punti collegati, calcolati dal nome.
// Stesso nome, stesso disegno: hash FNV-1a come seme di mulberry32. Coordinate in un viewBox 0 0 100 100.

export type Dot = { x: number; y: number; r: number };

export type Glyph = {
  /** Punti della costellazione; il primo è la stella principale. */
  dots: readonly Dot[];
  /** Catena per vicinanza dalla stella principale, come attributo `points` di una polyline. */
  line: string;
  /** Segmento in più che chiude un anello, se c'è. */
  extra?: readonly [Dot, Dot];
};

function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (const char of text) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n: number) => Math.round(n * 100) / 100;
const distance = (a: Dot, b: Dot) => Math.hypot(a.x - b.x, a.y - b.y);

export function glyph(star: string): Glyph {
  const random = mulberry32(fnv1a(star));
  const count = 4 + Math.floor(random() * 4);
  const dots: Dot[] = [];

  // ponytail: i tentativi sono limitati; con 7 punti a 14 di distanza nel disco di raggio 36 bastano sempre (test).
  for (let attempt = 0; dots.length < count && attempt < 500; attempt++) {
    const angle = random() * Math.PI * 2;
    const radius = 6 + Math.sqrt(random()) * 30;
    const dot = { x: round(50 + radius * Math.cos(angle)), y: round(50 + radius * Math.sin(angle)), r: 0 };
    if (dots.every((other) => distance(other, dot) > 14)) dots.push(dot);
  }
  dots.forEach((dot, i) => (dot.r = i === 0 ? 3.6 : round(1.8 + random() * 1.2)));

  const [first, ...left] = dots;
  if (!first) throw new Error(`glifo: nessun punto per ${star}`);
  const chain = [first];
  for (let last = first; left.length > 0; ) {
    left.sort((a, b) => distance(a, last) - distance(b, last));
    last = left.shift()!;
    chain.push(last);
  }

  const second = chain[1];
  const end = chain[chain.length - 1];
  const closed = random() < 0.5 && dots.length > 4 && second && end;
  return {
    dots,
    line: chain.map((d) => `${d.x} ${d.y}`).join(" "),
    ...(closed && { extra: [second, end] as const }),
  };
}
