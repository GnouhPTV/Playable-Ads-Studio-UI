"use client";

import { useEffect, useRef, useState } from "react";
import type { PhaserPreviewProps } from "@/types/game";
import { createPhaserConfig } from "@/lib/game/phaserConfig";
import { createCtaFlowScene } from "@/lib/game/scenes/CtaFlowScene";
import { createGemCollectorScene } from "@/lib/game/scenes/GemCollectorScene";
import { createMergeCannonScene } from "@/lib/game/scenes/MergeCannonScene";
import { createRunnerGateScene } from "@/lib/game/scenes/RunnerGateScene";
import { createTapMonsterScene } from "@/lib/game/scenes/TapMonsterScene";

export function PhaserPreview({ project }: PhaserPreviewProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<any>(null);
  const [message, setMessage] = useState("Booting preview...");

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      if (!mountRef.current) {
        return;
      }

      setMessage("Booting preview...");
      gameRef.current?.destroy(true);
      gameRef.current = null;
      mountRef.current.innerHTML = "";

      try {
        const PhaserModule = await import("phaser");
        const Phaser = (PhaserModule as any).default ?? PhaserModule;
        const scenes = {
          "gem-collector": createGemCollectorScene,
          "intro-cta": createCtaFlowScene,
          "merge-cannon": createMergeCannonScene,
          "runner-gate": createRunnerGateScene,
          "simple-end-card": createCtaFlowScene,
          "tap-monster": createTapMonsterScene
        };
        const scene = scenes[project.templateId](Phaser, project);

        if (cancelled || !mountRef.current) {
          return;
        }

        gameRef.current = new Phaser.Game(createPhaserConfig(Phaser, mountRef.current, scene));
        setMessage("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Preview failed to load.");
      }
    }

    void boot();

    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [project]);

  return (
    <div className="relative h-full w-full">
      <div ref={mountRef} className="h-full w-full" />
      {message ? (
        <div className="absolute inset-0 grid place-items-center bg-black text-sm text-studio-muted">
          {message}
        </div>
      ) : null}
    </div>
  );
}
