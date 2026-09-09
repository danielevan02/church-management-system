/**
 * Writes `data-motion` on `.sm-root` during HTML parsing, before the first
 * paint, so the CSS in `styles/landing/index.css` knows whether to hold
 * elements in their pre-reveal state.
 *
 * This has to be a parse-blocking inline script rather than an effect. React
 * hydrates *after* the browser paints, so setting the hidden state from
 * `useEffect` — or even `useLayoutEffect` — shows one frame of the fully
 * resolved page and then yanks it back, which on a page this typographic is
 * the most visible bug on it.
 *
 * It is also the no-JavaScript guarantee: if the script never runs, the
 * attribute is never written and every reveal target stays visible.
 */
export function MotionGate() {
  return (
    <script
      // Not user input, and not interpolated from any: a constant string.
      dangerouslySetInnerHTML={{
        __html:
          "(function(){try{var r=document.currentScript&&document.currentScript.parentElement" +
          "||document.getElementById('sm-root');if(!r)return;" +
          "var q=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;" +
          "r.setAttribute('data-motion',q?'off':'on')}catch(e){}})()",
      }}
    />
  );
}
