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
import { ScheduleAppointment } from "@/components/modals/ScheduleAppointment";
import { AddPatient } from "@/components/modals/AddPatient";
import { UpcomingAppointments } from "@/components/UpcomingAppointments";
import { Users, Calendar, DollarSign, Activity, Clock } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const stats = useQuery(api.dashboard.getStats);
  const recentPatients = useQuery(api.dashboard.getRecentPatients);

  const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: string | number | undefined, icon: any, description?: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your practice for {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ScheduleAppointment />
          <AddPatient variant="outline" />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={stats?.totalPatients}
          icon={Users}
          description="Active patients in your practice"
        />
        <StatCard
          title="Total Sessions"
          value={stats?.totalSessions}
          icon={Calendar}
          description="Lifetime sessions conducted"
        />
        <StatCard
          title="Sessions This Month"
          value={stats?.sessionsThisMonth}
          icon={Activity}
          description="Scheduled for this month"
        />
        <StatCard
          title="Active Now"
          value={1}
          icon={Activity}
          description="Current active sessions"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Upcoming Sessions (Main Column) */}
        <div className="col-span-4">
          <UpcomingAppointments />
        </div>

        {/* Recent Activity (Side Column) */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
            <CardDescription>
              Newest additions to your patient list.
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
                <p className="text-sm text-muted-foreground text-center py-4">No recent patients found.</p>
              ) : (
                recentPatients.map((patient) => (
                  <div key={patient._id} className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center border border-sky-200 dark:border-sky-800">
                      <span className="text-xs font-medium text-sky-700 dark:text-sky-300">
                        {patient.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Added {format(new Date(patient.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                      {patient.phone_number || "No phone"}
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
