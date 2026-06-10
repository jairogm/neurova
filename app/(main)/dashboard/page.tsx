"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScheduleAppointment } from "@/components/modals/ScheduleAppointment";
import { AddPatient } from "@/components/modals/AddPatient";
import { UpcomingAppointments } from "@/components/UpcomingAppointments";
import { Users, Calendar, Activity, HelpCircle } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { useTutorial } from "@/hooks/useTutorial";
import { useEffect } from "react";

export default function Dashboard() {
  const t = useTranslations("dashboard");
  const format = useFormatter();
  const stats = useQuery(api.dashboard.getStats);
  const recentPatients = useQuery(api.dashboard.getRecentPatients);
  const { startDashboardTour, shouldShowTutorial, tutorialCompleted, replayTutorial, isLoading } = useTutorial();

  // Auto-start tutorial for new users
  useEffect(() => {
    if (shouldShowTutorial && !isLoading) {
      // Small delay to ensure page is fully rendered
      const timer = setTimeout(() => {
        startDashboardTour();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldShowTutorial, isLoading, startDashboardTour]);

  const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: string | number | undefined, icon: any, description?: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        {value === undefined ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("overview", {
              date: format.dateTime(new Date(), {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
            })}
          </p>
        </div>
        <div id="quick-actions" className="flex flex-wrap items-center gap-2">
          <ScheduleAppointment />
          <AddPatient variant="outline" />
          {tutorialCompleted && (
            <Button variant="ghost" size="icon" onClick={replayTutorial} title={t("replayTutorial")} aria-label={t("replayTutorial")}>
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div id="stats-overview" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("stats.totalPatients")}
          value={stats?.totalPatients}
          icon={Users}
          description={t("stats.totalPatientsDesc")}
        />
        <StatCard
          title={t("stats.totalSessions")}
          value={stats?.totalSessions}
          icon={Calendar}
          description={t("stats.totalSessionsDesc")}
        />
        <StatCard
          title={t("stats.sessionsThisMonth")}
          value={stats?.sessionsThisMonth}
          icon={Activity}
          description={t("stats.sessionsThisMonthDesc")}
        />
        <StatCard
          title={t("stats.activeNow")}
          value={1}
          icon={Activity}
          description={t("stats.activeNowDesc")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Upcoming Sessions (Main Column) */}
        <div id="upcoming-appointments" className="col-span-4">
          <UpcomingAppointments />
        </div>

        {/* Recent Activity (Side Column) */}
        <Card id="recent-patients" className="col-span-3">
          <CardHeader>
            <CardTitle>{t("recentPatients.title")}</CardTitle>
            <CardDescription>
              {t("recentPatients.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentPatients === undefined ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : !recentPatients || recentPatients.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{t("recentPatients.empty")}</p>
              ) : (
                recentPatients.map((patient) => (
                  <div key={patient._id} className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center border border-sky-200 dark:border-sky-800" aria-hidden="true">
                      <span className="text-xs font-medium text-sky-700 dark:text-sky-300">
                        {patient.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("recentPatients.added", {
                          date: format.dateTime(new Date(patient.created_at), {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }),
                        })}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                      {patient.phone_number || t("recentPatients.noPhone")}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
