import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
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
import { ArrowLeft, Eye, FileText, Users, TrendingUp, Award } from "lucide-react";

export default function ViewTestResultPage() {
  const params = useParams();
  const periodicTestId = params.id ? parseInt(params.id) : null;

  const { data: periodicTest, isLoading: isLoadingTest } = useQuery<any>({
    queryKey: [`/api/periodic-tests/${periodicTestId}`],
    enabled: !!periodicTestId,
  });

  const { data: testResults = [], isLoading: isLoadingResults } = useQuery<any[]>({
    queryKey: [`/api/test-results/periodic-test/${periodicTestId}`],
    enabled: !!periodicTestId,
  });

  if (isLoadingTest || isLoadingResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-slate-900 dark:via-emerald-900/20 dark:to-slate-900 p-6">
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

  if (!periodicTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-slate-900 dark:via-emerald-900/20 dark:to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">Test Not Found</h2>
                <Button asChild>
                  <Link href="/test-results">Back to Test Results</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalStudents = testResults.length;
  const completedResults = testResults.filter(result => result.marks !== null).length;
  const averageMarks = completedResults > 0 
    ? testResults.reduce((sum, result) => sum + (result.marks || 0), 0) / completedResults 
    : 0;
  const completionPercentage = totalStudents > 0 ? (completedResults / totalStudents) * 100 : 0;

  // Grade distribution
  const gradeDistribution = testResults.reduce((acc: any, result) => {
    if (result.grade) {
      acc[result.grade] = (acc[result.grade] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-slate-900 dark:via-emerald-900/20 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-4">
            <Eye className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            View Test Results
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Detailed view of test results and performance analysis
          </p>
        </div>

        <div className="mb-2" />

        {/* Navigation Tabs */}
        <Tabs value="view" className="w-full max-w-7xl mx-auto">
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

          <TabsContent value="view" className="mt-8 space-y-8">
            {/* Test Information Card */}
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-teal-600/10 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-slate-800 dark:text-slate-200 flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/test-results">
                        <ArrowLeft className="h-4 w-4" />
                      </Link>
                    </Button>
                    {periodicTest.testName || `${periodicTest.subject} Test`}
                  </CardTitle>
                  <Badge variant="outline" className="px-3 py-1 text-sm">
                    {periodicTest.year}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{periodicTest.class}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Class</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">
                      {Array.isArray(periodicTest.divisions) ? periodicTest.divisions.join(', ') : periodicTest.divisions}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Division(s)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-600">{periodicTest.subject}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Subject</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{periodicTest.testDate}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Test Date</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-4">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{totalStudents}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total Students</div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg mb-4">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{completedResults}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Completed</div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mb-4">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    {averageMarks.toFixed(1)}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Average Score</div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-4">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    {completionPercentage.toFixed(0)}%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Completion</div>
                </CardContent>
              </Card>
            </div>

            {/* Grade Distribution */}
            {Object.keys(gradeDistribution).length > 0 && (
              <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Grade Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(gradeDistribution).map(([grade, count]) => (
                      <div key={grade} className="text-center">
                        <Badge 
                          variant={grade === 'A+' ? 'default' : grade === 'F' ? 'destructive' : 'secondary'}
                          className="text-lg px-3 py-2 mb-2"
                        >
                          {grade}
                        </Badge>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{count as number}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Students</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Test Results Table */}
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Individual Results</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 dark:bg-slate-700/50 hover:bg-slate-100/50 dark:hover:bg-slate-600/50">
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Roll No</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Student Name</TableHead>
                        <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">Marks</TableHead>
                        <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">Grade</TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testResults.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-slate-500 dark:text-slate-400">
                            <div className="space-y-3">
                              <FileText className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
                              <p className="text-lg font-medium">No test results found</p>
                              <p className="text-sm">Results will appear here once test papers are evaluated</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        testResults
                          .sort((a, b) => a.rollNumber - b.rollNumber)
                          .map((result) => (
                            <TableRow 
                              key={result.id}
                              className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors duration-200"
                            >
                              <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                                {result.rollNumber}
                              </TableCell>
                              <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                                {result.studentName}
                              </TableCell>
                              <TableCell className="text-center">
                                {result.marks !== null ? (
                                  <div className="space-y-1">
                                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                                      {result.marks} / {result.maxMarks}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                      {result.maxMarks > 0 ? Math.round((result.marks / result.maxMarks) * 100) : 0}%
                                    </div>
                                  </div>
                                ) : (
                                  <Badge variant="outline" className="text-slate-500">
                                    Pending
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {result.grade ? (
                                  <Badge 
                                    variant={result.grade === 'A+' ? 'default' : result.grade === 'F' ? 'destructive' : 'secondary'}
                                  >
                                    {result.grade}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-slate-500">
                                    -
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                                {result.remarks || '-'}
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