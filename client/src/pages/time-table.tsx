import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit3, Calendar, Users } from "lucide-react";
import { Link } from "wouter";
import type { TimeTable } from "@shared/schema";

export default function TimeTableLanding() {
  const { data: timeTables = [], isLoading } = useQuery({
    queryKey: ["/api/time-tables"],
    queryFn: async () => {
      const response = await fetch("/api/time-tables");
      if (!response.ok) {
        throw new Error("Failed to fetch time tables");
      }
      return response.json() as Promise<TimeTable[]>;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="text-lg text-blue-600 dark:text-blue-400">
              Loading time tables...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Time Table Management
          </h1>
          <p className="text-blue-700 dark:text-blue-300">
            Create and manage class time tables with automated teacher scheduling
          </p>
        </div>

        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-blue-200 dark:border-blue-800 shadow-2xl shadow-blue-200/50 dark:shadow-blue-900/30">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl text-blue-700 dark:text-blue-300 flex items-center">
                  <Calendar className="mr-2 h-6 w-6" />
                  Time Tables
                </CardTitle>
                <CardDescription className="text-blue-600 dark:text-blue-400">
                  Manage class schedules and teacher assignments
                </CardDescription>
              </div>
              <Link href="/add-time-table">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Time Table
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {timeTables.length > 0 ? (
              <div className="rounded-lg border border-blue-200 dark:border-blue-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
                      <TableHead className="text-blue-700 dark:text-blue-300 font-semibold">
                        Class Division
                      </TableHead>
                      <TableHead className="text-blue-700 dark:text-blue-300 font-semibold">
                        Academic Year
                      </TableHead>
                      <TableHead className="text-blue-700 dark:text-blue-300 font-semibold">
                        Status
                      </TableHead>
                      <TableHead className="text-blue-700 dark:text-blue-300 font-semibold text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeTables.map((timeTable) => (
                      <TableRow
                        key={timeTable.id}
                        className="hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                            Class {timeTable.className} - Division {timeTable.division}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {timeTable.academicYear}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={timeTable.status === "active" ? "default" : "secondary"}
                            className={
                              timeTable.status === "active"
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            }
                          >
                            {timeTable.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-950"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Link href={`/edit-time-table/${timeTable.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-indigo-300 hover:bg-indigo-50 dark:border-indigo-700 dark:hover:bg-indigo-950"
                              >
                                <Edit3 className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-16 w-16 text-blue-400 dark:text-blue-500 mb-4" />
                <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">
                  No Time Tables Found
                </h3>
                <p className="text-blue-600 dark:text-blue-400 mb-6">
                  Create your first time table to get started with class scheduling.
                </p>
                <Link href="/add-time-table">
                  <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Time Table
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}