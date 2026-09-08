import * as React from "react";

import { cn } from "@/lib/utils";

export interface ChurchBuildingSilhouetteProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Architectural vector silhouette of a church sanctuary facade.
 * Designed with elegant line-art, arched portals, rose window, spires,
 * and stone stepped foundation.
 */
export function ChurchBuildingSilhouette({
  className,
  ...props
}: ChurchBuildingSilhouetteProps) {
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary shrink-0", className)}
      {...props}
    >
      {/* Soft Architectural Tonal Silhouette Masses */}
      {/* Central Nave Mass */}
      <path
        d="M75 105 L120 62 L165 105 V190 H75 Z"
        fill="currentColor"
        fillOpacity="0.04"
      />
      {/* Left Tower Mass */}
      <path
        d="M26 95 L42 75 L58 95 V190 H26 Z"
        fill="currentColor"
        fillOpacity="0.05"
      />
      {/* Right Tower Mass */}
      <path
        d="M182 95 L198 75 L214 95 V190 H182 Z"
        fill="currentColor"
        fillOpacity="0.05"
      />
      {/* Intermediate Side Halls */}
      <path
        d="M58 118 L75 105 V190 H58 Z"
        fill="currentColor"
        fillOpacity="0.03"
      />
      <path
        d="M165 105 L182 118 V190 H165 Z"
        fill="currentColor"
        fillOpacity="0.03"
      />

      {/* Main Structural Line-Art */}
      {/* Spires & Finial Crosses */}
      {/* Central Spire Cross */}
      <path
        d="M120 16 V58 M114 26 H126"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Central Spire Roof */}
      <path
        d="M110 62 L120 40 L130 62"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Left Tower Cross & Roof */}
      <path
        d="M42 62 V75 M38 67 H46"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M26 95 L42 75 L58 95"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right Tower Cross & Roof */}
      <path
        d="M198 62 V75 M194 67 H202"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M182 95 L198 75 L214 95"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Main Gable Roof Pitch */}
      <path
        d="M72 107 L120 62 L168 107"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M78 111 L120 72 L162 111"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.6"
      />

      {/* Side Hall Roof Slopes */}
      <path
        d="M58 119 L75 107"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M165 107 L182 119"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Vertical Building Columns / Buttresses */}
      <path
        d="M26 95 V190 M58 95 V190"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M75 105 V190 M165 105 V190"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M182 95 V190 M214 95 V190"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Central Rose Window */}
      <circle
        cx="120"
        cy="96"
        r="14"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="120"
        cy="96"
        r="8"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.7"
      />
      <circle
        cx="120"
        cy="96"
        r="2.5"
        fill="currentColor"
        fillOpacity="0.4"
      />
      {/* Rose Window Tracery / Rays */}
      <path
        d="M120 82 V110 M106 96 H134 M110 86 L130 106 M110 106 L130 86"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeOpacity="0.6"
      />

      {/* Grand Arch Portal / Main Entrance */}
      <path
        d="M102 190 V148 C102 138 138 138 138 148 V190"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M106 190 V151 C106 142 134 142 134 151 V190"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
      {/* Entrance Door Center Split & Arch Ribs */}
      <path
        d="M120 144 V190"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M107 166 H133"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeOpacity="0.5"
      />

      {/* Left Tower Arched Windows */}
      <path
        d="M37 122 V112 C37 107 47 107 47 112 V122 Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M37 154 V138 C37 132 47 132 47 138 V154 Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M37 180 V168 C37 163 47 163 47 168 V180 Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      {/* Right Tower Arched Windows */}
      <path
        d="M193 122 V112 C193 107 203 107 203 112 V122 Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M193 154 V138 C193 132 203 132 203 138 V154 Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M193 180 V168 C193 163 203 163 203 168 V180 Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      {/* Flanking Hall Lancet Windows */}
      <path
        d="M63 158 V134 C63 129 70 129 70 134 V158 Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M170 158 V134 C170 129 177 129 177 134 V158 Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Horizontal Architectural Moldings / Cornices */}
      <path
        d="M23 124 H61 M179 124 H217"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeOpacity="0.5"
      />
      <path
        d="M23 156 H61 M179 156 H217"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeOpacity="0.5"
      />
      <path
        d="M75 128 H165"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeOpacity="0.5"
      />

      {/* Stepped Stone Plinth Base & Stairs */}
      <path
        d="M16 190 H224"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10 194 H230"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
      <path
        d="M4 198 H236"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
    </svg>
  );
}
