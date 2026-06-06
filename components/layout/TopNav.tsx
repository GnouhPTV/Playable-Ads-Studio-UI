"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Clapperboard, LayoutDashboard, Library, Sparkles } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/templates", label: "Templates", icon: Library },
  { href: "/video-to-playable", label: "Video", icon: Clapperboard },
  { href: "/ai-builder", label: "AI Builder", icon: Bot }
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white/86 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-md border border-sky-200 bg-sky-50 shadow-glow">
            <Sparkles className="size-5 text-studio-cyan" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-black uppercase tracking-normal text-slate-950">
              Playable Ads Studio
            </span>
            <span className="block truncate text-xs text-slate-500">
              Local UA playable builder
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                  active
                    ? "border-sky-200 bg-sky-50 text-sky-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:text-sky-700"
                }`}
              >
                <Icon className="size-4" aria-hidden />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
