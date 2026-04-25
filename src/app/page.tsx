import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { church } from "@/config/church";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
        <header className="flex flex-col gap-2">
          <Badge variant="secondary" className="w-fit">
            Phase 0 — Project Setup
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">{church.name}</h1>
          <p className="text-muted-foreground">
            Church Management System scaffold is ready. Auth, database models,
            and feature modules will be wired in subsequent phases.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Bootstrap status</CardTitle>
            <CardDescription>
              Verify these before moving to Phase 1.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Next.js 15 + React 19 + TypeScript strict</span>
              <Badge>OK</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Tailwind v4 + shadcn/ui</span>
              <Badge>OK</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Prisma 7 (schema empty until Phase 1)</span>
              <Badge variant="outline">Ready</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>PostgreSQL 16 via docker compose</span>
              <Badge variant="outline">Run docker compose up -d</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button asChild>
            <Link href="https://github.com/danielevan02">Repository</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/CLAUDE.md">Project guide</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
