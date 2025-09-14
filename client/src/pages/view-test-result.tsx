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

// Interface for grouped test results
interface GroupedTestResult {
  testName: string;
  year: string;
  classes: Array<{
    className: string;
    divisions: Array<{
      division: string;
      students: Array<{
        rollNumber: number;
        studentName: string;
        subjects: Array<{
          subject: string;
          subjectType: string;
          marks: number | null;
          maxMarks: number;
          grade?: string;
          remarks?: string;
        }>;
        totalMarks: number;
        totalMaxMarks: number;
        percentage: number;
        overallGrade?: string;
      }>;
    }>;
  }>;
}

export default function ViewTestResultPage() {
  const params = useParams();
  const testName = params.testName;
  const className = params.className;

  // Fetch all test results
  const { data: allTestResults = [], isLoading: isLoadingResults } = useQuery<any[]>({
    queryKey: ['/api/test-results'],
  });

  // Fetch periodic tests for context
  const { data: periodicTests = [] } = useQuery<any[]>({
    queryKey: ['/api/periodic-tests'],
  });

  // Filter and group test results based on URL parameters
  const filteredResults = allTestResults.filter(result => {
    if (testName && result.periodicTestName !== testName) return false;
    if (className && result.class !== className) return false;
    return true;
  });

  // Group filtered test results by test name, class, and division
  const groupedResults: GroupedTestResult[] = (() => {
    const groups: { [key: string]: GroupedTestResult } = {};
    
    filteredResults.forEach(result => {
      const key = `${result.periodicTestName}-${result.year}`;
      
      if (!groups[key]) {
        groups[key] = {
          testName: result.periodicTestName,
          year: result.year,
          classes: []
        };
      }
      
      // Find or create class
      let classGroup = groups[key].classes.find(c => c.className === result.class);
      if (!classGroup) {
        classGroup = {
          className: result.class,
          divisions: []
        };
        groups[key].classes.push(classGroup);
      }
      
      // Find or create division
      let divisionGroup = classGroup.divisions.find(d => d.division === result.division);
      if (!divisionGroup) {
        divisionGroup = {
          division: result.division,
          students: []
        };
        classGroup.divisions.push(divisionGroup);
      }
      
      // Find or create student
      let student = divisionGroup.students.find(s => s.rollNumber === result.rollNumber);
      if (!student) {
        student = {
          rollNumber: result.rollNumber,
          studentName: result.studentName,
          subjects: [],
          totalMarks: 0,
          totalMaxMarks: 0,
          percentage: 0
        };
        divisionGroup.students.push(student);
      }
      
      // Add subject result
      student.subjects.push({
        subject: result.subject,
        subjectType: result.subjectType,
        marks: result.marks,
        maxMarks: result.maxMarks,
        grade: result.grade,
        remarks: result.remarks
      });
    });
    
    // Calculate totals and percentages for each student
    Object.values(groups).forEach(group => {
      group.classes.forEach(classGroup => {
        classGroup.divisions.forEach(divisionGroup => {
          divisionGroup.students.forEach(student => {
            student.totalMarks = student.subjects.reduce((sum, sub) => sum + (sub.marks || 0), 0);
            student.totalMaxMarks = student.subjects.reduce((sum, sub) => sum + sub.maxMarks, 0);
            student.percentage = student.totalMaxMarks > 0 ? (student.totalMarks / student.totalMaxMarks) * 100 : 0;
            
            // Calculate grade based on percentage
            if (student.percentage >= 90) student.overallGrade = 'A+';
            else if (student.percentage >= 80) student.overallGrade = 'A';
            else if (student.percentage >= 70) student.overallGrade = 'B+';
            else if (student.percentage >= 60) student.overallGrade = 'B';
            else if (student.percentage >= 50) student.overallGrade = 'C+';
            else if (student.percentage >= 40) student.overallGrade = 'C';
            else if (student.percentage >= 33) student.overallGrade = 'D';
            else student.overallGrade = 'F';
          });
          
          // Sort students by roll number
          divisionGroup.students.sort((a, b) => a.rollNumber - b.rollNumber);
        });
      });
    });
    
    return Object.values(groups).sort((a, b) => a.testName.localeCompare(b.testName));
  })();

  // Calculate statistics for the filtered data
  const totalStudents = filteredResults.length;
  const completedResults = filteredResults.filter(result => result.marks !== null).length;
  const averageMarks = completedResults > 0 
    ? filteredResults.reduce((sum, result) => sum + (result.marks || 0), 0) / completedResults 
    : 0;
  const completionPercentage = totalStudents > 0 ? (completedResults / totalStudents) * 100 : 0;

  if (isLoadingResults) {
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-slate-900 dark:via-emerald-900/20 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-4">
            <Eye className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            {testName ? testName : 'Test Results'}
          </h1>
          <div className="flex items-center justify-center gap-4 text-lg text-slate-600 dark:text-slate-300">
            {className && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-base px-3 py-1">
                Class {className}
              </Badge>
            )}
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Detailed view of test results for the selected criteria
          </p>
        </div>

        <div className="mb-2" />

        {/* Navigation Tabs */}
        <Tabs value="view" className="w-full max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 h-14">
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
              value="import" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white text-base font-semibold transition-all duration-300"
              asChild
            >
              <Link href="/test-results/import">Import</Link>
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
            {/* Overall Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-4">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{totalStudents}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total Records</div>
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

            {/* Grouped Test Results - All Divisions in Separate Cards */}
            {groupedResults.length === 0 ? (
              <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl">
                <CardContent className="p-12 text-center">
                  <div className="space-y-3">
                    <FileText className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-lg font-medium">No test results found</p>
                    <p className="text-sm">Results will appear here once test papers are evaluated</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {groupedResults.map((testGroup, groupIndex) => (
                  <div key={`${testGroup.testName}-${testGroup.year}`} className="space-y-6">
                    {/* Test Group Header */}
                    <Card className="backdrop-blur-sm bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800 shadow-xl">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                              {testGroup.testName}
                            </CardTitle>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400">
                              Academic Year: {testGroup.year}
                            </p>
                          </div>
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                            Class {className}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* All Divisions in Separate Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {testGroup.classes.map((classGroup) => 
                        classGroup.divisions.map((divisionGroup, divIndex) => (
                          <Card key={`${testGroup.testName}-${classGroup.className}-${divisionGroup.division}`} className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-xl">
                            <CardHeader>
                              <CardTitle className="text-xl text-slate-800 dark:text-slate-200 flex items-center gap-3">
                                <Badge variant="secondary" className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                                  Division {divisionGroup.division}
                                </Badge>
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                  ({divisionGroup.students.length} students)
                                </span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-slate-50/50 dark:bg-slate-700/50 hover:bg-slate-100/50 dark:hover:bg-slate-600/50">
                                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Roll No</TableHead>
                                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Student Name</TableHead>
                                      <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">Subjects</TableHead>
                                      <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">Total</TableHead>
                                      <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">Percentage</TableHead>
                                      <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">Grade</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {divisionGroup.students.map((student) => (
                                      <TableRow 
                                        key={`${student.rollNumber}-${student.studentName}`}
                                        className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors duration-200"
                                      >
                                        <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                                          {student.rollNumber}
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                                          {student.studentName}
                                        </TableCell>
                                        <TableCell>
                                          <div className="space-y-1">
                                            {student.subjects.map((subject, index) => (
                                              <div key={index} className="flex items-center justify-between text-xs">
                                                <span className="font-medium">{subject.subject}</span>
                                                <span className="text-slate-500">
                                                  {subject.marks !== null ? `${subject.marks}/${subject.maxMarks}` : 'Pending'}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                                            {student.totalMarks} / {student.totalMaxMarks}
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                                            {student.percentage.toFixed(1)}%
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                          <Badge 
                                            variant={student.overallGrade === 'A+' ? 'default' : student.overallGrade === 'F' ? 'destructive' : 'secondary'}
                                          >
                                            {student.overallGrade}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}