import { describe, expect, it } from "vitest";

import {
  calculateCenteredTargetRect,
  calculateContainerDelta,
  getInvertedTransformStyle,
  type Rect,
} from "./container-transform";

describe("calculateContainerDelta", () => {
  it("computes exact translation and scale when expanding a card into a dialog", () => {
    const cardRect: Rect = { left: 100, top: 150, width: 300, height: 200 };
    const dialogRect: Rect = { left: 50, top: 50, width: 600, height: 400 };

    const delta = calculateContainerDelta(cardRect, dialogRect);

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

describe("calculateCenteredTargetRect", () => {
  it("calculates perfectly centered bounds within viewport", () => {
    const viewport = { width: 1200, height: 800 };
    const contentHeight = 400;

    const target = calculateCenteredTargetRect(viewport, contentHeight, 600, 16);

    // width: min(1200 - 32, 600) = 600
    // left: (1200 - 600) / 2 = 300
    // height: min(800 - 32, 400) = 400
    // top: (800 - 400) / 2 = 200
    expect(target.width).toBe(600);
    expect(target.left).toBe(300);
    expect(target.height).toBe(400);
    expect(target.top).toBe(200);
  });

  it("clamps to viewport minus padding on smaller screens", () => {
    const mobileViewport = { width: 360, height: 600 };
    const contentHeight = 500;

    const target = calculateCenteredTargetRect(mobileViewport, contentHeight, 600, 16);

    // width: 360 - 32 = 328
    // left: (360 - 328) / 2 = 16
    expect(target.width).toBe(328);
    expect(target.left).toBe(16);
    expect(target.height).toBe(500);
    expect(target.top).toBe(50);
  });
});
