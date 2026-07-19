export default function Header({
  title,
  onToggleSidebar,
}: {
  title: string;
  /** Called when the hamburger button is clicked — only rendered below `md`. */
  onToggleSidebar?: () => void;
}) {
  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* Hamburger — visible only on mobile */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Toggle sidebar"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}

        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      </div>
    </header>
  );
}
