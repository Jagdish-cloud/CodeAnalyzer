import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, FileText, Search } from 'lucide-react';
import { 
  useSubjectVerification, 
  formatSubjectsForDisplay, 
  logSubjectVerification,
  type SubjectVerificationResult 
} from '@/utils/subjectVerification';

const verificationFormSchema = z.object({
  year: z.string().min(1, "Year is required"),
  periodicTestId: z.string().min(1, "Periodic Test is required"),
  class: z.string().min(1, "Class is required"),
  division: z.string().min(1, "Division is required"),
});

type VerificationFormData = z.infer<typeof verificationFormSchema>;

export default function TestResultVerificationPage() {
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<SubjectVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      year: new Date().getFullYear().toString(),
      periodicTestId: "",
      class: "",
      division: "",
    },
  });

  const watchedValues = form.watch();

  // Fetch periodic tests
  const { data: periodicTests = [], isLoading: isLoadingTests } = useQuery<any[]>({
    queryKey: ['/api/periodic-tests'],
  });

  // Fetch class mappings for classes
  const { data: classMappings = [] } = useQuery<any[]>({
    queryKey: ['/api/class-mappings'],
  });

  // Get unique years and classes
  const years = Array.from(new Set(periodicTests.map(test => test.year))).sort().reverse();
  const availableClasses = Array.from(new Set(classMappings.map(mapping => mapping.class))).sort();

  // Get unique test names from periodic tests for the selected year
  const uniqueTestNames = Array.from(new Set(
    periodicTests
      .filter(test => test.year === watchedValues.year)
      .map(test => test.testName)
  )).sort();

  // Get available classes for selected test (if test is selected)
  const testsForSelectedTestName = watchedValues.periodicTestId 
    ? periodicTests.filter(t => t.testName === watchedValues.periodicTestId && t.year === watchedValues.year)
    : [];
  const classesForSelectedTest = Array.from(new Set(testsForSelectedTestName.map(t => t.class))).sort();
  
  // Use classes from selected test if available, otherwise use all available classes
  const availableClassesForForm = watchedValues.periodicTestId && classesForSelectedTest.length > 0 
    ? classesForSelectedTest 
    : availableClasses;

  // Get divisions for selected class
  const selectedClassMappings = classMappings.filter(mapping => mapping.class === watchedValues.class);
  const availableDivisions = Array.from(new Set(selectedClassMappings.flatMap(mapping => mapping.division))).sort();

  // Update selected test when periodicTestId or class changes
  React.useEffect(() => {
    if (watchedValues.periodicTestId && watchedValues.year) {
      // Get all classes for this test name
      const testsForName = periodicTests.filter(t => 
        t.testName === watchedValues.periodicTestId && 
        t.year === watchedValues.year
      );
      const classesForTest = Array.from(new Set(testsForName.map(t => t.class)));
      
      // Only auto-populate class if there's only one class for this test
      if (classesForTest.length === 1 && !watchedValues.class) {
        form.setValue("class", classesForTest[0]);
      }
      
      // Find specific test when both test name and class are selected
      if (watchedValues.class) {
        const specificTest = periodicTests.find(t => 
          t.testName === watchedValues.periodicTestId && 
          t.year === watchedValues.year && 
          t.class === watchedValues.class
        );
        setSelectedTest(specificTest);
      } else {
        // Use first test for basic info display
        const firstTest = testsForName[0];
        setSelectedTest(firstTest);
      }
    }
  }, [watchedValues.periodicTestId, watchedValues.class, watchedValues.year, periodicTests, form]);

  // Clear division when class changes
  React.useEffect(() => {
    if (watchedValues.class) {
      form.setValue("division", "");
    }
  }, [watchedValues.class, form]);

  // Subject verification hook
  const { 
    getClassSubjects, 
    getPeriodicTestSubjects, 
    verifySubjects 
  } = useSubjectVerification(
    watchedValues.class, 
    watchedValues.division, 
    watchedValues.periodicTestId, 
    watchedValues.year
  );

  // Get current subject information
  const classSubjectInfo = getClassSubjects();
  const periodicTestSubjects = getPeriodicTestSubjects();

  // Simulate PDF subjects generation (same logic as in add-test-result.tsx)
  const generatePDFSubjects = (formData: VerificationFormData) => {
    if (!selectedTest) return [];

    // Get all subjects for the selected test name, class, and division
    const testsForName = periodicTests.filter(test => 
      test.testName === selectedTest.testName && 
      test.class === formData.class &&
      test.year === formData.year
    );
    
    const rawSubjects = Array.from(new Set(testsForName.map(test => test.subject)));
    
    // Create structured subjects array for display (combining core subjects and elective groups)
    const structuredSubjects: string[] = [];
    
    // Get the subjects that are actually mapped to this periodic test
    const testSubjects = Array.from(new Set(testsForName.map(test => test.subject)));
    
    // Get structured subjects for reference
    const { coreSubjects, electiveGroups } = classSubjectInfo;
    
    // Add core subjects that are mapped to this test
    coreSubjects.forEach((subject: string) => {
      if (testSubjects.includes(subject)) {
        structuredSubjects.push(subject);
      }
    });
    
    // Add elective groups that are mapped to this test
    electiveGroups.forEach((group: any) => {
      // Check if any test subject matches this group (exact or partial match)
      const hasMatchingSubject = testSubjects.some((testSubject: string) => 
        testSubject === group.groupName || 
        group.groupName.includes(testSubject) || 
        testSubject.includes(group.groupName)
      );
      
      if (hasMatchingSubject) {
        const groupDisplay = `${group.groupName}: ${group.subjects.join(', ')}`;
        structuredSubjects.push(groupDisplay);
      }
    });

    return structuredSubjects;
  };

  const handleVerifySubjects = async (formData: VerificationFormData) => {
    setIsVerifying(true);
    
    try {
      // Generate PDF subjects using the same logic as the actual PDF generation
      const pdfSubjects = generatePDFSubjects(formData);
      
      // Perform verification
      const result = verifySubjects(pdfSubjects);
      
      // Log detailed results
      logSubjectVerification(result);
      
      setVerificationResult(result);
    } catch (error) {
      console.error('Error during subject verification:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const onSubmit = (data: VerificationFormData) => {
    handleVerifySubjects(data);
  };

  const canVerify = watchedValues.year && watchedValues.periodicTestId && watchedValues.class && watchedValues.division;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-slate-900 dark:via-emerald-900/20 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-4">
            <Search className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Test Result Subject Verification
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Verify that PDF subjects match the actual class subjects and periodic test configuration
          </p>
        </div>

        <div className="mb-2" />

        {/* Main Content */}
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Form Card */}
          <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-teal-600/10 rounded-t-lg">
              <CardTitle className="text-2xl text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/test-results">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                Subject Verification Form
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Year Field */}
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">Year</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                                <SelectValue placeholder="Select year" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {years.map((year) => (
                                <SelectItem key={year} value={year}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Periodic Test Field */}
                    <FormField
                      control={form.control}
                      name="periodicTestId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">Periodic Test</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!watchedValues.year}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                                <SelectValue placeholder="Select periodic test" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {uniqueTestNames.map((testName) => (
                                <SelectItem key={testName} value={testName}>
                                  {testName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Class Field */}
                    <FormField
                      control={form.control}
                      name="class"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">Class</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!watchedValues.periodicTestId}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableClassesForForm.map((className) => (
                                <SelectItem key={className} value={className}>
                                  Class {className}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Division Field */}
                    <FormField
                      control={form.control}
                      name="division"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">Division</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!watchedValues.class}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                                <SelectValue placeholder="Select division" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableDivisions.map((division) => (
                                <SelectItem key={division} value={division}>
                                  Division {division}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Selected Test Info */}
                  {selectedTest && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6 space-y-3">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200">Test Information</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div><span className="font-medium">Subject:</span> {selectedTest.subject}</div>
                        <div><span className="font-medium">Date:</span> {selectedTest.testDate}</div>
                        <div><span className="font-medium">Duration:</span> {selectedTest.duration}</div>
                        <div><span className="font-medium">Chapters:</span> {selectedTest.chapters?.join(', ')}</div>
                      </div>
                    </div>
                  )}

                  {/* Subject Information Display */}
                  {canVerify && (
                    <div className="space-y-4">
                      <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-6">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Class Subject Configuration</h3>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {formatSubjectsForDisplay(classSubjectInfo)}
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Periodic Test Subjects</h3>
                        <div className="flex flex-wrap gap-1">
                          {periodicTestSubjects.length > 0 ? (
                            periodicTestSubjects.map((subject, index) => (
                              <Badge key={index} variant="outline">{subject}</Badge>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500">No subjects found</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end pt-6">
                    <Button
                      type="submit"
                      disabled={!canVerify || isVerifying}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isVerifying ? (
                        "Verifying..."
                      ) : (
                        <>
                          <Search className="h-5 w-5 mr-2" />
                          Verify PDF Subjects
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Verification Results */}
          {verificationResult && (
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-teal-600/10 rounded-t-lg">
                <CardTitle className="text-2xl text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  {verificationResult.isMatch ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  Verification Results
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <Badge variant={verificationResult.isMatch ? "default" : "destructive"} className="text-lg px-4 py-2">
                    {verificationResult.isMatch ? 'PERFECT MATCH' : 'MISMATCH DETECTED'}
                  </Badge>
                  <Badge variant={verificationResult.coreSubjectsMatch ? "default" : "destructive"}>
                    Core Subjects: {verificationResult.coreSubjectsMatch ? '✓' : '✗'}
                  </Badge>
                  <Badge variant={verificationResult.electiveGroupsMatch ? "default" : "destructive"}>
                    Elective Groups: {verificationResult.electiveGroupsMatch ? '✓' : '✗'}
                  </Badge>
                </div>

                {verificationResult.missingInPDF.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Subjects Missing in PDF:</strong>
                      <ul className="mt-2 list-disc list-inside">
                        {verificationResult.missingInPDF.map((subject, index) => (
                          <li key={index} className="text-sm">{subject}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {verificationResult.extraInPDF.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Extra Subjects in PDF:</strong>
                      <ul className="mt-2 list-disc list-inside">
                        {verificationResult.extraInPDF.map((subject, index) => (
                          <li key={index} className="text-sm">{subject}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">PDF Subjects (Generated):</h4>
                    <div className="flex flex-wrap gap-1">
                      {verificationResult.details.pdfSubjects.map((subject, index) => (
                        <Badge key={index} variant="outline">{subject}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
