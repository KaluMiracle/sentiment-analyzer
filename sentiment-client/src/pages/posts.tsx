import React, { useState } from "react";
import { useFacebookDataContext } from "../context/disaster-context";
import { DataTable } from "../components/data/data-table";

import { AlertCircle, Loader2 } from "lucide-react";
import { PostsTable } from "../components/data/posts-table";
import { MainLayout } from "../components/layout/main-layout";

export default function Posts() {
  const { facebookPosts, isLoadingFbPostComments, isLoadingAnalyzedFiles } =
    useFacebookDataContext();
  // Data handling with safety checks
  const isLoading = isLoadingFbPostComments || isLoadingAnalyzedFiles;

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

  // Transform for display
  const transformedPosts = Array.isArray(facebookPosts)
    ? facebookPosts.map((post) => ({
        ...post,
      }))
    : [];

  console.log("Transformed Posts:", transformedPosts);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Data table */}
        {transformedPosts.length > 0 ? (
          <PostsTable data={transformedPosts} />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow">
            <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
            <h3 className="text-xl font-semibold text-slate-800">
              No Data Available
            </h3>
            <p className="text-slate-500 mt-2 text-center">
              There are no posts to display.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
