"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { templateDefinitions } from "@/lib/templates/templateDefinitions";
import { TemplateCard } from "@/components/templates/TemplateCard";

const categories = ["All", "Merge", "Runner", "Tap", "Puzzle", "Shooter", "Casual"] as const;
const difficulties = ["All", "easy", "normal", "hard"] as const;
const sorts = ["Most Popular", "Recently Added", "Beginner Friendly"] as const;

export function TemplateLibrary() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]>("All");
  const [sort, setSort] = useState<(typeof sorts)[number]>("Most Popular");

  const templates = useMemo(() => {
    const filtered = templateDefinitions.filter((template) => {
      const matchesQuery =
        template.name.toLowerCase().includes(query.toLowerCase()) ||
        template.description.toLowerCase().includes(query.toLowerCase()) ||
        template.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));
      const matchesCategory = category === "All" || template.category === category;
      const matchesDifficulty = difficulty === "All" || template.difficulty === difficulty;

      return matchesQuery && matchesCategory && matchesDifficulty;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "Recently Added") return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      if (sort === "Beginner Friendly") return difficultyRank(a.difficulty) - difficultyRank(b.difficulty);
      return b.popularity - a.popularity;
    });
  }, [category, difficulty, query, sort]);

  return (
    <div className="space-y-6">
      <section className="studio-panel rounded-lg p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-normal text-slate-950">Template Gallery</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Start with a mechanic, then customize scenes, assets, interactions, validation, and export settings in the builder.
            </p>
          </div>
          <label className="relative block w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="studio-input pl-10"
              placeholder="Search templates..."
            />
          </label>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <Filter label="Category" value={category} onChange={(value) => setCategory(value as typeof category)} options={categories} />
          <Filter label="Difficulty" value={difficulty} onChange={(value) => setDifficulty(value as typeof difficulty)} options={difficulties} />
          <Filter label="Sort by" value={sort} onChange={(value) => setSort(value as typeof sort)} options={sorts} />
        </div>
      </section>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        className="grid gap-5 lg:grid-cols-3"
      >
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </motion.div>

      {templates.length === 0 ? (
        <div className="studio-panel rounded-lg border-dashed p-8 text-center text-sm text-slate-500">
          No templates match those filters. Try clearing search or selecting All categories.
        </div>
      ) : null}
    </div>
  );
}

function Filter({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  return (
    <label>
      <span className="studio-label">{label}</span>
      <select className="studio-input" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function difficultyRank(value: string) {
  if (value === "easy") return 0;
  if (value === "normal") return 1;
  return 2;
}
