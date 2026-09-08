"use client";

import * as React from "react";
import {
  Check,
  Copy,
  Pause,
  Play,
  Sparkles,
  Zap,
} from "lucide-react";
import { Morph, morphToPath, Easings } from "material-shapes-ts";

import { Button } from "@/components/ui/button";
import {
  MaterialShape,
  MATERIAL_SHAPE_NAMES,
  getMaterialPolygon,
  ShapedContainer,
  type MaterialShapeName,
} from "@/components/m3/material-shape";
import { cn } from "@/lib/utils";

// Category groupings for the 35 shapes
const SHAPE_CATEGORIES: {
  id: string;
  name: string;
  shapes: MaterialShapeName[];
}[] = [
  {
    id: "organic",
    name: "Organic & Floral",
    shapes: [
      "Flower",
      "Clover4Leaf",
      "Clover8Leaf",
      "Heart",
      "ClamShell",
      "Fan",
      "Bun",
    ],
  },
  {
    id: "expressive",
    name: "Expressive & Stars",
    shapes: [
      "Sunny",
      "VerySunny",
      "Burst",
      "SoftBurst",
      "Boom",
      "SoftBoom",
      "Cookie4Sided",
      "Cookie6Sided",
      "Cookie7Sided",
      "Cookie9Sided",
      "Cookie12Sided",
      "Puffy",
      "PuffyDiamond",
      "Ghostish",
    ],
  },
  {
    id: "geometric",
    name: "Geometric & Architectural",
    shapes: [
      "Circle",
      "Square",
      "Arch",
      "Pill",
      "Oval",
      "SemiCircle",
      "Slanted",
      "Triangle",
      "Diamond",
      "Pentagon",
      "Gem",
      "PixelCircle",
      "PixelTriangle",
      "Arrow",
    ],
  },
];

const cssRadiusScale = [
  { token: "rounded-none", name: "None", size: "0px", class: "rounded-none", desc: "Full-bleed surfaces, divider" },
  { token: "rounded-xs", name: "Extra Small", size: "4px", class: "rounded-xs", desc: "Chips, checkboxes, snackbars" },
  { token: "rounded-sm", name: "Small", size: "8px", class: "rounded-sm", desc: "Segmented buttons, text fields" },
  { token: "rounded-md", name: "Medium", size: "12px", class: "rounded-md", desc: "Cards, menus, dropdowns (M3 workhorse)" },
  { token: "rounded-lg", name: "Large", size: "16px", class: "rounded-lg", desc: "Large cards, sheets, nav drawer" },
  { token: "rounded-xl", name: "Extra Large", size: "28px", class: "rounded-xl", desc: "Dialogs, standard 56dp FAB" },
  { token: "rounded-2xl", name: "2X Large", size: "36px", class: "rounded-2xl", desc: "Large FAB (96dp)" },
  { token: "rounded-3xl", name: "3X Large", size: "48px", class: "rounded-3xl", desc: "Hero banners, expressive blocks" },
  { token: "rounded-full", name: "Full", size: "9999px", class: "rounded-full", desc: "Pill buttons, badges, avatars" },
];

