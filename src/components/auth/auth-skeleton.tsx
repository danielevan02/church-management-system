import Image from "next/image";

import { Skeleton } from "@/components/ui/skeleton";
import { church } from "@/config/church";

/**
 * Loading skeleton that mirrors AuthShell — used by loading.tsx files
 * under /auth/*. Gives clicks instant visual response so members don't
 * mash the sign-in button thinking it didn't register.
 */
export function AuthSkeleton() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col px-6 py-10 sm:px-10 lg:px-16">
        <header className="flex items-center gap-2 text-sm font-medium">
          <Image
            src="/icon-ui-192.png"
            alt=""
            aria-hidden
            width={32}
            height={32}
            priority
            className="h-8 w-8 object-contain"
          />
          <span className="text-foreground">{church.name}</span>
        </header>

        <div className="flex flex-1 items-center">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 space-y-2">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </section>

      <aside
        className="hidden lg:block"
        style={{
          background: `linear-gradient(135deg, ${church.primaryColor} 0%, ${church.primaryColor}dd 50%, ${church.primaryColor}99 100%)`,
        }}
      />
    </main>
  );
}
