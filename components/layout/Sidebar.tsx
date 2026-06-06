export function Sidebar({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <aside className="studio-panel scrollbar-soft h-full overflow-auto rounded-lg p-4">
      {children}
    </aside>
  );
}
