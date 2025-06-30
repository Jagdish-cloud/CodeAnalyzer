import { useState } from "react";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Eye, Edit2, Plus, Users, ArrowLeft } from "lucide-react";
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
import type { Student } from "@shared/schema";

export default function StudentsLanding() {
  const [, params] = useRoute("/students/:class/:division");
  const classParam = params?.class || "";
  const divisionParam = params?.division || "";

  const { data: students, isLoading } = useQuery({
    queryKey: ["/api/students/class", classParam, "division", divisionParam],
    queryFn: async () => {
      const response = await fetch(`/api/students/class/${classParam}/division/${divisionParam}`);
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      return response.json() as Promise<Student[]>;
    },
    enabled: !!classParam && !!divisionParam,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading students...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sort students by roll number
  const sortedStudents = students?.sort((a, b) => a.rollNumber - b.rollNumber) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950">
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Link href="/student-masters">
                  <Button variant="outline" size="sm" className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Classes
                  </Button>
                </Link>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  Class {classParam} - Division {divisionParam}
                </h1>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-lg">
                Manage students in this class and division
              </p>
            </div>
            <Link href="/add-student">
              <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="h-5 w-5 mr-2" />
                Add Student
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Total Students</p>
                    <p className="text-3xl font-bold">{sortedStudents.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm font-medium">Class-Division</p>
                    <p className="text-3xl font-bold">{classParam}-{divisionParam}</p>
                  </div>
                  <Eye className="h-8 w-8 text-teal-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Table */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
              <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Students List
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {sortedStudents.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center mb-6">
                    <Users className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    No students in this class yet
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-8">
                    Add the first student to Class {classParam} - Division {divisionParam}
                  </p>
                  <Link href="/add-student">
                    <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0">
                      <Plus className="h-5 w-5 mr-2" />
                      Add First Student
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50">
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                          Student Name
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                          Roll Number
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedStudents.map((student) => (
                        <TableRow
                          key={student.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-200 border-b border-slate-200/30 dark:border-slate-700/30"
                        >
                          <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                            <div className="space-y-1">
                              <div className="font-semibold">
                                {student.firstName} {student.middleName ? `${student.middleName} ` : ""}{student.lastName}
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                {student.sex} • {student.contactNumber}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400 font-mono text-lg">
                            {student.rollNumber}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-900/20"
                              >
                                <Edit2 className="w-4 h-4" />
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