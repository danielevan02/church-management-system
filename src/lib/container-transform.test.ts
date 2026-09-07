import { describe, expect, it } from "vitest";

import {
  calculateContainerDelta,
  getInvertedTransformStyle,
  type Rect,
} from "./container-transform";

describe("calculateContainerDelta", () => {
  it("computes exact translation and scale when expanding a card into a dialog", () => {
    const cardRect: Rect = { left: 100, top: 150, width: 300, height: 200 };
    const dialogRect: Rect = { left: 50, top: 50, width: 600, height: 400 };

    const delta = calculateContainerDelta(cardRect, dialogRect);

    // dx: 100 - 50 = 50
    // dy: 150 - 50 = 100
    // sx: 300 / 600 = 0.5
    // sy: 200 / 400 = 0.5
    expect(delta.dx).toBe(50);
    expect(delta.dy).toBe(100);
    expect(delta.sx).toBe(0.5);
    expect(delta.sy).toBe(0.5);
  });

  it("handles identical bounds as identity transform", () => {
    const rect: Rect = { left: 100, top: 100, width: 400, height: 300 };
    const delta = calculateContainerDelta(rect, rect);

    expect(delta.dx).toBe(0);
    expect(delta.dy).toBe(0);
    expect(delta.sx).toBe(1);
    expect(delta.sy).toBe(1);
  });

  it("safely handles zero-dimension destination rects without division by zero", () => {
    const origin: Rect = { left: 20, top: 20, width: 100, height: 100 };
    const invalidDest: Rect = { left: 0, top: 0, width: 0, height: 0 };

    const delta = calculateContainerDelta(origin, invalidDest);
    expect(delta.sx).toBe(1);
    expect(delta.sy).toBe(1);
    expect(delta.dx).toBe(0);
    expect(delta.dy).toBe(0);
  });

  it("formats CSS inverted transform string properly", () => {
    const delta = { dx: 45.5, dy: 80.2, sx: 0.75, sy: 0.5 };
    const style = getInvertedTransformStyle(delta);
    expect(style).toBe("translate(45.5px, 80.2px) scale(0.75, 0.5)");
  });
});
