"use client";

import { useCallback, useState } from "react";
import { Check } from "lucide-react";
import { Terminal, useReducedMotion } from "@/components/terminal";
import type { FlowNode } from "@/lib/scripts";
import type { TerminalLine } from "@/lib/terminal";
import { cn } from "@/lib/utils";

const ALL_DONE = Number.POSITIVE_INFINITY;

/**
 * «Come lavoriamo»: diagramma dei passi a sinistra (sopra, sotto i 1024 px) e terminale a destra.
 * Il nodo del passo in corso si illumina mentre il terminale scrive; prima della partenza i nodi sono in attesa,
 * a fine copione (e con «riduci movimento») sono tutti fatti.
 */
export function Simulation({ nodes, lines }: { nodes: readonly FlowNode[]; lines: readonly TerminalLine[] }) {
  const still = useReducedMotion();
  const [active, setActive] = useState(-1);
  const current = still ? ALL_DONE : active;
  const onStep = useCallback((step: number | undefined) => setActive(step ?? ALL_DONE), []);

  return (
    <div className="mt-6 grid items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <ol aria-label="I passi della richiesta" className="grid gap-2">
        {nodes.map((node, i) => {
          const state = i < current ? "done" : i === current ? "active" : "pending";
          return (
            <li
              key={i}
              data-dept={node.dept}
              data-state={state}
              aria-current={state === "active" ? "step" : undefined}
              className={cn(
                "relative flex items-start gap-3 rounded-lg border bg-card px-3 py-2 transition-colors duration-300 motion-reduce:transition-none",
                "not-last:after:absolute not-last:after:top-full not-last:after:left-[1.4rem] not-last:after:h-2 not-last:after:w-px not-last:after:bg-border",
                node.confirm && "border-2 border-primary",
                node.skipped && "border-dashed",
                state === "active" && (node.confirm ? "bg-primary text-primary-foreground" : "border-dept bg-dept/8 ring-1 ring-dept"),
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border text-[0.625rem]",
                  node.confirm ? "rotate-45 rounded-[0.2rem] border-current" : "border-dept",
                  state === "done" && !node.skipped && (node.confirm ? "bg-primary text-primary-foreground" : "bg-dept text-primary-foreground"),
                )}
              >
                {state === "done" && !node.skipped && <Check className={cn("size-3", node.confirm && "-rotate-45")} />}
              </span>
              <span className="min-w-0 text-[0.9375rem] leading-snug">
                {node.dept && <span className={cn("mr-1.5 font-mono text-[0.8125rem] font-bold", state === "active" && node.confirm ? "" : "text-dept")}>{node.dept}</span>}
                <span className={cn(node.confirm && "font-semibold", state === "pending" && "text-muted-foreground")}>{node.label}</span>
                {node.detail && (
                  <span className={cn("block text-[0.8125rem]", state === "active" && node.confirm ? "text-primary-foreground/85" : "text-muted-foreground")}>
                    {node.detail}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
      <Terminal lines={lines} title="agentrica" label="Simulazione" onStep={onStep} />
    </div>
  );
}
