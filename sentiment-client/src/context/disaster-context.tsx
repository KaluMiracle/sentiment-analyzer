import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFbPostComments,
  getFacebookPosts,
  getAnalyzedFiles,
  FacebookComment,
  FacebookPost,
  AnalyzedFile,
} from "../lib/api";
import { useAuth } from "./auth-context";

// Define ProcessingStats interface
interface ProcessingStats {
  successCount: number;
  errorCount: number;
  averageSpeed: number;
}

// Define UploadProgress interface with all properties
interface UploadProgress {
  processed: number;
  total: number;
  stage: string;
  batchNumber?: number;
  totalBatches?: number;
  batchProgress?: number;
  currentSpeed?: number;
  timeRemaining?: number;
  processingStats?: ProcessingStats;
}

interface FacebookDataContextType {
  // Data
  fbPostComments: FacebookComment[];
  facebookPosts: FacebookPost[];
  analyzedFiles: AnalyzedFile[];

  // Loading states
  isLoadingFbPostComments: boolean;
  isLoadingFacebookPosts: boolean;
  isLoadingAnalyzedFiles: boolean;
  isUploading: boolean;

  // Upload progress
  uploadProgress: UploadProgress;

  // Error states
  errorFbPostComments: Error | null;
  errorFacebookPosts: Error | null;
  errorAnalyzedFiles: Error | null;

  // Stats
  analyzedPostsCount: number;
  analyzedCommentsCount: number;
  dominantSentiment: string;
  modelConfidence: number;

  // Filters
  selectedDisasterType: string;
  setSelectedDisasterType: (type: string) => void;

  // Upload state management
  setIsUploading: (state: boolean) => void;
  setUploadProgress: (progress: UploadProgress) => void;

  // Refresh function
  refreshData: () => void;
}

const FacebookDataContext = createContext<FacebookDataContextType | undefined>(
  undefined
);

const initialProgress: UploadProgress = {
  processed: 0,
  total: 0,
  stage: "",
  batchNumber: 0,
  totalBatches: 0,
  batchProgress: 0,
  currentSpeed: 0,
  timeRemaining: 0,
  processingStats: {
    successCount: 0,
    errorCount: 0,
    averageSpeed: 0,
  },
};

