"use client";

import * as React from "react";
import {
  MaterialShapes,
  Morph,
  morphToPath,
  roundedPolygonToPath,
  type RoundedPolygon,
} from "material-shapes-ts";

import { cn } from "@/lib/utils";

export type MaterialShapeName =
  | "Circle"
  | "Square"
  | "Slanted"
  | "Arch"
  | "SemiCircle"
  | "Oval"
  | "Pill"
  | "Triangle"
  | "Arrow"
  | "Fan"
  | "Diamond"
  | "ClamShell"
  | "Pentagon"
  | "Gem"
  | "VerySunny"
  | "Sunny"
  | "Cookie4Sided"
  | "Cookie6Sided"
  | "Cookie7Sided"
  | "Cookie9Sided"
  | "Cookie12Sided"
  | "Clover4Leaf"
  | "Clover8Leaf"
  | "Burst"
  | "SoftBurst"
  | "Boom"
  | "SoftBoom"
  | "Flower"
  | "Puffy"
  | "PuffyDiamond"
  | "Ghostish"
  | "PixelCircle"
  | "PixelTriangle"
  | "Bun"
  | "Heart";

export const MATERIAL_SHAPE_NAMES: MaterialShapeName[] = [
  "Circle",
  "Square",
  "Slanted",
  "Arch",
  "SemiCircle",
  "Oval",
  "Pill",
  "Triangle",
  "Arrow",
  "Fan",
  "Diamond",
  "ClamShell",
  "Pentagon",
  "Gem",
  "VerySunny",
  "Sunny",
  "Cookie4Sided",
  "Cookie6Sided",
  "Cookie7Sided",
  "Cookie9Sided",
  "Cookie12Sided",
  "Clover4Leaf",
  "Clover8Leaf",
  "Burst",
  "SoftBurst",
  "Boom",
  "SoftBoom",
  "Flower",
  "Puffy",
  "PuffyDiamond",
  "Ghostish",
  "PixelCircle",
  "PixelTriangle",
  "Bun",
  "Heart",
];

export function getMaterialPolygon(name: MaterialShapeName): RoundedPolygon {
  const poly = (MaterialShapes as unknown as Record<string, RoundedPolygon>)[name];
  return poly ?? MaterialShapes.Circle;
}

// Path cache for static shapes
const pathCache = new Map<MaterialShapeName, string>();

export function getMaterialShapePath(name: MaterialShapeName): string {
  const cached = pathCache.get(name);
  if (cached) return cached;
  const poly = getMaterialPolygon(name);
  const path = roundedPolygonToPath(poly).toSvgPathData();
  pathCache.set(name, path);
  return path;
}

export type MaterialShapeProps = React.SVGProps<SVGSVGElement> & {
  name: MaterialShapeName;
  pathClassName?: string;
};

/**
 * Renders one of the 35 official Material Design 3 Expressive shapes as an SVG path.
 */
export function MaterialShape({
  name,
  className,
  pathClassName,
  ...props
}: MaterialShapeProps) {
  const d = React.useMemo(() => getMaterialShapePath(name), [name]);

  return (
    <svg
      viewBox="0 0 1 1"
      aria-hidden="true"
      className={cn("size-6 shrink-0 fill-current", className)}
      {...props}
    >
      <path d={d} className={pathClassName} />
    </svg>
  );
}

export type MorphingShapeProps = React.SVGProps<SVGSVGElement> & {
  from: MaterialShapeName;
  to: MaterialShapeName;
  /** Progress between 0 (start shape) and 1 (end shape) */
  progress: number;
  pathClassName?: string;
};

/**
 * Renders an animated or controlled morph between two Material 3 shapes at a given progress (0..1).
 */
