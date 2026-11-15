import { ImageResponse } from "next/og";
import { loadCatalog } from "@agentrica/catalog";
import { BrandMark, brand } from "@/components/brand-mark";

export const alt = "Agentrica · Consulenza agentica";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Anteprima dei link condivisi, generata al build. I numeri vengono dal catalogo.
export default function OpengraphImage() {
  const departments = loadCatalog();
  const total = departments.reduce((sum, d) => sum + d.agents.length, 0);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: 96,
          background: brand.night,
          color: brand.light,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <BrandMark size={120} />
          <div style={{ fontSize: 112, fontWeight: 800, letterSpacing: -3 }}>Agentrica</div>
        </div>
        <div style={{ marginTop: 48, fontSize: 52 }}>Consulenza agentica, con te al comando.</div>
        <div style={{ marginTop: 24, fontSize: 36, opacity: 0.7 }}>
          {`${departments.length} reparti · ${total} agenti IA`}
        </div>
      </div>
    ),
    size,
  );
}
