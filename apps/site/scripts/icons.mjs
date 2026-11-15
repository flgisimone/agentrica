// Genera le icone PNG e favicon.ico da src/app/icon.svg. Si lancia a mano quando cambia il marchio: `node apps/site/scripts/icons.mjs`.
// ponytail: usa sharp, che arriva con Next e non è dichiarato fra le dipendenze; se Next smette di portarlo, va aggiunto in devDependencies.
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const app = new URL("../src/app/", import.meta.url);
const pub = new URL("../public/", import.meta.url);
const svg = await readFile(new URL("icon.svg", app), "utf8");

// Fondo pieno e simbolo ridotto: iOS e le icone maskable di Android ritagliano da sé la forma (zona sicura: cerchio dell'80%).
const filled = (scale) => {
  const inner = svg.match(/<g[\s\S]*<\/g>/)[0];
  const shift = (32 * (1 - scale)) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#e8ebf4"/><g transform="translate(${shift} ${shift}) scale(${scale})">${inner}</g></svg>`;
};

const png = (source, size) => sharp(Buffer.from(source), { density: 72 * (size / 32) * 2 }).resize(size, size).png().toBuffer();

await writeFile(new URL("apple-icon.png", app), await png(filled(0.9), 180));
await writeFile(new URL("icon-192.png", pub), await png(svg, 192));
await writeFile(new URL("icon-512.png", pub), await png(svg, 512));
await writeFile(new URL("icon-maskable-512.png", pub), await png(filled(0.7), 512));

// ICO con dentro un PNG da 32 px: intestazione di 6 byte, una voce da 16, poi il PNG.
const ico32 = await png(svg, 32);
const head = Buffer.alloc(22);
head.writeUInt16LE(1, 2); // tipo: icona
head.writeUInt16LE(1, 4); // un'immagine
head.writeUInt8(32, 6); // larghezza
head.writeUInt8(32, 7); // altezza
head.writeUInt16LE(1, 10); // piani
head.writeUInt16LE(32, 12); // bit per pixel
head.writeUInt32LE(ico32.length, 14);
head.writeUInt32LE(22, 18); // posizione del PNG
await writeFile(new URL("favicon.ico", app), Buffer.concat([head, ico32]));
