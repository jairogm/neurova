// hooks/useUpcomingAppointments.ts
import { CalendarEvent, createAppointment, getUpcomingAppointments } from '@/lib/supabase/google-calendar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


export function useAppointments() {
  const queryClient = useQueryClient();

  // Query for fetching appointments
  const appointmentsQuery = useQuery({
    queryKey: ['upcoming-appointments'],
    queryFn: getUpcomingAppointments,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Mutation for creating appointments
  const createAppointmentMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: (newAppointment: CalendarEvent) => {
      // Add the new appointment to the existing cache
      queryClient.setQueryData(['upcoming-appointments'], (oldData: CalendarEvent[] = []) => {
        // Insert the new appointment in the correct chronological position
        const newData = [...oldData, newAppointment];
        return newData.sort((a, b) => {
          const aTime = a.start?.dateTime || a.start?.date || '';
          const bTime = b.start?.dateTime || b.start?.date || '';
          return new Date(aTime).getTime() - new Date(bTime).getTime();
        });
      });

      // Also invalidate to ensure fresh data on next fetch
      queryClient.invalidateQueries({ queryKey: ['upcoming-appointments'] });
    },
    onError: (error) => {
      console.error('Failed to create appointment:', error);
    },
  });

  return {
    // Query data and states
    appointments: appointmentsQuery.data || [],
    isLoading: appointmentsQuery.isLoading,
    error: appointmentsQuery.error,
    refetch: appointmentsQuery.refetch,
    
    // Mutation function and states
    createAppointment: createAppointmentMutation.mutate,
    isCreating: createAppointmentMutation.isPending,
    createError: createAppointmentMutation.error,
    createSuccess: createAppointmentMutation.isSuccess,
    
    // Reset functions
    resetCreateState: createAppointmentMutation.reset,
  };
}