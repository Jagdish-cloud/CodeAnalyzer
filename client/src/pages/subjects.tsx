import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Eye, Edit, Book, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import type { Subject } from "@shared/schema";

export default function Subjects() {
  const [subjectTypeFilter, setSubjectTypeFilter] = useState<"all" | "core" | "elective">("all");

  const { data: subjects, isLoading } = useQuery({
    queryKey: ["/api/subjects", subjectTypeFilter],
    queryFn: async () => {
      const url = subjectTypeFilter === "all" 
        ? "/api/subjects" 
        : `/api/subjects?type=${subjectTypeFilter}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch subjects");
      }
      return response.json() as Promise<Subject[]>;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950 dark:via-pink-950 dark:to-rose-950">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg font-medium text-slate-600 dark:text-slate-300">
              Loading subjects...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950 dark:via-pink-950 dark:to-rose-950">
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Subjects
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg">
                Manage all subjects in your institution
              </p>
            </div>
            <div className="flex gap-4">
              <Select value={subjectTypeFilter} onValueChange={(value: "all" | "core" | "elective") => setSubjectTypeFilter(value)}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="core">Core Subjects</SelectItem>
                  <SelectItem value="elective">Elective Subjects</SelectItem>
                </SelectContent>
              </Select>
              <Link href="/add-subject">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Subject
                </Button>
              </Link>
            </div>
          </div>

          {/* Subjects Table */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
              <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                All Subjects
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!subjects || subjects.length === 0 ? (
                <div className="text-center py-12">
                  <Book className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">
                    No subjects found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Get started by adding your first subject
                  </p>
                  <Link href="/add-subject">
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <Plus className="h-5 w-5 mr-2" />
                      Add First Subject
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50">
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                          Subject
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                          Type
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                          Status
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map((subject) => (
                        <TableRow
                          key={subject.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-200 border-b border-slate-200/30 dark:border-slate-700/30"
                        >
                          <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                            {subject.subjectName}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={subject.subjectType === "core" ? "default" : "outline"}
                              className={
                                subject.subjectType === "core"
                                  ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300 border-0"
                                  : "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300 border-0"
                              }
                            >
                              {subject.subjectType === "core" ? "Core" : "Elective"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={subject.status === "active" ? "default" : "secondary"}
                              className={
                                subject.status === "active"
                                  ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 border-0"
                                  : "bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 dark:from-slate-800/30 dark:to-gray-800/30 dark:text-slate-300 border-0"
                              }
                            >
                              {subject.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/30 dark:hover:border-blue-800"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-amber-50 hover:border-amber-200 dark:hover:bg-amber-950/30 dark:hover:border-amber-800"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}