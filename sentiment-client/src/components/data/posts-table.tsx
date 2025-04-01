import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { FacebookPost } from "../../lib/api";
import { format } from "date-fns";
import {
  Search,
  Filter,
  Maximize2,
  Calendar,
  ExternalLink,
  MessageSquare,
} from "lucide-react";

interface DataTableProps {
  data: FacebookPost[];
  title?: string;
  description?: string;
}

const EMOTIONS = ["positive", "neutral", "negative"];

export function PostsTable({
  data,
  title = "Facebook Posts",
  description = "",
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSentiment, setSelectedSentiment] = useState<string>("All");
  const rowsPerPage = 10;

  // Filter data based on search term and sentiment filter
  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.timestamp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  return (
    <Card className="bg-white/90 rounded-xl shadow-lg border border-slate-200/60 overflow-hidden">
      <CardHeader className="p-6 bg-gradient-to-r from-purple-100 via-indigo-50 to-blue-50 border-b border-indigo-100/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            {title === "Complete Sentiment Dataset" ? (
              <>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-blue-600 bg-clip-text text-transparent flex items-center">
                  {title}
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-200 to-blue-100 text-indigo-800 border border-indigo-200/50 shadow-sm">
                    Primary Dataset
                  </span>
                </CardTitle>
                <CardDescription className="text-base text-slate-600 mt-2 max-w-2xl">
                  {description}
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-xl font-semibold bg-gradient-to-r from-purple-700 to-blue-600 bg-clip-text text-transparent">
                  {title}
                </CardTitle>
                <CardDescription className="text-sm text-slate-600 mt-1">
                  {description}
                </CardDescription>
              </>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors duration-200" />
              <Input
                placeholder="Search in all columns..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 w-full sm:w-64 bg-white/80 backdrop-blur-sm border-slate-200/80 rounded-lg 
                            focus:border-blue-400 focus:ring-1 focus:ring-blue-300 shadow-sm
                            transition-all duration-200"
              />
            </div>
            <Select
              value={selectedSentiment}
              onValueChange={(value) => {
                setSelectedSentiment(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px] bg-white/80 backdrop-blur-sm border-slate-200/80 rounded-lg shadow-sm">
                <Filter className="h-4 w-4 mr-2 text-slate-500" />
                <SelectValue placeholder="Filter by emotion" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-slate-200/80 shadow-md">
                {EMOTIONS.map((emotion) => (
                  <SelectItem
                    key={emotion}
                    value={emotion}
                    className="focus:bg-blue-50"
                  >
                    {emotion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50/30 hover:bg-slate-50">
                <TableHead className="w-[30%] font-semibold text-slate-700">
                  Message
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Timestamp
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Source
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Summary
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-20 text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center shadow-md">
                        <Search className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="text-xl font-medium bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent">
                        {searchTerm || selectedSentiment !== "All"
                          ? "No results match your search criteria"
                          : "No data available"}
                      </p>
                      <p className="text-sm text-slate-500 max-w-md text-center">
                        {searchTerm || selectedSentiment !== "All"
                          ? "Try adjusting your search terms or filters to find what you're looking for"
                          : "Upload a CSV file using the upload button to analyze sentiment data"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className={`
                        border-b border-slate-100 
                        ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"} 
                        hover:bg-blue-50/40 transition-colors
                      `}
                  >
                    <TableCell className="font-medium text-sm text-slate-700 max-w-xs">
                      <Dialog>
                        <DialogTrigger className="w-full">
                          <div className="flex items-center justify-between gap-2 w-full cursor-pointer group">
                            <div className="truncate text-left hover:text-blue-600 transition-colors">
                              {item.message}
                            </div>
                            {item.message.length > 40 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 rounded-full text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 shrink-0"
                              >
                                <Maximize2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg [&>[aria-label='Close']]:hidden">
                          <DialogHeader>
                            <DialogTitle className="text-xl flex items-center gap-2">
                              <MessageSquare className="h-5 w-5 text-blue-500" />
                              <span>Full Message Content</span>
                            </DialogTitle>
                            <DialogDescription className="text-slate-500">
                              View the complete message content and details
                              below.
                            </DialogDescription>
                          </DialogHeader>

                          <div className="mt-4 space-y-6">
                            <div className="p-4 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200/60 w-full">
                              <p className="text-base text-slate-700 whitespace-pre-wrap break-words overflow-auto max-h-full scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                {item.message}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                  Timestamp
                                </div>
                                <div className="text-sm font-medium text-slate-700">
                                  {format(new Date(item.timestamp), "PPP p")}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                                  <ExternalLink className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                  Source
                                </div>
                                <div className="text-sm font-medium text-slate-700">
                                  <a
                                    href={item.permalink_url as string}
                                    target="_blank"
                                    className="underline"
                                  >
                                    {item.permalink_url}
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>

                          <DialogFooter>
                            <DialogClose asChild>
                              <Button
                                type="button"
                                variant="secondary"
                                className="rounded-full hover:bg-slate-100"
                              >
                                Close
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                      <div className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100/80 border border-slate-200/60">
                        {format(new Date(item.timestamp), "yyyy-MM-dd HH:mm")}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      <div className="inline-flex items-center gap-1">
                        <a
                          href={item.permalink_url as string}
                          target="_blank"
                          className="underline"
                        >
                          {item.permalink_url}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      <div className="inline-flex items-center gap-1">
                        <a
                          href={item.permalink_url as string}
                          target="_blank"
                          className="underline"
                        >
                          {item.permalink_url}
                        </a>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between py-4 px-6 bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-blue-50/30 border-t border-slate-100/80">
            <div className="hidden sm:flex items-center gap-2">
              <div className="text-xs uppercase tracking-wider font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/50">
                {startIndex + 1}-
                {Math.min(startIndex + rowsPerPage, filteredData.length)} of{" "}
                {filteredData.length}
              </div>
            </div>

            <div className="flex justify-center items-center gap-3">
              <div className="flex shadow-sm rounded-full bg-gradient-to-r from-white to-blue-50 p-1 border border-slate-200/50">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`
                    h-8 w-8 rounded-full transition-all duration-200 
                    ${
                      currentPage === 1
                        ? "text-slate-400 cursor-not-allowed"
                        : "text-blue-600 hover:bg-blue-100"
                    }
                  `}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  <span className="sr-only">Previous</span>
                </Button>

                <div className="px-3 text-sm font-medium text-indigo-800 flex items-center">
                  Page{" "}
                  <span className="mx-1 w-5 text-center">{currentPage}</span> of{" "}
                  <span className="mx-1 w-5 text-center">{totalPages}</span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`
                    h-8 w-8 rounded-full transition-all duration-200 
                    ${
                      currentPage === totalPages
                        ? "text-slate-400 cursor-not-allowed"
                        : "text-blue-600 hover:bg-blue-100"
                    }
                  `}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                  <span className="sr-only">Next</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
