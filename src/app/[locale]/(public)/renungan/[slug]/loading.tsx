/**
 * Article skeleton, in the same three-part shape as the devotional itself:
 * metadata in the liturgical margin, headline and body in the narrative
 * column. The body block is measured in `ch` rather than percentages so the
 * placeholder lines break where real prose would.
 */
export default function Loading() {
  return (
    <div className="sm-skeleton-page" aria-hidden>
      <div className="sm-section-tall sm-shell">
        <div className="sm-article">
          <div className="sm-article-meta">
            <span className="sm-sk" style={{ width: "8rem", height: "0.875rem" }} />
            <span
              className="sm-sk"
              style={{ width: "5rem", height: "0.6875rem", marginTop: "1rem" }}
            />
            <span className="sm-sk" style={{ width: "9rem", height: "1.25rem" }} />
          </div>

          <div className="sm-article-main">
            <div className="flex flex-col gap-3">
              <span className="sm-sk" style={{ width: "90%", height: "3rem" }} />
              <span className="sm-sk" style={{ width: "62%", height: "3rem" }} />
            </div>
            <div className="sm-verse flex flex-col gap-2">
              <span className="sm-sk" style={{ width: "7rem", height: "0.6875rem" }} />
              <span className="sm-sk" style={{ width: "80%", height: "1.25rem" }} />
            </div>
            <div className="flex max-w-[68ch] flex-col gap-3">
              {["100%", "97%", "99%", "88%", "100%", "94%", "71%"].map((w, i) => (
                <span key={i} className="sm-sk" style={{ width: w, height: "1rem" }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
