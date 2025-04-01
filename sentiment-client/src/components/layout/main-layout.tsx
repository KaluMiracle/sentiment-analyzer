import React, { ReactNode } from "react";
import { Button } from "../ui/button";
import {
  BrainCircuit,
  BarChart2,
  Clock,
  Layers,
  Database,
  ChartPie,
  Activity,
  HelpCircle,
  Menu,
  User,
  LogOut,
  Globe,
  Quote,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../context/auth-context";
import {
  DropdownMenu,
  DropdownMenuSeparator,
} from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { AuthGuard } from "../auth/auth-guard";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const { user, logout, selectedPage, switchPages } = useAuth();

  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <BarChart2 className="w-4 h-4" />,
    },
    {
      path: "/posts",
      label: "Posts",
      icon: <Globe className="w-4 h-4" />,
    },
    {
      path: "/comments",
      label: "Comments",
      icon: <Quote className="w-4 h-4" />,
    },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="wave-animation"></div>
        </div>

        {/* Header with Dropdown Navigation - Mobile Optimized */}
        {user && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed w-full top-0 bg-gradient-to-r from-white/95 via-blue-50/95 to-indigo-50/95 backdrop-blur-sm border-b border-slate-200 shadow-lg z-50"
          >
            <div className="max-w-[2000px] mx-auto">
              <div className="flex items-center justify-between px-3 py-3 sm:px-8 sm:py-5">
                {/* Left side - Logo and Title */}
                <div className="flex items-center gap-3 sm:gap-5">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-lg"
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <BrainCircuit className="absolute inset-0 w-full h-full text-white p-2 drop-shadow" />
                    </motion.div>
                  </div>
                  <div>
                    <motion.h1
                      className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Sentiment Analyzer
                    </motion.h1>
                    <motion.p
                      className="text-sm sm:text-base text-slate-600 font-medium"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      Real-time Sentiment Analysis
                    </motion.p>
                  </div>
                </div>

                {/* Right side - Profile and Menu */}
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Profile - More compact on mobile */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
                      <img
                        src={user?.photoUrl}
                        alt="User"
                        className="rounded-full w-full h-full"
                      />
                      {/* <UsAer className="w-3 h-3 sm:w-4 sm:h-4 text-white"  /> */}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-slate-700 hidden sm:inline">
                      {user?.name}
                    </span>
                    {user.pages && user.pages.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="ml-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-blue-600 focus:outline-none">
                            {selectedPage ? selectedPage.name : "pages"} ▼
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {user.pages.map((page) => (
                            <DropdownMenuItem
                              key={page.id}
                              onClick={() => switchPages(page)}
                              className="cursor-pointer"
                            >
                              {page.name}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => switchPages()}
                            className="cursor-pointer"
                          >
                            {user.name}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Logout Button - Icon only on mobile */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 sm:h-9 sm:w-auto rounded-full hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Logout</span>
                  </Button>

                  {/* Menu Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Dropdown Navigation Menu - Mobile Optimized */}
              <AnimatePresence>
                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                      onClick={() => setIsMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                      className="absolute top-full left-0 right-0 bg-white/90 backdrop-blur-sm shadow-lg border-t border-slate-200 z-50 max-h-[80vh] overflow-y-auto"
                    >
                      <nav className="p-2 sm:p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                          {menuItems.map((item) => (
                            <div key={item.path}>
                              <Link
                                href={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                                  location === item.path
                                    ? "bg-blue-50 text-blue-600 shadow-sm"
                                    : "hover:bg-blue-50/50 text-slate-600 hover:text-blue-600"
                                }`}
                              >
                                {item.icon}
                                <span className="truncate">{item.label}</span>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </nav>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.header>
        )}

        {/* Main Content - Adjusted padding for mobile */}
        <main className="relative z-10 flex-grow pt-24 sm:pt-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </main>

        {/* Footer - Mobile Optimized */}
        <footer className="mt-auto bg-white/80 backdrop-blur-sm border-t border-slate-200 py-2 sm:py-4 px-4 sm:px-8 relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-slate-600">
            <div className="flex items-center gap-1 sm:gap-2">
              <BrainCircuit className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <span>Social Analyzer © 2025</span>
            </div>
            <div className="mt-1 sm:mt-0">
              Advanced Sentiment Analysis Platform
            </div>
          </div>
        </footer>

        {/* Wave animation styles */}
        <style>{`
        .wave-animation {
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(60deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
          animation: wave 8s ease-in-out infinite;
          background-size: 400% 400%;
        }

        .wave-animation::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(60deg, rgba(255, 255, 255, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
          animation: wave 8s ease-in-out infinite;
          animation-delay: -4s;
          background-size: 400% 400%;
        }

        @keyframes wave {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
      </div>
    </AuthGuard>
  );
}
