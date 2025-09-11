import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, FileText, Search } from 'lucide-react';
import { 
  usePeriodicTestAnalysis, 
  generateExpectedPDFSubjects, 
  analyzeDiscrepancy, 
  logPeriodicTestAnalysis,
  getExpectedSubjectsForClassII,
  sampleAnalysis
} from '@/utils/periodicTestAnalysis';

export default function PeriodicTestAnalysis() {
  const [selectedTest, setSelectedTest] = useState({
    testName: "Final Semester",
    year: "2025-2026", 
    className: "II"
  });

  const { analyzePeriodicTests } = usePeriodicTestAnalysis(
    selectedTest.testName,
    selectedTest.year,
    selectedTest.className
  );

  const analysis = analyzePeriodicTests();
  const expectedPDFSubjects = generateExpectedPDFSubjects(analysis);
  const discrepancy = analyzeDiscrepancy(analysis);

  const handleAnalyze = () => {
    logPeriodicTestAnalysis(analysis);
    sampleAnalysis();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Periodic Test Analysis - Class II, Final Semester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><strong>Test:</strong> {selectedTest.testName}</div>
            <div><strong>Year:</strong> {selectedTest.year}</div>
            <div><strong>Class:</strong> {selectedTest.className}</div>
          </div>
          
          <Button onClick={handleAnalyze} className="w-full">
            <Search className="h-4 w-4 mr-2" />
            Analyze & Log Results
          </Button>
        </CardContent>
      </Card>

      {/* Core Subjects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Core Subjects Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.coreSubjects.length > 0 ? (
              analysis.coreSubjects.map((subject, index) => (
                <Badge key={index} variant="default" className="bg-green-100 text-green-800">
                  {subject}
                </Badge>
              ))
            ) : (
              <span className="text-slate-500">No core subjects found</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Elective Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Elective Groups Found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysis.electiveGroups.length > 0 ? (
            analysis.electiveGroups.map((group, index) => (
              <div key={index} className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                <div className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  {group.groupName}
                </div>
                <div className="flex flex-wrap gap-1">
                  {group.subjects.map((subject, subIndex) => (
                    <Badge key={subIndex} variant="outline" className="text-xs">
                      {subject}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Test IDs: {group.testIds.join(', ')}
                </div>
              </div>
            ))
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No elective groups found in periodic tests. This explains why they're missing from the PDF.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Expected PDF Subjects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Expected PDF Subjects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              These are the subjects that should appear in the PDF columns:
            </p>
            <div className="flex flex-wrap gap-2">
              {expectedPDFSubjects.map((subject, index) => (
                <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues Analysis */}
      {discrepancy.hasIssues && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Issues Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {discrepancy.issues.map((issue, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{issue}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample Data Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-600" />
            Sample Data Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Based on your periodic_tests data:</h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Core Subjects:</strong> Mathematics, Science, Hindi
              </div>
              <div>
                <strong>Elective Groups:</strong>
                <ul className="ml-4 mt-1">
                  <li>• Elective 2 I: Dance, Music</li>
                  <li>• Elective 2 II: Sanskrit, French, German</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Expected PDF Structure:</h4>
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-sm">
              <div className="font-mono">
                <div>| Roll No | Student Name | Division | Mathematics | Science | Hindi | Elective 2 I | Elective 2 II |</div>
              </div>
            </div>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Issue Identified:</strong> Your screenshot shows only 3 subject columns (Mathematics, Science, Hindi) 
              but is missing the 2 elective group columns (Elective 2 I, Elective 2 II). 
              This indicates the PDF generation logic is not properly including elective groups.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>Total Subjects Found:</strong> {analysis.allSubjects.length}</div>
            <div><strong>Core Subjects:</strong> {analysis.coreSubjects.length}</div>
            <div><strong>Elective Groups:</strong> {analysis.electiveGroups.length}</div>
            <div><strong>Missing Elective Groups:</strong> {analysis.missingElectiveGroups.length}</div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Raw Analysis Data:</h4>
            <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-xs overflow-auto">
              {JSON.stringify(analysis, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
