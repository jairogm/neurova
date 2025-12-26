"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonSessionList() {
  return (
    <div className="flex flex-col gap-4 w-72 overflow-y-auto max-h-[660px] pr-2">
      {Array.from({ length: 3 }).map((_, monthIndex) => (
        <div key={monthIndex} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" /> {/* month title */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-16 w-16 rounded-md" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
