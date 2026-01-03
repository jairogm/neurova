/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as calendar from "../calendar.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as debug from "../debug.js";
import type * as medical_history_notes from "../medical_history_notes.js";
import type * as migrations from "../migrations.js";
import type * as patients from "../patients.js";
import type * as sessions from "../sessions.js";
import type * as therapists from "../therapists.js";
import type * as trash from "../trash.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  calendar: typeof calendar;
  crons: typeof crons;
  dashboard: typeof dashboard;
  debug: typeof debug;
  medical_history_notes: typeof medical_history_notes;
  migrations: typeof migrations;
  patients: typeof patients;
  sessions: typeof sessions;
  therapists: typeof therapists;
  trash: typeof trash;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
