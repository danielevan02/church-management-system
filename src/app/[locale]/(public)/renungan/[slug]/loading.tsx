/**
 * Article skeleton — the rail, the headline, the pull-quote and a few
 * paragraphs, in the same grid the real page uses.
 */
export default function PublicDevotionalLoading() {
  return (
    <main className="flex min-h-dvh flex-col bg-lp-paper">
      <div className="h-[65px] border-b border-lp-rule" />
      <div className="mx-auto w-full max-w-320 px-6 py-16 sm:px-10 sm:py-24 lg:px-14 lg:py-28">
        <div className="h-4 w-36 animate-pulse rounded bg-lp-rule" />

        <div className="mt-10 grid gap-x-10 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <div className="border-b border-lp-rule pb-3">
              <div className="h-3 w-28 animate-pulse rounded bg-lp-rule" />
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="h-10 w-full animate-pulse rounded bg-lp-rule sm:h-12" />
            <div className="mt-3 h-10 w-3/5 animate-pulse rounded bg-lp-rule sm:h-12" />

            <div className="mt-10 border-l-2 border-lp-rule-firm bg-lp-sand py-6 pr-6 pl-6 sm:pl-8">
              <div className="h-6 w-full animate-pulse rounded bg-lp-rule" />
              <div className="mt-3 h-6 w-4/5 animate-pulse rounded bg-lp-rule" />
              <div className="mt-5 h-3 w-24 animate-pulse rounded bg-lp-rule" />
            </div>

            <div className="mt-10 space-y-3.5">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-4 animate-pulse rounded bg-lp-rule"
                  style={{ width: `${[100, 96, 88, 100, 72, 94, 60][i]}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
