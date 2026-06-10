"use client";
import { DataTable } from "@/components/data-table";
import { columns } from "@/lib/columns";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, HelpCircle } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { AddPatient } from "@/components/modals/AddPatient";
import { useTutorial } from "@/hooks/useTutorial";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function Patients() {
  const t = useTranslations("patients");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const data = useQuery(api.patients.list);
  const isLoading = data === undefined;
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { startPatientsTour, currentTourPage, tutorialCompleted, replayTutorial, startRecordsTour } = useTutorial();

  // Continue tour from dashboard
  useEffect(() => {
    if (currentTourPage === "dashboard") {
      const timer = setTimeout(() => {
        startPatientsTour();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentTourPage, startPatientsTour]);

  // Handle pre-records state - show a prompt to click on records
  useEffect(() => {
    if (currentTourPage === "pre-records" && data && data.length > 0) {
      // Navigate to the first patient's records to continue the tour
      const timer = setTimeout(() => {
        router.push(`/patients/${data[0].id}/records`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentTourPage, data, router]);

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
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-gray-500">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {tutorialCompleted && (
            <Button variant="ghost" size="icon" onClick={replayTutorial} title={tCommon("replayTutorial")} aria-label={tCommon("replayTutorial")}>
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
          <Button id="view-trash-btn" variant="outline" onClick={() => window.location.href = '/trash'} className="gap-2">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {t("viewTrash")}
          </Button>
          <Button id="add-patient-btn" onClick={() => setIsAddPatientOpen(true)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            {t("addPatient")}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div id="patients-search" className="mb-4">
        <div className="relative max-w-sm">
          <label htmlFor="patients-search-input" className="sr-only">
            {t("searchLabel")}
          </label>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
          <Input
            id="patients-search-input"
            type="search"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div id="patients-table">
        <DataTable columns={columns} data={filteredData} loading={isLoading} />
      </div>

      {/* Add Patient Modal */}
      <AddPatient open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen} />
    </div>
  );
}
