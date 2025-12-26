"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";

export function SessionList({
  sessionsByMonth,
  onSelectSession,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sessionsByMonth: Record<string, any[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelectSession: (session: any) => void; // pass full session object
}) {
  const hasSessions = Object.keys(sessionsByMonth).length > 0;

  if (!hasSessions) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-72 text-center text-muted-foreground p-4 border rounded-md bg-muted/20">
        <Image
          src="/assets/empty-sessions.svg" // optional illustration
          alt="No sessions"
          width={80}
          height={80}
          className="mb-3 opacity-60"
        />
        <p className="font-medium text-sm">No sessions found</p>
        <p className="text-xs text-muted-foreground mt-1">
          Any sessions you create for this patient will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-72 overflow-y-auto max-h-[660px] pr-2">
      {Object.entries(sessionsByMonth).map(([month, sessions]) => (
        <div key={month} className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase pl-1">
            {month}
          </h3>
          {sessions.map((session) => {
            const date = new Date(session.date);
            const day = date
              .toLocaleDateString("en-CO", { weekday: "short" })
              .toUpperCase();
            const dayNum = date.getDate();
            const time = date.toLocaleTimeString("en-CO", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });

            return (
              <Card
                key={session.id}
                onClick={() => onSelectSession(session)} // send full object
                className="flex flex-row gap-2 justify-between items-center p-3 hover:bg-muted cursor-pointer transition"
              >
                <div
                  className={`flex flex-col gap-0.5 ${
                    !session.thumbnail ? "w-full" : "w-[calc(100%-4.5rem)]"
                  }`}
                >
                  <span className="text-xs  font-bold uppercase text-primary">
                    {day} {dayNum}
                  </span>
                  <h4 className="font-semibold text-sm truncate">
                    {session.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {session.description || session.content?.blocks?.[0]?.data?.text?.slice(0, 100) || "No content preview"}
                  </p>
                  <span className="text-[11px] text-primary mt-1 font-bold">{time}</span>
                </div>
                {session.thumbnail && (
                  <Image
                    src={session.thumbnail}
                    alt="session image"
                    width={64}
                    height={64}
                    className="rounded-md shrink-0"
                  />
                )}
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}
