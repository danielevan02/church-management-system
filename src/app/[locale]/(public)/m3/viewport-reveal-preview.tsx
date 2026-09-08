"use client";

import * as React from "react";
import {
  Eye,
  Layers,
  Play,
  Sparkles,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ViewportRevealPreview() {
  const [replayKey, setReplayKey] = React.useState(0);
  const [staggerMs, setStaggerMs] = React.useState(80);
  const [distance, setDistance] = React.useState(28);

  const triggerReplay = () => {
    setReplayKey((k) => k + 1);
  };

  const sampleItems = [
    {
      title: "Ringkasan Jemaat",
      category: "Statistik",
      value: "1.240 Jiwa",
      badge: "+12% bulan ini",
      tone: "primary",
    },
    {
      title: "Jadwal Ibadah Raya",
      category: "Minggu, 09:00 WIB",
      value: "Sesi 1 & Sesi 2",
      badge: "Pendaftaran Buka",
      tone: "secondary",
    },
    {
      title: "Persembahan Kasih",
      category: "Keuangan Digital",
      value: "QRIS Aktif",
      badge: "Terverifikasi",
      tone: "tertiary",
    },
    {
      title: "Warta & Komunitas",
      category: "Komsel Efrata",
      value: "28 Anggota",
      badge: "Aktif",
      tone: "surface",
    },
  ];

  return (
    <div className="space-y-6 rounded-3xl border border-outline-variant/60 bg-surface-container-low p-6">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/40 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="text-title-medium font-bold text-on-surface">
              Studio Animasi Muncul dari Bawah (Viewport Entrance)
            </h3>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            Simulasi fisika pegas M3: elemen meluncur ke atas dari bawah viewport dengan kurva decelerasi spasial.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="filled"
            size="sm"
            onClick={triggerReplay}
            className="gap-2 rounded-full shadow-level-1"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Putar Ulang Animasi</span>
          </Button>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-on-surface-variant">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80">
            Jarak Awal:
          </span>
          {[16, 28, 48].map((d) => (
            <Button
              key={d}
              size="sm"
              variant={distance === d ? "tonal" : "outline"}
              className="h-7 rounded-lg px-2.5 text-xs"
              onClick={() => {
                setDistance(d);
                triggerReplay();
              }}
            >
              {d}px
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80">
            Jeda Stagger:
          </span>
          {[40, 80, 120].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={staggerMs === s ? "tonal" : "outline"}
              className="h-7 rounded-lg px-2.5 text-xs"
              onClick={() => {
                setStaggerMs(s);
                triggerReplay();
              }}
            >
              {s}ms
            </Button>
          ))}
        </div>
      </div>

      {/* Animation Stage */}
      <div
        key={replayKey}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {sampleItems.map((item, index) => (
          <div
            key={index}
            style={{
              animation: `m3-fade-up var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial) ${index * staggerMs}ms both`,
            }}
            className="group relative flex flex-col justify-between gap-4 rounded-2xl bg-surface-container p-5 shadow-level-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-level-1"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-on-surface-variant">
                  {item.category}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  #{index + 1}
                </Badge>
              </div>
              <h4 className="font-bold text-on-surface">{item.title}</h4>
              <p className="text-2xl font-bold tracking-tight text-primary">
                {item.value}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3">
              <Badge variant="secondary" className="text-xs">
                {item.badge}
              </Badge>
              <span className="text-[11px] text-on-surface-variant/70">
                +{index * staggerMs}ms
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Pills */}
      <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
        <div className="flex items-start gap-3 rounded-xl bg-surface-container/50 p-3.5">
          <Layers className="h-5 w-5 shrink-0 text-primary" />
          <div className="space-y-0.5">
            <h5 className="text-xs font-bold text-on-surface">Staggered Cascade</h5>
            <p className="text-[11px] text-on-surface-variant">
              Elemen beruntun muncul dari bawah secara bertahap (0ms, 60ms, 120ms) untuk kesan ritmis.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-surface-container/50 p-3.5">
          <Eye className="h-5 w-5 shrink-0 text-secondary" />
          <div className="space-y-0.5">
            <h5 className="text-xs font-bold text-on-surface">IntersectionObserver</h5>
            <p className="text-[11px] text-on-surface-variant">
              Mendeteksi saat elemen masuk ke viewport saat pengguna scroll ke bawah.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-surface-container/50 p-3.5">
          <Zap className="h-5 w-5 shrink-0 text-tertiary" />
          <div className="space-y-0.5">
            <h5 className="text-xs font-bold text-on-surface">Native View Timeline</h5>
            <p className="text-[11px] text-on-surface-variant">
              Mendukung scroll-driven animation native GPU di browser modern via <code>@supports</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