export function ShapePreview() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  
  // Interactive morpher state
  const [fromShape, setFromShape] = React.useState<MaterialShapeName>("Circle");
  const [toShape, setToShape] = React.useState<MaterialShapeName>("Flower");
  const [morphProgress, setMorphProgress] = React.useState<number>(0);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(true);
  const [isSlowMo, setIsSlowMo] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<"studio" | "library" | "scale">("studio");
  const [copied, setCopied] = React.useState<boolean>(false);

  // Filtered shape list
  const displayShapes = React.useMemo(() => {
    if (selectedCategory === "all") return MATERIAL_SHAPE_NAMES;
    const cat = SHAPE_CATEGORIES.find((c) => c.id === selectedCategory);
    return cat ? cat.shapes : MATERIAL_SHAPE_NAMES;
  }, [selectedCategory]);

  // Morph object memoization
  const morph = React.useMemo(() => {
    try {
      const polyFrom = getMaterialPolygon(fromShape);
      const polyTo = getMaterialPolygon(toShape);
      return new Morph(polyFrom, polyTo);
    } catch {
      return null;
    }
  }, [fromShape, toShape]);

  // Current interpolated SVG path data
  const currentPathData = React.useMemo(() => {
    if (!morph) return "";
    try {
      return morphToPath(morph, morphProgress).toSvgPathData();
    } catch {
      return "";
    }
  }, [morph, morphProgress]);

  // Animation loop when playing
  React.useEffect(() => {
    if (!isPlaying || !morph) return;

    let forward = true;
    let startTime: number | null = null;
    let animId: number;
    const duration = isSlowMo ? 1800 : 700;

    const tick = (time: number) => {
      if (startTime === null) startTime = time;
      const elapsed = time - startTime;
      const linearP = Math.min(1, elapsed / duration);
      
      // Use Material 3 standard easing curve for fluid motion
      const easedP = Easings.standard(linearP);
      setMorphProgress(forward ? easedP : 1 - easedP);

      if (linearP >= 1) {
        startTime = time;
        forward = !forward;
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, morph, isSlowMo]);

  const handleCopySvg = () => {
    if (!currentPathData) return;
    const svgCode = `<svg viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg">\n  <path d="${currentPathData}" fill="currentColor" />\n</svg>`;
    navigator.clipboard.writeText(svgCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Overview Intro Banner */}
      <div className="rounded-3xl border border-primary/20 bg-linear-to-br from-primary/10 via-surface-container-high to-surface-container p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              <span>Material Design 3 Expressive Shape Engine</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface sm:text-2xl">
              Perpustakaan 35 Bentuk &amp; Fluid Vector Morphing
            </h3>
            <p className="max-w-2xl text-xs text-on-surface-variant sm:text-sm">
              Material 3 tidak hanya menggunakan kotak bersudut tumpul (<em>border-radius</em>),
              melainkan memiliki <strong>35 bentuk poligon organik</strong> (Bunga, Semanggi/Clover,
              Kubah/Arch, Bintang/Burst, Matahari/Sunny, Hati, dll.) yang bertransisi secara mulus
              lewat algoritma interpolasi kurva kontinu (<em>AndroidX Graphics Shapes</em>).
            </p>
          </div>

          {/* Navigation Pill Switcher */}
          <div className="flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-highest p-1 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("studio")}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                activeTab === "studio"
                  ? "bg-primary text-on-primary shadow-level-1"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Morph Studio
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("library")}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                activeTab === "library"
                  ? "bg-primary text-on-primary shadow-level-1"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              35 Shapes Library
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("scale")}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                activeTab === "scale"
                  ? "bg-primary text-on-primary shadow-level-1"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              CSS Radius Scale
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: FLUID SHAPE MORPH STUDIO */}
      {activeTab === "studio" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-outline-variant bg-surface-container-low p-5 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-outline-variant/60 pb-5">
              <div>
                <h4 className="text-title-lg font-bold text-on-surface">
                  Fluid Vector Morphing Studio
                </h4>
                <p className="text-xs text-on-surface-variant sm:text-sm">
                  Pilih bentuk asal dan bentuk tujuan. Transisi dihitung langsung
                  menggunakan interpolasi titik kurva Bézier tingkat tinggi tanpa glitch.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={isSlowMo ? "tonal" : "outlined"}
                  size="xs"
                  onClick={() => setIsSlowMo(!isSlowMo)}
                  className="gap-1.5"
                >
                  <Zap className={cn("size-3.5", isSlowMo && "text-primary fill-primary")} />
                  <span>Slow-Mo: {isSlowMo ? "1.8s" : "0.7s"}</span>
                </Button>

                <Button
                  variant="filled"
                  size="xs"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="gap-1.5"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="size-3.5" />
                      <span>Jeda Animasi</span>
                    </>
                  ) : (
                    <>
                      <Play className="size-3.5" />
                      <span>Putar Animasi</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Main Stage Grid */}
            <div className="grid gap-8 pt-6 lg:grid-cols-12 items-center">
              {/* Left: Shape Selectors */}
              <div className="lg:col-span-4 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                    Bentuk Asal (Start Shape)
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto rounded-2xl border border-outline-variant bg-surface-container p-2">
                    {[
                      "Circle",
                      "Square",
                      "Pill",
                      "Arch",
                      "Heart",
                      "Clover4Leaf",
                      "Flower",
                      "Sunny",
                      "Burst",
                      "Gem",
                    ].map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setFromShape(name as MaterialShapeName);
                          setIsPlaying(false);
                          setMorphProgress(0);
                        }}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                          fromShape === name
                            ? "bg-primary text-on-primary shadow-xs"
                            : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                        )}
                      >
                        <MaterialShape name={name as MaterialShapeName} className="size-3.5" />
                        <span>{name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                    Bentuk Tujuan (End Shape)
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto rounded-2xl border border-outline-variant bg-surface-container p-2">
                    {[
                      "Flower",
                      "Clover8Leaf",
                      "Sunny",
                      "VerySunny",
                      "Burst",
                      "Boom",
                      "Cookie9Sided",
                      "Puffy",
                      "Heart",
                      "Arch",
                    ].map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setToShape(name as MaterialShapeName);
                          setIsPlaying(false);
                          setMorphProgress(1);
                        }}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                          toShape === name
                            ? "bg-secondary-container text-on-secondary-container shadow-xs"
                            : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                        )}
                      >
                        <MaterialShape name={name as MaterialShapeName} className="size-3.5" />
                        <span>{name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-on-surface-variant uppercase">
                    Kombinasi Populer M3:
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {[
                      { from: "Circle", to: "Flower", label: "Lingkaran ⇄ Bunga" },
                      { from: "Pill", to: "Clover4Leaf", label: "Pill ⇄ Semanggi" },
                      { from: "Square", to: "Sunny", label: "Kotak ⇄ Matahari" },
                      { from: "Arch", to: "Heart", label: "Kubah ⇄ Hati" },
                      { from: "Clover4Leaf", to: "Burst", label: "Semanggi ⇄ Bintang" },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setFromShape(preset.from as MaterialShapeName);
                          setToShape(preset.to as MaterialShapeName);
                          setIsPlaying(true);
                        }}
                        className="rounded-full border border-outline-variant/80 bg-surface-container px-2.5 py-1 text-[11px] font-medium text-on-surface-variant hover:border-primary hover:text-primary transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center: Live Morphing Stage */}
              <div className="lg:col-span-8 flex flex-col items-center justify-center gap-6 rounded-2xl border border-outline-variant/60 bg-surface-container p-6 sm:p-10">
                <div className="relative flex size-56 sm:size-72 items-center justify-center rounded-3xl bg-surface-container-lowest shadow-level-1 border border-outline-variant/40 p-4">
                  {/* Outer subtle decorative ring */}
                  <div className="absolute inset-4 rounded-full border border-dashed border-outline-variant/30 pointer-events-none" />

                  {/* Morphing SVG Graphic */}
                  {currentPathData ? (
                    <svg
                      viewBox="0 0 1 1"
                      className="size-48 sm:size-60 text-primary drop-shadow-md transition-transform duration-75"
                    >
                      <path
                        d={currentPathData}
                        fill="currentColor"
                        className="transition-colors duration-200"
                      />
                    </svg>
                  ) : (
                    <div className="text-xs text-on-surface-variant">Memuat bentuk…</div>
                  )}

                  {/* Live Progress Tag */}
                  <div className="absolute bottom-3 right-3 rounded-full bg-surface-container-high/90 px-3 py-1 text-[11px] font-mono font-semibold text-primary backdrop-blur-xs">
                    {Math.round(morphProgress * 100)}%
                  </div>
                </div>

                {/* Scrubber Slider */}
                <div className="w-full max-w-md space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-primary">
                      <MaterialShape name={fromShape} className="size-4" />
                      {fromShape} (0%)
                    </span>
                    <span className="flex items-center gap-1.5 text-secondary">
                      <MaterialShape name={toShape} className="size-4" />
                      {toShape} (100%)
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.005"
                    value={morphProgress}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setMorphProgress(Number(e.target.value));
                    }}
                    className="w-full accent-primary cursor-pointer h-2 bg-surface-container-highest rounded-lg"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-on-surface-variant">
                      Geser manual untuk melihat kurva Bézier bertransformasi secara presisi.
                    </p>
                    <button
                      type="button"
                      onClick={handleCopySvg}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                    >
                      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                      <span>{copied ? "Tersalin!" : "Salin SVG"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real Component Demonstrations using Morphing & Shaped Containers */}
          <div className="space-y-4">
            <h4 className="text-title-lg font-bold text-on-surface">
              Penerapan Nyata dalam Komponen Aplikasi
            </h4>
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Demo 1: Church Vault / Arch Banner */}
              <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    Arsitektur Gereja (Arch)
                  </span>
                  <MaterialShape name="Arch" className="size-5 text-primary" />
                </div>
                <ShapedContainer shape="Arch" className="h-32 w-full bg-linear-to-b from-primary/25 via-secondary-container to-surface-container-high flex items-center justify-center">
                  <div className="text-center p-3">
                    <p className="text-title-sm font-bold text-primary">Sanctuary Vault</p>
                    <p className="text-[11px] text-on-surface-variant">Bentuk kubah arsitektural M3</p>
                  </div>
                </ShapedContainer>
                <p className="text-xs text-on-surface-variant">
                  Elemen kontainer dipotong (<em>clipped</em>) sempurna mengikuti siluet kubah gereja.
                </p>
              </div>

              {/* Demo 2: Sunday Morning Flower Badge */}
              <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                    Ibadah Raya (Flower / Sunny)
                  </span>
                  <MaterialShape name="Flower" className="size-5 text-secondary" />
                </div>
                <div className="flex h-32 w-full items-center justify-center gap-4 bg-surface-container rounded-xl">
                  <ShapedContainer shape="Flower" className="size-20 bg-primary flex items-center justify-center text-on-primary shadow-level-1">
                    <span className="text-sm font-extrabold">09:00</span>
                  </ShapedContainer>
                  <ShapedContainer shape="Sunny" className="size-20 bg-tertiary-container flex items-center justify-center text-on-tertiary-container shadow-level-1">
                    <span className="text-sm font-extrabold">17:00</span>
                  </ShapedContainer>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Badge waktu kebaktian menggunakan bentuk kelopak bunga dan matahari cerah.
                </p>
              </div>

              {/* Demo 3: Doa & Pelayanan (Heart & Clover) */}
              <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-tertiary uppercase tracking-wider">
                    Pelayanan Kasih (Heart / Clover)
                  </span>
                  <MaterialShape name="Heart" className="size-5 text-tertiary" />
                </div>
                <div className="flex h-32 w-full items-center justify-center gap-4 bg-surface-container rounded-xl">
                  <ShapedContainer shape="Heart" className="size-20 bg-error-container text-on-error-container flex items-center justify-center shadow-level-1">
                    <span className="text-xs font-bold">Doa</span>
                  </ShapedContainer>
                  <ShapedContainer shape="Clover4Leaf" className="size-20 bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-level-1">
                    <span className="text-xs font-bold">Komsel</span>
                  </ShapedContainer>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Kategori permohonan doa dan komunitas sel dengan bentuk hati dan semanggi empat daun.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FULL 35 SHAPES LIBRARY */}
      {activeTab === "library" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
                  selectedCategory === "all"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                )}
              >
                Semua ({MATERIAL_SHAPE_NAMES.length})
              </button>
              {SHAPE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
                    selectedCategory === cat.id
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  {cat.name} ({cat.shapes.length})
                </button>
              ))}
            </div>
            <span className="text-xs text-on-surface-variant">
              Klik bentuk mana saja untuk langsung mencobanya di Morph Studio
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
            {displayShapes.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setToShape(name);
                  setActiveTab("studio");
                  setIsPlaying(true);
                }}
                className="group flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-outline-variant bg-surface-container-low p-4 text-center transition-all hover:-translate-y-1 hover:border-primary hover:bg-surface-container hover:shadow-level-1 cursor-pointer"
              >
                <div className="flex size-14 items-center justify-center rounded-xl bg-surface-container-high group-hover:bg-primary/10 transition-colors">
                  <MaterialShape
                    name={name}
                    className="size-9 text-on-surface group-hover:text-primary transition-colors"
                  />
                </div>
                <span className="text-xs font-semibold text-on-surface line-clamp-1 w-full truncate">
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CSS CORNER RADIUS SCALE */}
      {activeTab === "scale" && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="text-title-lg font-bold text-on-surface">
              Material 3 Standard Corner Radius Scale
            </h4>
            <p className="text-xs text-on-surface-variant sm:text-sm">
              Skala standar CSS untuk kontainer, kartu, menu, dan tombol persegi (0dp hingga 9999dp).
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cssRadiusScale.map((item) => (
              <div
                key={item.token}
                className="flex items-start gap-4 rounded-xl border border-outline-variant bg-surface-container-low p-4 transition-colors hover:bg-surface-container"
              >
                <div
                  className={cn(
                    "flex size-14 shrink-0 items-center justify-center border-2 border-primary bg-primary/10 shadow-level-0",
                    item.class
                  )}
                >
                  <span className="text-xs font-bold text-primary">{item.size}</span>
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold text-on-surface">{item.name}</span>
                    <code className="rounded bg-surface-container-high px-1.5 py-0.5 font-mono text-[11px] text-primary">
                      {item.token}
                    </code>
                  </div>
                  <p className="font-mono text-xs text-on-surface-variant">{item.size}</p>
                  <p className="line-clamp-2 text-xs text-on-surface-variant">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