export function MorphingShape({
  from,
  to,
  progress,
  className,
  pathClassName,
  ...props
}: MorphingShapeProps) {
  const morph = React.useMemo(() => {
    const polyFrom = getMaterialPolygon(from);
    const polyTo = getMaterialPolygon(to);
    return new Morph(polyFrom, polyTo);
  }, [from, to]);

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const d = React.useMemo(() => {
    return morphToPath(morph, clampedProgress).toSvgPathData();
  }, [morph, clampedProgress]);

  return (
    <svg
      viewBox="0 0 1 1"
      aria-hidden="true"
      className={cn("size-6 shrink-0 fill-current", className)}
      {...props}
    >
      <path d={d} className={pathClassName} />
    </svg>
  );
}

export type InteractiveMorphShapeProps = {
  from: MaterialShapeName;
  to: MaterialShapeName;
  duration?: number;
  className?: string;
  autoPlay?: boolean;
};

/**
 * Interactive shape that fluidly morphs on hover, active press, or continuous loop.
 */
export function InteractiveMorphShape({
  from,
  to,
  duration = 600,
  className,
  autoPlay = false,
}: InteractiveMorphShapeProps) {
  const [progress, setProgress] = React.useState<number>(0);
  const [isHovered, setIsHovered] = React.useState<boolean>(false);
  const animRef = React.useRef<number | null>(null);
  const startTimeRef = React.useRef<number | null>(null);

  const morph = React.useMemo(() => {
    const polyFrom = getMaterialPolygon(from);
    const polyTo = getMaterialPolygon(to);
    return new Morph(polyFrom, polyTo);
  }, [from, to]);

  React.useEffect(() => {
    if (!autoPlay) return;

    let forward = true;
    let localStart: number | null = null;

    const tick = (t: number) => {
      if (localStart === null) localStart = t;
      const elapsed = t - localStart;
      const p = Math.min(1, elapsed / duration);

      // Smooth sine curve for looping
      const curve = (1 - Math.cos(p * Math.PI)) / 2;
      setProgress(forward ? curve : 1 - curve);

      if (p >= 1) {
        localStart = t;
        forward = !forward;
      }
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [autoPlay, duration]);

  const progressRef = React.useRef<number>(0);
  progressRef.current = progress;

  // Hover driven transition
  React.useEffect(() => {
    if (autoPlay) return;

    const startProgress = progressRef.current;
    const targetProgress = isHovered ? 1 : 0;
    if (startProgress === targetProgress) return;

    startTimeRef.current = null;

    const tick = (t: number) => {
      if (startTimeRef.current === null) startTimeRef.current = t;
      const elapsed = t - startTimeRef.current;
      const linearP = Math.min(1, elapsed / duration);
      // M3 spatial curve approximation
      const ease = (1 - Math.cos(linearP * Math.PI)) / 2;
      const current = startProgress + (targetProgress - startProgress) * ease;
      setProgress(current);

      if (linearP < 1) {
        animRef.current = requestAnimationFrame(tick);
      }
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isHovered, autoPlay, duration]);

  const d = morphToPath(morph, progress).toSvgPathData();

  return (
    <svg
      viewBox="0 0 1 1"
      aria-hidden="true"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "size-12 cursor-pointer fill-primary transition-transform active:scale-95",
        className
      )}
    >
      <path d={d} />
    </svg>
  );
}

export type ShapedContainerProps = React.ComponentProps<"div"> & {
  shape: MaterialShapeName;
  clipId?: string;
};

/**
 * Clips any arbitrary DOM content (images, cards, surfaces) into one of the 35 Material 3 Expressive shapes.
 */
export function ShapedContainer({
  shape,
  clipId,
  className,
  children,
  ...props
}: ShapedContainerProps) {
  const generatedId = React.useId();
  const id = clipId ?? `m3-shape-clip-${generatedId.replace(/[:]/g, "")}`;
  const d = React.useMemo(() => getMaterialShapePath(shape), [shape]);

  return (
    <>
      <svg width="0" height="0" className="sr-only" aria-hidden="true">
        <defs>
          <clipPath id={id} clipPathUnits="objectBoundingBox">
            <path d={d} />
          </clipPath>
        </defs>
      </svg>
      <div
        className={cn("relative overflow-hidden", className)}
        style={{ clipPath: `url(#${id})` }}
        {...props}
      >
        {children}
      </div>
    </>
  );
}
