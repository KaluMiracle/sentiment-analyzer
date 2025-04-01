import React, { useEffect } from "react";
import { useFacebookDataContext } from "../context/disaster-context";
import { StatusCard } from "../components/dashboard/status-card";
import { OptimizedSentimentChart } from "../components/dashboard/optimized-sentiment-chart";
import { RecentPostsTable } from "../components/dashboard/recent-posts-table";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import {
  Loader2,
  Database,
  BarChart3,
  Globe2,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { CardCarousel } from "../components/dashboard/card-carousel";
// import { Button } from "../components/ui/button";
// import { Link } from "wouter";
import { useState } from "react";
import { RecentCommentsTable } from "../components/dashboard/recent-comments-table";
import { useAuth } from "../context/auth-context";
import { MainLayout } from "../components/layout/main-layout";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function LoadingOverlay({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-lg"></div>

      {/* Loading content */}
      <div className="relative z-10 flex flex-col items-center gap-4 p-6 bg-white/50 rounded-xl shadow-lg backdrop-blur-sm">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-800">
            Processing Data
          </p>
          <p className="text-sm text-slate-600">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const {
    fbPostComments = [],
    facebookPosts = [],
    analyzedPostsCount = 0,
    analyzedCommentsCount = 0,
    dominantSentiment = "N/A",
    isLoadingFbPostComments = true,
    isLoadingFacebookPosts = true,
  } = useFacebookDataContext();
  useEffect(() => {
    console.log("Facebook Posts:", facebookPosts);
    console.log("Facebook Post Comments:", fbPostComments);
  }, [facebookPosts, fbPostComments]);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const { user, selectedPage } = useAuth();

  // Calculate stats with safety checks
  const totalPosts = Array.isArray(fbPostComments) ? fbPostComments.length : 0;

  // Filter out "Not specified" and generic "Philippines" locations with safety check
  const filteredPosts = Array.isArray(fbPostComments) ? fbPostComments : [];

  const sentimentData = {
    labels: ["positive", "neutral", "negative"],
    values: [0, 0, 0],
    showTotal: false,
  };

  // Count sentiments from filtered posts
  filteredPosts.forEach((post) => {
    const index = sentimentData.labels.indexOf(post.sentimentLabel);
    if (index !== -1) {
      sentimentData.values[index]++;
    }
  });

  return (
    <MainLayout>
      <div className="space-y-8 pb-10">
        {/* Beautiful hero section with animated gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 shadow-xl"
        >
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] opacity-20"></div>
          <div className="absolute h-40 w-40 rounded-full bg-blue-400 filter blur-3xl opacity-30 -top-20 -left-20 animate-pulse"></div>
          <div className="absolute h-40 w-40 rounded-full bg-indigo-400 filter blur-3xl opacity-30 -bottom-20 -right-20 animate-pulse"></div>

          <div className="relative px-6 py-12 sm:px-12 sm:py-16">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {selectedPage ? selectedPage?.name : user?.name}
              </h1>
              <p className="text-blue-100 text-base sm:text-lg mb-6 max-w-xl">
                Track real-time sentiment and trends from Facebook and Instagram
                comments with interactive analytics. Visualize emotions,
                keywords, and engagement to make data-driven decisions
                effortlessly!
              </p>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center text-xs bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white">
                  <Database className="h-3.5 w-3.5 mr-1.5" />
                  <span>{totalPosts} Data Points</span>
                </div>
                <div className="flex items-center text-xs bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white">
                  <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                  <span>Sentiment Analysis</span>
                </div>
                <div className="flex items-center text-xs bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white">
                  <Globe2 className="h-3.5 w-3.5 mr-1.5" />
                  <span>Accross all pages</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid with improved styling (3-card layout) */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
        >
          <StatusCard
            title="Analyzed Posts"
            value={analyzedPostsCount.toString()}
            icon="alert-triangle"
            trend={{
              value: "+2",
              isUpward: true,
              label: "from last week",
            }}
            isLoading={isLoadingFacebookPosts}
          />
          <StatusCard
            title="Analyzed Comments"
            value={analyzedCommentsCount.toString()}
            icon="bar-chart"
            trend={{
              value: "+15%",
              isUpward: true,
              label: "increase in analysis",
            }}
            isLoading={isLoadingFbPostComments}
          />
          <StatusCard
            title="Dominant Sentiment"
            value={dominantSentiment}
            icon="heart"
            trend={{
              value: "stable",
              isUpward: null,
              label: "sentiment trend",
            }}
            isLoading={isLoadingFbPostComments}
          />
        </motion.div>

        {/* Flexbox layout for main content with improved proportions */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-[450px] flex-shrink-0"
          >
            <div className="sticky top-6">
              <Card className="bg-white shadow-xl border-none overflow-hidden rounded-xl relative h-[450px] flex flex-col">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Globe2 className="text-blue-600 h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-slate-800">
                        Recent Posts
                      </CardTitle>
                    </div>
                    <a
                      href="/posts"
                      className="rounded-lg h-8 gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center px-3 py-1.5"
                    >
                      View All
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                  <CardDescription className="text-slate-500 mt-1">
                    Latest analyzed posts and sentiment data
                  </CardDescription>
                </CardHeader>

                {/* Recent Posts Card */}
                <div className="h-full flex flex-col">
                  <div className="flex-grow overflow-hidden relative">
                    <RecentPostsTable
                      posts={Array.isArray(facebookPosts) ? facebookPosts : []}
                      limit={5}
                      isLoading={isLoadingFbPostComments}
                    />
                    {isLoadingFbPostComments && (
                      <LoadingOverlay message="Loading recent posts..." />
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Right column - takes remaining space */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex-grow"
          >
            {/* Card Carousel for auto-rotating between Sentiment Distribution and Recent Activity */}
            <div className="relative mb-6 bg-white shadow-xl border-none rounded-xl overflow-hidden">
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <div
                  className="cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => setCarouselPaused(!carouselPaused)}
                >
                  <RefreshCw
                    className={`h-5 w-5 text-blue-600 ${
                      carouselPaused ? "" : "animate-spin-slow"
                    } rotate-icon`}
                  />
                </div>
              </div>

              <CardCarousel
                autoRotate={!carouselPaused}
                interval={10000}
                showControls={true}
                className="h-[450px]"
              >
                {/* Sentiment Distribution Card */}
                <div className="h-full">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 p-6 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <BarChart3 className="text-blue-600 h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">
                          Sentiment Distribution
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      Emotional response breakdown across disaster events
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="h-[350px]">
                      <OptimizedSentimentChart
                        data={sentimentData}
                        isLoading={isLoadingFbPostComments}
                      />
                    </div>
                  </div>
                </div>

                {/* Recent Comments Card */}
                <div className="h-full flex flex-col">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 p-6 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Database className="text-blue-600 h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">
                          Recent Activity
                        </h3>
                      </div>
                      <a
                        href="/comments"
                        className="rounded-lg h-8 gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center px-3 py-1.5"
                      >
                        View All
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      Latest analyzed posts and sentiment data
                    </p>
                  </div>
                  <div className="flex-grow overflow-hidden relative">
                    <RecentCommentsTable
                      comments={
                        Array.isArray(fbPostComments) ? fbPostComments : []
                      }
                      limit={10}
                      isLoading={isLoadingFbPostComments}
                    />
                    {isLoadingFbPostComments && (
                      <LoadingOverlay message="Loading recent posts..." />
                    )}
                  </div>
                </div>
              </CardCarousel>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
