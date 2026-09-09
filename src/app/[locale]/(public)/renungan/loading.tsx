/**
 * Archive skeleton. Mirrors the real page's masthead-plus-list shape so the
 * layout does not jump when the content arrives.
 */
export default function DevotionalArchiveLoading() {
  return (
    <main className="flex min-h-dvh flex-col bg-lp-paper">
      <div className="h-[65px] border-b border-lp-rule" />
      <div className="mx-auto w-full max-w-320 px-6 py-20 sm:px-10 sm:py-28 lg:px-14 lg:py-32">
        <div className="grid gap-x-10 gap-y-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <div className="h-3 w-24 animate-pulse rounded bg-lp-rule" />
          </div>
          <div className="lg:col-span-9">
            <div className="h-12 w-4/5 animate-pulse rounded bg-lp-rule sm:h-16" />
            <div className="mt-4 h-12 w-2/5 animate-pulse rounded bg-lp-rule sm:h-16" />
            <div className="mt-7 h-4 w-full max-w-xl animate-pulse rounded bg-lp-rule" />
            <div className="mt-2.5 h-4 w-3/4 max-w-xl animate-pulse rounded bg-lp-rule" />
          </div>
        </div>

        <div className="mt-14 border-t border-lp-ink sm:mt-20">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex gap-5 border-b border-lp-rule py-7 sm:gap-8 sm:py-8">
              <div className="w-20 shrink-0 sm:w-24">
                <div className="h-7 w-12 animate-pulse rounded bg-lp-rule" />
                <div className="mt-2 h-2.5 w-16 animate-pulse rounded bg-lp-rule" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="h-2.5 w-24 animate-pulse rounded bg-lp-rule" />
                <div className="mt-3 h-6 w-2/3 animate-pulse rounded bg-lp-rule" />
                <div className="mt-3.5 h-3.5 w-full max-w-2xl animate-pulse rounded bg-lp-rule" />
                <div className="mt-4 h-3 w-40 animate-pulse rounded bg-lp-rule" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
