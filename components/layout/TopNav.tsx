"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Clapperboard, LayoutDashboard, Library, Plus, Sparkles } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/templates", label: "Templates", icon: Library },
  { href: "/video-to-playable", label: "Video", icon: Clapperboard },
  { href: "/ai-builder", label: "AI Builder", icon: Bot }
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-blue-100 bg-blue-600 text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)]">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-black tracking-normal text-slate-950">
              Playable Ads Studio
            </span>
            <span className="block truncate text-xs font-medium text-slate-500">
              Local UA playable builder
            </span>
          </span>
        </Link>

        <nav className="hidden items-center rounded-lg border border-slate-200 bg-slate-50 p-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold transition ${
                  active
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-slate-950"
                }`}
              >
                <Icon className="size-4" aria-hidden />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/templates"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(37,99,235,0.2)] transition hover:bg-blue-700"
          >
            <Plus className="size-4" aria-hidden />
            <span className="hidden sm:inline">New Playable</span>
          </Link>
        </div>
      </div>
      <nav className="scrollbar-soft mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 pb-3 md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-md border px-3 text-xs font-bold transition ${
                active
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <Icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
