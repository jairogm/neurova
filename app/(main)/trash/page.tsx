"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, RefreshCcw, AlertTriangle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function TrashPage() {
  const router = useRouter();
  const trashData = useQuery(api.trash.listTrash);
  const restorePatient = useMutation(api.trash.restorePatient);
  const restoreRecord = useMutation(api.trash.restoreRecord);
  const deletePatient = useMutation(api.trash.permanentDeletePatient);
  const deleteRecord = useMutation(api.trash.permanentDeleteRecord);

  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'patient' | 'record' } | null>(null);

  if (!trashData) {
    return <div className="p-8 text-center">Loading trash...</div>;
  }

  const { patients, records } = trashData;

  const handleRestore = async (id: string, type: 'patient' | 'record') => {
    try {
      if (type === 'patient') {
        await restorePatient({ id: id as any });
      } else {
        await restoreRecord({ id: id as any });
      }
      toast.success("Item restored successfully");
    } catch (error: any) {
      // Convex errors often come as an Error object or a ConvexError
      const message = error.message.includes("Cannot restore record")
        ? "Cannot restore record because the patient is deleted."
        : error.data?.message || error.message || "Failed to restore item";

      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === 'patient') {
        await deletePatient({ id: itemToDelete.id as any });
      } else {
        await deleteRecord({ id: itemToDelete.id as any });
      }
      toast.success("Item permanently deleted");
    } catch (error) {
      toast.error("Failed to delete item");
    } finally {
      setItemToDelete(null);
    }
  };

  const getDaysRemaining = (deletedAt?: number) => {
    if (!deletedAt) return 30;
    const daysPassed = (Date.now() - deletedAt) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.round(30 - daysPassed));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
          <Trash2 className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Trash</h1>
          <p className="text-gray-500">Items are permanently deleted after 30 days.</p>
        </div>
      </div>

      <Tabs defaultValue="patients" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="patients">Patients ({patients.length})</TabsTrigger>
          <TabsTrigger value="records">Records ({records.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="patients">
          <div className="rounded-md border bg-white dark:bg-gray-950">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Deleted</TableHead>
                  <TableHead>Auto-Delete In</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                      No deleted patients found.
                    </TableCell>
                  </TableRow>
                ) : (
                  patients.map((patient) => (
                    <TableRow key={patient._id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>
                        {patient.deleted_at ? formatDistanceToNow(patient.deleted_at, { addSuffix: true }) : '-'}
                      </TableCell>
                      <TableCell className="text-orange-600 font-medium">
                        {getDaysRemaining(patient.deleted_at)} days
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(patient._id, 'patient')}
                        >
                          <RefreshCcw className="mr-2 h-3 w-3" /> Restore
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setItemToDelete({ id: patient._id, type: 'patient' })}
                        >
                          Delete Forever
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="records">
          <div className="rounded-md border bg-white dark:bg-gray-950">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Deleted</TableHead>
                  <TableHead>Auto-Delete In</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                      No deleted records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="font-medium">{record.title || "Untitled"}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>
                        {record.deleted_at ? formatDistanceToNow(record.deleted_at, { addSuffix: true }) : '-'}
                      </TableCell>
                      <TableCell className="text-orange-600 font-medium">
                        {getDaysRemaining(record.deleted_at)} days
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(record._id, 'record')}
                        >
                          <RefreshCcw className="mr-2 h-3 w-3" /> Restore
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setItemToDelete({ id: record._id, type: 'record' })}
                        >
                          Delete Forever
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Permanent Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This item will be permanently removed from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
