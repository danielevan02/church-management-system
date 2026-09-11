export default function Loading() {
  return (
    <div
      className="min-h-screen w-full bg-[#161210] text-[#EDE6D9] flex flex-col justify-between overflow-hidden"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading...</span>

      {/* Navigation Bar Skeleton matching LandingNav */}
      <header className="w-full px-[clamp(1.25rem,4.5vw,4.5rem)] py-6 flex items-center justify-between border-b border-[#EDE6D9]/10 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#EDE6D9]/15" />
          <div className="flex flex-col gap-1.5">
            <div className="h-3.5 w-36 rounded bg-[#EDE6D9]/20" />
            <div className="h-3 w-24 rounded bg-[#EDE6D9]/10" />
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="h-3 w-16 rounded bg-[#EDE6D9]/10" />
          <div className="h-3 w-16 rounded bg-[#EDE6D9]/10" />
          <div className="h-3 w-16 rounded bg-[#EDE6D9]/10" />
          <div className="h-8 w-24 rounded-full bg-[#EDE6D9]/15" />
        </div>
      </header>

      {/* Hero Content Skeleton matching HeroSanctuary Stage */}
      <main className="w-full max-w-7xl mx-auto px-[clamp(1.25rem,4.5vw,4.5rem)] py-12 sm:py-20 flex flex-col justify-center flex-1 gap-12 sm:gap-16 animate-pulse">
        {/* Row 1: Left-aligned Display Headline + Right-aligned Nav */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="flex flex-col gap-3 sm:gap-4 max-w-3xl">
            <div className="h-[clamp(2.75rem,6vw,5.5rem)] w-4/5 rounded-lg bg-[#EDE6D9]/20" />
            <div className="h-[clamp(2.75rem,6vw,5.5rem)] w-3/5 rounded-lg bg-[#EDE6D9]/20" />
          </div>

          <div className="hidden lg:flex flex-col gap-4 min-w-[12rem] pb-2">
            <div className="h-4 w-28 rounded bg-[#EDE6D9]/15" />
            <div className="h-4 w-24 rounded bg-[#EDE6D9]/15" />
            <div className="h-4 w-32 rounded bg-[#EDE6D9]/15" />
            <div className="h-4 w-28 rounded bg-[#EDE6D9]/15" />
          </div>
        </div>

        {/* Row 2: Subtitle & Action Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-4 border-t border-[#EDE6D9]/10">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="h-4 w-full rounded bg-[#EDE6D9]/10" />
            <div className="h-4 w-3/4 rounded bg-[#EDE6D9]/10" />
          </div>
          <div className="h-10 w-36 rounded-full bg-[#EDE6D9]/15 shrink-0" />
        </div>
      </main>

      {/* Bottom Minimal Scrim */}
      <footer className="w-full px-[clamp(1.25rem,4.5vw,4.5rem)] py-4 flex items-center justify-between text-xs text-[#EDE6D9]/20 border-t border-[#EDE6D9]/5">
        <div className="h-3 w-28 rounded bg-[#EDE6D9]/5" />
        <div className="h-3 w-20 rounded bg-[#EDE6D9]/5" />
      </footer>
    </div>
  );
}
