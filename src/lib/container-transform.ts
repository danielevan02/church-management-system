/**
 * Pure helper functions for M3 Container Transform calculations.
 *
 * Used by `<M3ContainerTransform>` to compute spatial bounding boxes,
 * centering calculations, and FLIP delta matrices when morphing
 * a container directly from its position on the page to the center.
 */

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Dimensions {
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
 * the destination container back to the origin container's bounding box.
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

/**
 * Calculates the centered dialog bounds for the expanded surface
 * based on viewport dimensions and target content height.
 */
export function calculateCenteredTargetRect(
  viewport: Dimensions,
  contentHeight: number,
  maxWidth = 640,
  padding = 16
): Rect {
  const width = Math.max(280, Math.min(viewport.width - padding * 2, maxWidth));
  const left = Math.round((viewport.width - width) / 2);
  const height = Math.max(100, Math.min(viewport.height - padding * 2, contentHeight));
  const top = Math.round(Math.max(padding, (viewport.height - height) / 2));

  return { left, top, width, height };
}
