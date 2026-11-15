"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { advance, isTyped, stepAt, type Progress, type TerminalLine } from "@/lib/terminal";
import { cn } from "@/lib/utils";

const REDUCED = "(prefers-reduced-motion: reduce)";

/** «Riduci movimento». Sul server e senza JavaScript vale true: il terminale è già completo. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = matchMedia(REDUCED);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => matchMedia(REDUCED).matches,
    () => true,
  );
}

const START: Progress = { shown: 0, typed: 0 };

/**
 * Terminale finto: scrive le righe una alla volta quando entra nello schermo, con Pausa e Ricomincia (WCAG 2.2.2).
 * Con «riduci movimento» è completo e fermo. I lettori di schermo leggono il testo intero, senza animazione.
 * `onStep` riceve il passo della riga in corso (TerminalLine.step), per sincronizzare un diagramma.
 */
export function Terminal({
  lines,
  title,
  label,
  onStep,
  className,
}: {
  lines: readonly TerminalLine[];
  title: string;
  label?: string;
  onStep?: (step: number | undefined) => void;
  className?: string;
}) {
  const still = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState<Progress>(START);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const done = progress.shown >= lines.length;

  useEffect(() => {
    const element = ref.current;
    if (still || started || !element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setStarted(true);
        onStep?.(stepAt(lines, START));
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [still, started, lines, onStep]);

  useEffect(() => {
    if (still || !started || paused) return;
    const step = advance(lines, progress);
    if (!step) return;
    const timer = setTimeout(() => {
      setProgress(step.next);
      onStep?.(step.next.shown >= lines.length ? undefined : stepAt(lines, step.next));
    }, step.delay);
    return () => clearTimeout(timer);
  }, [still, started, paused, progress, lines, onStep]);

  const restart = () => {
    setProgress(START);
    setPaused(false);
    setStarted(true);
    onStep?.(stepAt(lines, START));
  };

  // Tutte le righe sono sempre nel layout (quelle non ancora scritte invisibili): l'altezza non cambia mentre scrive.
  const view = still ? { shown: lines.length, typed: 0 } : progress;

  return (
    <figure ref={ref} className={cn("overflow-hidden rounded-xl border bg-card shadow-card", className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b bg-muted px-4 py-2">
        <span aria-hidden className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2.5 rounded-full bg-border" />
          ))}
        </span>
        <figcaption className="font-mono text-xs text-muted-foreground">{title}</figcaption>
        {label && (
          <Badge variant="outline" className="border-primary font-mono text-[0.6875rem] font-bold uppercase">
            {label}
          </Badge>
        )}
        {!still && (
          <div className="ml-auto flex gap-1">
            <Button variant="ghost" onClick={() => setPaused((p) => !p)} disabled={!started || done}>
              {paused ? <Play aria-hidden /> : <Pause aria-hidden />}
              {paused ? "Riprendi" : "Pausa"}
            </Button>
            <Button variant="ghost" onClick={restart}>
              <RotateCcw aria-hidden />
              Ricomincia
            </Button>
          </div>
        )}
      </div>
      <ol aria-hidden className="px-4 py-4 font-mono text-[0.8125rem] leading-6 whitespace-pre-wrap wrap-anywhere">
        {lines.map((line, i) => {
          const current = i === view.shown && isTyped(line) && !done;
          const visible = i < view.shown;
          return (
            <li key={i} data-dept={line.dept} className={cn(!visible && !current && "invisible")}>
              {current ? (
                <>
                  <Prefix line={line} />
                  {line.text.slice(0, view.typed)}
                  <span className="cursor inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] bg-foreground" />
                  <span className="invisible">{line.text.slice(view.typed)}</span>
                </>
              ) : (
                <Content line={line} />
              )}
            </li>
          );
        })}
      </ol>
      <ol className="sr-only">
        {lines.map((line, i) => (
          <li key={i}>
            {line.kind === "command" && "$ "}
            {line.kind === "prompt" && "> "}
            {line.label && `${line.label}: `}
            {line.text}
          </li>
        ))}
      </ol>
    </figure>
  );
}

function Prefix({ line }: { line: TerminalLine }) {
  if (line.kind === "command") return <span className="text-muted-foreground">$ </span>;
  if (line.kind === "prompt") return <span className="font-bold text-primary">&gt; </span>;
  return null;
}

function Content({ line }: { line: TerminalLine }) {
  switch (line.kind) {
    case "command":
    case "prompt":
      return (
        <>
          <Prefix line={line} />
          {line.text}
        </>
      );
    case "agent":
      return (
        <>
          <span className="font-bold text-dept">{line.label}</span>
          {"  "}
          <span className="text-muted-foreground">{line.text}</span>
        </>
      );
    case "confirm":
      return (
        <span className="-mx-2 inline-block rounded-md bg-muted px-2 font-semibold">
          <span className="text-primary">? </span>
          {line.text}
        </span>
      );
    case "ok":
      return <span className="font-semibold">{line.text}</span>;
    default:
      return <span className="block pl-4 text-muted-foreground">{line.text}</span>;
  }
}
