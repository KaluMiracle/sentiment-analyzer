import React, { useState } from "react";
import { useDisasterContext } from "../context/disaster-context";
import { DataTable } from "../components/data/data-table";
import { FileUploader } from "../components/file-uploader";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
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
} from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { AlertCircle, Download, FileX, Loader2, Trash2 } from "lucide-react";
import { deleteAllData, deleteAnalyzedFile } from "../lib/api";
import { useToast } from "../hooks/use-toast";

// Language mapping
const languageMap: Record<string, string> = {
  en: "English",
  tl: "Filipino",
};

export default function RawData() {
  const { toast } = useToast();
  const {
    fbPostComments,
    analyzedFiles,
    isLoadingFbPostComments,
    isLoadingAnalyzedFiles,
    refreshData,
  } = useDisasterContext();
  const [selectedFileId, setSelectedFileId] = useState<string>("all");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);

  // Data handling with safety checks
  const isLoading = isLoadingFbPostComments || isLoadingAnalyzedFiles;
  const safePostsArray = Array.isArray(fbPostComments) ? fbPostComments : [];
  const safeFilesArray = Array.isArray(analyzedFiles) ? analyzedFiles : [];

  const handleDeleteAllData = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteAllData();
      toast({
        title: "Success",
        description: result.message,
        variant: "default",
      });
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      setDeletingFileId(fileId);
      const result = await deleteAnalyzedFile(fileId);
      if (selectedFileId === fileId.toString()) {
        setSelectedFileId("all");
      }
      toast({
        title: "Success",
        description: result.message,
        variant: "default",
      });
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingFileId(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center mb-4 shadow-md">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
        <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-700 to-blue-600 bg-clip-text text-transparent">
          Loading data...
        </h3>
        <p className="text-slate-500 mt-2">
          Retrieving sentiment analysis information
        </p>
      </div>
    );
  }

  // Filter posts by file ID
  const filteredPosts =
    selectedFileId === "all"
      ? safePostsArray
      : safePostsArray.filter((post) => post.id === parseInt(selectedFileId));

  // Transform for display
  const transformedPosts = Array.isArray(fbPostComments)
    ? fbPostComments.map((post) => ({
        ...post,
        language: languageMap[post.id] || post.id,
      }))
    : [];

  console.log("Transformed Posts:", transformedPosts);

  return (
    <div className="space-y-6">
      {/* Data table */}
      {transformedPosts.length > 0 ? (
        <DataTable data={transformedPosts} />
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow">
          <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
          <h3 className="text-xl font-semibold text-slate-800">
            No Data Available
          </h3>
          <p className="text-slate-500 mt-2 text-center">
            There are no sentiment posts to display. Try uploading a CSV file to
            analyze sentiment data.
          </p>
        </div>
      )}
    </div>
  );
}
