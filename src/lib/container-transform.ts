/**
 * Pure helper functions for M3 Container Transform calculations.
 *
 * Used by `<M3ContainerTransform>` to compute FLIP (First, Last, Invert, Play)
 * delta matrices when transforming a compact container (e.g. Card, FAB)
 * into an expanded surface (e.g. Dialog, Details View).
 */

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ContainerTransformDelta {
  dx: number;
  dy: number;
  sx: number;
  sy: number;
}

/**
 * Calculates translation (dx, dy) and scale (sx, sy) needed to transform
 * the destination container back to the origin container's bounding box
 * when using `transform-origin: 0 0`.
 */
export function calculateContainerDelta(
  origin: Rect,
  destination: Rect
): ContainerTransformDelta {
  if (destination.width <= 0 || destination.height <= 0) {
    return { dx: 0, dy: 0, sx: 1, sy: 1 };
  }

  const sx = origin.width / destination.width;
  const sy = origin.height / destination.height;
  const dx = origin.left - destination.left;
  const dy = origin.top - destination.top;

  return {
    dx: Math.round(dx * 100) / 100,
    dy: Math.round(dy * 100) / 100,
    sx: Math.round(sx * 1000) / 1000,
    sy: Math.round(sy * 1000) / 1000,
  };
}

/**
 * Generates the CSS transform string for the inverted state.
 */
export function getInvertedTransformStyle(delta: ContainerTransformDelta): string {
  return `translate(${delta.dx}px, ${delta.dy}px) scale(${delta.sx}, ${delta.sy})`;
}
