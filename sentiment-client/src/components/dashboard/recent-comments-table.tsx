import React from "react";
import { format } from "date-fns";
import { Link } from "wouter";
import { FacebookComment } from "../../lib/api";
import {
  getSentimentBadgeClasses,
  getDisasterTypeColor,
} from "../../lib/colors";
import { Badge } from "../ui/badge";
import { AlertTriangle, ArrowUpRight, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export interface RecentCommentsTableProps {
  comments: FacebookComment[];
  title?: string;
  description?: string;
  limit?: number;
  showViewAllLink?: boolean;
  isLoading?: boolean;
}

export function RecentCommentsTable({
  comments = [],
  title = "Recent Analyzed Comments",
  description = "Latest social media sentiment",
  limit = 5,
  showViewAllLink = true,
  isLoading = false,
}: RecentCommentsTableProps) {
  // Take only the most recent posts, limited by the limit prop
  const displayedComments = comments?.slice(0, limit) || [];

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="py-4 px-6 border-b border-gray-100">
            <div className="flex justify-between items-start">
              <div className="w-full">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                <div className="flex gap-3 mt-2">
                  <div className="h-3 bg-slate-200 rounded w-16"></div>
                  <div className="h-3 bg-slate-200 rounded w-16"></div>
                  <div className="h-3 bg-slate-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (displayedComments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <AlertTriangle className="h-7 w-7 text-blue-400" />
        </div>
        <p className="text-center text-base text-slate-500 mb-2">
          No comments available
        </p>
        <p className="text-center text-sm text-slate-400">
          Upload data to see recent social media posts
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col scroll">
      {displayedComments.map((comment, index) => (
        <motion.div
          key={comment.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className={`px-6 py-4 border-b border-slate-100 hover:bg-blue-50/30 transition-colors ${
            index === displayedComments.length - 1
              ? "border-b-0 rounded-b-xl"
              : ""
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-slate-700 line-clamp-2 flex-grow">
                {comment.text}
              </p>
              <div className="flex-shrink-0">
                <Badge
                  className={`${getSentimentBadgeClasses(
                    comment.sentimentLabel
                  )} text-xs whitespace-nowrap`}
                >
                  {comment.sentimentLabel}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" />
                <span>
                  {format(new Date(comment.timestamp), "MMM d, yyyy h:mm a")}
                </span>
              </div>

              {comment.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  <span>{comment.location}</span>
                </div>
              )}

              {comment.disasterType && (
                <div className="flex items-center gap-1">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: getDisasterTypeColor(
                        comment.disasterType
                      ),
                    }}
                  ></div>
                  <span>{comment.disasterType}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                  {comment.username || "Unknown"}
                </span>
              </div>

              <div className="flex items-center gap-1 ml-auto">
                <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium">
                  {(comment.sentimentScore * 100).toFixed(0)}% confidence
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {showViewAllLink && (
        <Link href="/raw-data">
          <div className="bg-blue-50/50 hover:bg-blue-50 transition-colors py-3 px-6 rounded-b-xl flex items-center justify-center text-sm font-medium text-blue-600 cursor-pointer border-t border-blue-100/50">
            View all data
            <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
          </div>
        </Link>
      )}
    </div>
  );
}