export function FacebookDataContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  // State
  const [selectedDisasterType, setSelectedDisasterType] =
    useState<string>("All");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] =
    useState<UploadProgress>(initialProgress);
  const queryClient = useQueryClient();
  const { user, selectedPage } = useAuth();
  const getUserFbPosts = () => {
    if (user) {
      console.log("Fetching Facebook posts for user:", user, selectedPage);
      return getFacebookPosts(user.id, selectedPage?.id, "facebook");
    }
    return Promise.resolve([]); // Return an empty array if user is not available
  };
  const getUserFbPostComments = () => {
    if (user) {
      console.log("Fetching Facebook comments for user:", user, selectedPage);
      return getFbPostComments(user.id, selectedPage?.id, "facebook");
    }
    return Promise.resolve([]); // Return an empty array if user is not available
  };

  // // WebSocket setup
  // useEffect(() => {
  //   const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  //   const wsUrl = `${protocol}//${window.location.host}/ws`;
  //   const socket = new WebSocket(wsUrl);

  //   socket.onmessage = (event) => {
  //     try {
  //       const data = JSON.parse(event.data);
  //       if (data.type === "progress") {
  //         console.log("WebSocket progress update:", data);

  //         // Extract progress info from Python service
  //         const pythonProgress = data.progress;
  //         if (pythonProgress && typeof pythonProgress === "object") {
  //           // Parse numbers from the progress message
  //           const matches = pythonProgress.stage?.match(/(\d+)\/(\d+)/);
  //           const currentRecord = matches ? parseInt(matches[1]) : 0;
  //           const totalRecords = matches
  //             ? parseInt(matches[2])
  //             : pythonProgress.total || 0;

  //           // Calculate actual progress percentage
  //           const processedCount = pythonProgress.processed || currentRecord;

  //           setUploadProgress((prev) => ({
  //             ...prev,
  //             processed: processedCount,
  //             total: totalRecords || prev.total,
  //             stage: pythonProgress.stage || prev.stage,
  //             batchNumber: currentRecord,
  //             totalBatches: totalRecords,
  //             batchProgress:
  //               totalRecords > 0
  //                 ? Math.round((processedCount / totalRecords) * 100)
  //                 : 0,
  //             currentSpeed: pythonProgress.currentSpeed || prev.currentSpeed,
  //             timeRemaining: pythonProgress.timeRemaining || prev.timeRemaining,
  //             processingStats: {
  //               successCount: processedCount,
  //               errorCount: pythonProgress.processingStats?.errorCount || 0,
  //               averageSpeed: pythonProgress.processingStats?.averageSpeed || 0,
  //             },
  //           }));
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error processing WebSocket message:", error);
  //     }
  //   };

  //   socket.onopen = () => {
  //     console.log("WebSocket connected");
  //   };

  //   socket.onerror = (error) => {
  //     console.error("WebSocket error:", error);
  //   };

  //   return () => {
  //     socket.close();
  //   };
  // }, []);

  useEffect(() => {
    console.log("Refreshing data...");
    queryClient.removeQueries({ queryKey: "/api/user/posts" });
    refreshData();
  }, [user, selectedPage]);
  // Queries
  const {
    data: fbPostComments = [],
    isLoading: isLoadingFbPostComments,
    error: errorFbPostComments,
    refetch: refetchFbPostComments,
    // remove: removeFbPostComments,
  } = useQuery({
    queryKey: ["/api/user/comments"],
    queryFn: getUserFbPostComments,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3, // Retry 3 times if failed
  });

  const {
    data: facebookPosts = [],
    isLoading: isLoadingFacebookPosts,
    error: errorFacebookPosts,
    refetch: refetchFacebookPosts,
  } = useQuery({
    queryKey: ["/api/user/posts"],
    queryFn: getUserFbPosts,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3, // Retry 3 times if failed
  });

  const {
    data: analyzedFiles = [],
    isLoading: isLoadingAnalyzedFiles,
    error: errorAnalyzedFiles,
    refetch: refetchAnalyzedFiles,
  } = useQuery({
    queryKey: ["/api/analyzed-files"],
    queryFn: getAnalyzedFiles,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3, // Retry 3 times if failed
  });

  // Calculate stats with safety checks for array data
  const analyzedPostsCount = Array.isArray(facebookPosts)
    ? facebookPosts.length
    : 0;
  const analyzedCommentsCount = Array.isArray(fbPostComments)
    ? fbPostComments.length
    : 0;

  // Calculate dominant sentiment with proper array check
  const sentimentCounts: Record<string, number> = {};
  if (Array.isArray(fbPostComments) && fbPostComments.length > 0) {
    fbPostComments.forEach((post) => {
      sentimentCounts[post.sentimentLabel] =
        (sentimentCounts[post.sentimentLabel] || 0) + 1;
    });
  }

  const dominantSentiment =
    Object.entries(sentimentCounts).length > 0
      ? Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
      : "Neutral";

  // Calculate average model confidence with safety checks
  const totalConfidence = Array.isArray(fbPostComments)
    ? fbPostComments.reduce((sum, post) => sum + (post.sentimentScore || 0), 0)
    : 0;
  const modelConfidence =
    Array.isArray(fbPostComments) && fbPostComments.length > 0
      ? totalConfidence / fbPostComments.length
      : 0;

  // Refresh function
  const refreshData = () => {
    refetchFbPostComments();
    refetchFacebookPosts();
    refetchAnalyzedFiles();
  };

  return (
    <FacebookDataContext.Provider
      value={{
        fbPostComments,
        facebookPosts,
        analyzedFiles,
        isLoadingFbPostComments,
        isLoadingFacebookPosts,
        isLoadingAnalyzedFiles,
        isUploading,
        uploadProgress,
        errorFbPostComments,
        errorFacebookPosts,
        errorAnalyzedFiles,
        analyzedPostsCount,
        analyzedCommentsCount,
        dominantSentiment,
        modelConfidence,
        selectedDisasterType,
        setSelectedDisasterType,
        setIsUploading,
        setUploadProgress,
        refreshData,
      }}
    >
      {children}
    </FacebookDataContext.Provider>
  );
}

export function useFacebookDataContext() {
  const context = useContext(FacebookDataContext);
  if (context === undefined) {
    throw new Error(
      "useFacebookDataContext must be used within a FacebookDataContextProvider"
    );
  }
  return context;
}
