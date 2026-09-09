/**
 * Archive skeleton. Shaped like the index it replaces — a date block in the
 * margin, a title bar and two lines of excerpt — so the page does not jump
 * when the real rows arrive.
 *
 * No nav or footer: both are server-rendered from config with no data of their
 * own, so they are already on screen. A skeleton that redraws them would
 * flicker the one part of the page that never had to wait.
 */
export default function Loading() {
  return (
    <div className="sm-skeleton-page" aria-hidden>
      <div className="sm-section-tall sm-shell">
        <div className="sm-opener">
          <div className="sm-opener-kicker">
            <span className="sm-sk" style={{ width: "5rem", height: "0.6875rem" }} />
          </div>
          <div className="sm-opener-title flex flex-col gap-4">
            <span className="sm-sk" style={{ width: "70%", height: "3.25rem" }} />
          </div>
          <div className="sm-opener-lead flex flex-col gap-2">
            <span className="sm-sk" style={{ width: "100%", height: "1rem" }} />
            <span className="sm-sk" style={{ width: "82%", height: "1rem" }} />
          </div>
        </div>

        <div className="sm-archive" style={{ marginTop: "3.5rem" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="sm-archive-item">
              <span className="sm-sk" style={{ width: "6rem", height: "0.6875rem" }} />
              <div className="sm-archive-body">
                <span className="sm-sk" style={{ width: "58%", height: "1.75rem" }} />
                <span className="sm-sk" style={{ width: "100%", height: "0.875rem" }} />
                <span className="sm-sk" style={{ width: "76%", height: "0.875rem" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
