import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "permanently delete old trash",
  { hourUTC: 0, minuteUTC: 0 },
  internal.trash.permanentlyDeleteOldTrash
);

export default crons;
