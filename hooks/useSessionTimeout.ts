import { useContext } from "react";
import { useSessionTimeout as useSessionTimeoutContext } from "@/providers/SessionTimeoutProvider";

export const useSessionTimeout = useSessionTimeoutContext;