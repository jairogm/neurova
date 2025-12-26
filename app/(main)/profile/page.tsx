"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Loader2 } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { toast } from "sonner";
import { COUNTRIES } from "@/lib/constants/countries";
import { TherapistProfile } from "@/lib/types";
import { getTherapistProfile } from "@/lib/supabase/getTherapistProfile";
import { updateTherapistProfile } from "@/lib/supabase/updateTherapistProfile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Partial<TherapistProfile>>({
    full_name: "",
    email: "",
    phone: "",
    specialization: "",
    license_number: "",
    years_of_experience: 0,
    bio: "",
    office_address: "",
    emergency_contact: {
      name: "",
      phone: "",
      relationship: "",
      country_code: COUNTRIES[0], // Default to first country (US)
    },
  });

  const supabase = createClient();
  const queryClient = useQueryClient();

  // Query for therapist profile
  const { data: therapistProfile, isLoading, error } = useQuery<TherapistProfile | null>({
    queryKey: ["therapist-profile"],
    queryFn: getTherapistProfile,
    retry: false,
  });

  // Mutation for updating profile with optimistic updates
  const updateProfileMutation = useMutation({
    mutationFn: updateTherapistProfile,
    onMutate: async (newProfileData) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["therapist-profile"] });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<TherapistProfile>(["therapist-profile"]);

      // Optimistically update to the new value
      queryClient.setQueryData<TherapistProfile>(["therapist-profile"], (old) => ({
        ...old!,
        ...newProfileData,
      }));

      // Return a context object with the snapshotted value
      return { previousProfile };
    },
    onSuccess: (updatedProfile) => {
      // Update the cache with server response
      queryClient.setQueryData(["therapist-profile"], updatedProfile);
      toast.success("Profile updated successfully!");
    },
    onError: (error, newProfileData, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousProfile) {
        queryClient.setQueryData(["therapist-profile"], context.previousProfile);
      }
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["therapist-profile"] });
    },
  });

  // Get auth user and sync with profile data
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Sync therapist profile data with local state when it loads
  useEffect(() => {
    if (therapistProfile) {
      setProfile(therapistProfile);
    } else if (user && !isLoading) {
      // No profile exists yet, set defaults from auth user
      setProfile(prev => ({
        ...prev,
        full_name: user.user_metadata?.full_name || user.email || "",
        email: user.email || "",
      }));
    }
  }, [therapistProfile, user, isLoading]);

  const handleSave = async () => {
    updateProfileMutation.mutate(profile);
  };

  const getUserInitials = (user: SupabaseUser | null) => {
    if (!user?.user_metadata?.full_name && !user?.email) return "U";
    
    const name = user.user_metadata?.full_name || user.email || "";
    const parts = name.split(" ");
    
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load profile</p>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ["therapist-profile"] })}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage 
              src={user?.user_metadata?.avatar_url} 
              alt={profile.full_name || "Profile"}
            />
            <AvatarFallback className="text-lg">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Profile Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your professional information
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={profile.full_name || ""}
                  onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email || ""}
                  disabled
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex space-x-2">
                  <Select
                    value={profile.country_code?.iso || ""}
                    onValueChange={(value) => {
                      const country = COUNTRIES.find(c => c.iso === value);
                      setProfile(prev => ({ ...prev, country_code: country }));
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Country">
                        {profile.country_code && (
                          <span className="flex items-center space-x-1">
                            <span>{profile.country_code.flag}</span>
                            <span>{profile.country_code.phoneCode}</span>
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.iso} value={country.iso}>
                          <span className="flex items-center space-x-2">
                            <span>{country.flag}</span>
                            <span>{country.name}</span>
                            <span className="text-gray-500">{country.phoneCode}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    value={profile.phone || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={profile.specialization || ""}
                  onChange={(e) => setProfile(prev => ({ ...prev, specialization: e.target.value }))}
                  placeholder="e.g., Clinical Psychology, Cognitive Behavioral Therapy"
                />
              </div>
              <div>
                <Label htmlFor="license_number">License Number</Label>
                <Input
                  id="license_number"
                  value={profile.license_number || ""}
                  onChange={(e) => setProfile(prev => ({ ...prev, license_number: e.target.value }))}
                  placeholder="Professional license number"
                />
              </div>
              <div>
                <Label htmlFor="years_of_experience">Years of Experience</Label>
                <Input
                  id="years_of_experience"
                  type="number"
                  min="0"
                  value={profile.years_of_experience || ""}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    years_of_experience: parseInt(e.target.value) || 0 
                  }))}
                  placeholder="Years of experience"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio || ""}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Share your professional background, approach, and areas of expertise..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Office Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="office_address">Office Address</Label>
              <Textarea
                id="office_address"
                value={profile.office_address || ""}
                onChange={(e) => setProfile(prev => ({ ...prev, office_address: e.target.value }))}
                placeholder="Your practice address..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergency_contact_name">Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  value={profile.emergency_contact?.name || ""}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    emergency_contact: {
                      ...prev.emergency_contact!,
                      name: e.target.value
                    }
                  }))}
                  placeholder="Emergency contact name"
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                <Input
                  id="emergency_contact_relationship"
                  value={profile.emergency_contact?.relationship || ""}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    emergency_contact: {
                      ...prev.emergency_contact!,
                      relationship: e.target.value
                    }
                  }))}
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
              <div className="flex space-x-2">
                <Select
                  value={profile.emergency_contact?.country_code?.iso || ""}
                  onValueChange={(value) => {
                    const country = COUNTRIES.find(c => c.iso === value);
                    setProfile(prev => ({ 
                      ...prev, 
                      emergency_contact: {
                        ...prev.emergency_contact!,
                        country_code: country!
                      }
                    }));
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Country">
                      {profile.emergency_contact?.country_code && (
                        <span className="flex items-center space-x-1">
                          <span>{profile.emergency_contact.country_code.flag}</span>
                          <span>{profile.emergency_contact.country_code.phoneCode}</span>
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.iso} value={country.iso}>
                        <span className="flex items-center space-x-2">
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                          <span className="text-gray-500">{country.phoneCode}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="emergency_contact_phone"
                  value={profile.emergency_contact?.phone || ""}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    emergency_contact: {
                      ...prev.emergency_contact!,
                      phone: e.target.value
                    }
                  }))}
                  placeholder="Emergency contact phone"
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            onClick={handleSave}
            disabled={updateProfileMutation.isPending}
            className="min-w-32"
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}