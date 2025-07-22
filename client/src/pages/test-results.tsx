import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Plus, Edit, Trash2, FileText } from "lucide-react";

// Define class group type for display
interface ClassGroup {
  class: string;
  division: string;
  year: string;
  subjects: string[];
  tests: any[];
  totalTests: number;
  completedTests: number;
  averageProgress: number;
  totalStudents: number;
}

export default function TestResultsPage() {
  const [location] = useLocation();
  const activeTab = location.includes('/add') ? 'add' : location.includes('/view') ? 'view' : 'landing';

  const { data: classMappings = [], isLoading: isLoadingMappings } = useQuery<any[]>({
    queryKey: ['/api/class-mappings'],
  });

  const { data: testResults = [] } = useQuery<any[]>({
    queryKey: ['/api/test-results'],
  });

  const { data: periodicTests = [] } = useQuery<any[]>({
    queryKey: ['/api/periodic-tests'],
  });

  const { data: students = [] } = useQuery<any[]>({
    queryKey: ['/api/students'],
  });

  // Group by class and division
  const classGroups: ClassGroup[] = classMappings.map(mapping => {
    // Find tests for this class/division
    const classTests = periodicTests.filter(test => 
      test.class === mapping.class && 
      (Array.isArray(test.divisions) ? test.divisions.includes(mapping.division) : test.divisions === mapping.division)
    );
    
    // Calculate test progress for each test
    const testsWithProgress = classTests.map(test => {
      const testResultsForTest = testResults.filter(result => result.periodicTestId === test.id);
      const completedResults = testResultsForTest.filter(result => result.marks !== null).length;
      const totalStudents = testResultsForTest.length;
      const progressPercentage = totalStudents > 0 ? (completedResults / totalStudents) * 100 : 0;
      
      return {
        ...test,
        completedResults,
        totalStudents,
        progressPercentage
      };
    });
    
    // Get total students for this class/division
    const classStudents = students.filter(student => 
      student.class === mapping.class && student.division === mapping.division
    );
    
    return {
      class: mapping.class,
      division: mapping.division,
      year: mapping.year,
      subjects: mapping.subjects || [],
      tests: testsWithProgress,
      totalTests: classTests.length,
      completedTests: testsWithProgress.filter(test => test.progressPercentage === 100).length,
      averageProgress: testsWithProgress.length > 0 
        ? testsWithProgress.reduce((sum, test) => sum + test.progressPercentage, 0) / testsWithProgress.length 
        : 0,
      totalStudents: classStudents.length
    };
  }).filter(group => group.tests.length > 0); // Only show classes that have tests

  const isLoading = isLoadingMappings;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center">Loading test results...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-slate-900 dark:via-emerald-900/20 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-4">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Test Result
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Manage and track student test results with comprehensive analysis and reporting
          </p>
        </div>

        <div className="mb-2" />

        {/* Navigation Tabs */}
        <Tabs value={activeTab} className="w-full max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 h-14">
            <TabsTrigger 
              value="landing" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white text-base font-semibold transition-all duration-300"
              asChild
            >
              <Link href="/test-results">Landing</Link>
            </TabsTrigger>
            <TabsTrigger 
              value="add" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white text-base font-semibold transition-all duration-300"
              asChild
            >
              <Link href="/test-results/add">Add</Link>
            </TabsTrigger>
            <TabsTrigger 
              value="view" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white text-base font-semibold transition-all duration-300"
              asChild
            >
              <Link href="/test-results/view">View</Link>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="landing" className="mt-8">
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-teal-600/10 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl text-slate-800 dark:text-slate-200">
                    Test Results Overview
                  </CardTitle>
                  <Button 
                    asChild
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link href="/test-results/add">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Test Result
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 dark:bg-slate-700/50 hover:bg-slate-100/50 dark:hover:bg-slate-600/50">
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Class / Division</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Subjects</TableHead>
                        <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">Tests Progress</TableHead>
                        <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">Students</TableHead>
                        <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classGroups.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-slate-500 dark:text-slate-400">
                            <div className="space-y-3">
                              <FileText className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
                              <p className="text-lg font-medium">No class data found</p>
                              <p className="text-sm">Create class mappings and periodic tests to get started</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        classGroups.map((classGroup) => (
                          <TableRow 
                            key={`${classGroup.class}-${classGroup.division}`}
                            className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors duration-200"
                          >
                            <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                    Class {classGroup.class}
                                  </Badge>
                                  <Badge variant="secondary" className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                                    Div {classGroup.division}
                                  </Badge>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {classGroup.year}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">
                              <div className="space-y-1">
                                {classGroup.subjects.slice(0, 3).map((subject, index) => (
                                  <Badge key={index} variant="outline" className="text-xs mr-1 mb-1">
                                    {subject}
                                  </Badge>
                                ))}
                                {classGroup.subjects.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{classGroup.subjects.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="space-y-2">
                                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                  {classGroup.completedTests} / {classGroup.totalTests} Tests
                                </div>
                                <div className="flex items-center justify-center gap-1">
                                  <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-300"
                                      style={{ 
                                        width: `${classGroup.averageProgress}%` 
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {Math.round(classGroup.averageProgress)}%
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                {classGroup.totalStudents}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                {classGroup.tests.map((test) => (
                                  <Button
                                    key={test.id}
                                    size="sm"
                                    variant="outline"
                                    className="hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-900/20"
                                    asChild
                                  >
                                    <Link href={`/test-results/view/${test.id}`}>
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}