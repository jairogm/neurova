"use client";
import { DataTable } from "@/components/data-table";
import { columns } from "@/lib/columns";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { AddPatient } from "@/components/modals/AddPatient";

export default function Patients() {
  const data = useQuery(api.patients.list);
  const isLoading = data === undefined;
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter patients based on search query
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((patient) => {
      const name = patient.name?.toLowerCase() || "";
      const email = patient.email?.toLowerCase() || "";
      const phone = patient.phone_number?.toLowerCase() || "";

      return (
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query)
      );
    });
  }, [data, searchQuery]);

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-gray-500">Manage your patients</p>
        </div>
        <Button onClick={() => setIsAddPatientOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search patients by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredData} loading={isLoading} />

      {/* Add Patient Modal */}
      <AddPatient open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen} />
    </div>
  );
}
