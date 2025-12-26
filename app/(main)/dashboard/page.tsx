import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScheduleAppointment } from "@/components/modals/ScheduleAppointment";
import { AddPatient } from "@/components/modals/AddPatient";
import { UpcomingAppointments } from "@/components/UpcomingAppointments";

export default function Dashboard() {
 

  return (
    <div className="container mx-auto my-0  gap-4 flex  flex-col lg:flex-row lg:justify-between">
      <UpcomingAppointments />

      <div className="flex flex-col lg:w-1/2 lg:max-w-lg gap-4">
        {/* Notifications */}
        {/* <Card className="w-full">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
        </Card> */}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
          <ScheduleAppointment />

          <AddPatient variant="outline"/>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
