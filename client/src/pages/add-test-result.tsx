import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileDown, Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

const testResultFormSchema = z.object({
  year: z.string().min(1, "Year is required"),
  periodicTestId: z.string().min(1, "Periodic Test is required"),
  class: z.string().min(1, "Class is required"),
  division: z.string().min(1, "Division is required"),
});

type TestResultFormData = z.infer<typeof testResultFormSchema>;

export default function AddTestResultPage() {
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<TestResultFormData>({
    resolver: zodResolver(testResultFormSchema),
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

  // Fetch students based on selected class and division
  const { data: students = [], isLoading: isLoadingStudents } = useQuery<any[]>({
    queryKey: [`/api/students/class/${watchedValues.class}/division/${watchedValues.division}`],
    enabled: !!(watchedValues.class && watchedValues.division),
  });

  // Get unique years and classes
  const years = Array.from(new Set(periodicTests.map(test => test.year))).sort().reverse();
  const availableClasses = Array.from(new Set(classMappings.map(mapping => mapping.class))).sort();

  // Filter periodic tests based on selected year
  const filteredPeriodicTests = periodicTests.filter(test => test.year === watchedValues.year);

  // Get divisions for selected class
  const selectedClassMappings = classMappings.filter(mapping => mapping.class === watchedValues.class);
  const availableDivisions = Array.from(new Set(selectedClassMappings.flatMap(mapping => mapping.division))).sort();

  // Update selected test when periodicTestId changes
  useEffect(() => {
    if (watchedValues.periodicTestId) {
      const test = periodicTests.find(t => t.id.toString() === watchedValues.periodicTestId);
      setSelectedTest(test);
      if (test) {
        form.setValue("class", test.class);
        if (Array.isArray(test.divisions) && test.divisions.length === 1) {
          form.setValue("division", test.divisions[0]);
        } else {
          form.setValue("division", "");
        }
      }
    }
  }, [watchedValues.periodicTestId, periodicTests, form]);

  const createPDFMutation = useMutation({
    mutationFn: async (formData: TestResultFormData) => {
      if (!selectedTest) throw new Error("No test selected");
      
      // Generate PDF data structure
      const subjects = selectedClassMappings
        .filter(mapping => mapping.class === formData.class)
        .flatMap(mapping => mapping.subjects);

      const pdfData = {
        testInfo: {
          testName: selectedTest.testName || `${selectedTest.subject} Test`,
          class: formData.class,
          division: formData.division,
          year: formData.year,
          subject: selectedTest.subject,
          date: selectedTest.testDate,
          duration: selectedTest.duration,
        },
        students: students.map(student => ({
          rollNumber: student.rollNumber,
          studentName: `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName || ''}`.trim(),
        })).sort((a, b) => a.rollNumber - b.rollNumber),
        subjects: Array.from(new Set([selectedTest.subject, ...subjects])).slice(0, 3), // Max 3 subjects for layout
      };

      // Generate and download PDF
      generatePDF(pdfData);
      
      return pdfData;
    },
    onSuccess: () => {
      toast({
        title: "PDF Generated Successfully",
        description: "The printable PDF sheet has been downloaded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate PDF",
        variant: "destructive",
      });
    },
  });

  const generatePDF = (data: any) => {
    // Create a simple HTML table for PDF generation
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Result Sheet - ${data.testInfo.testName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .test-info { margin-bottom: 20px; }
          .test-info div { margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; }
          .marks-cell { width: 80px; text-align: center; }
          .student-name { width: 200px; }
          .roll-number { width: 80px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Test Result Sheet</h1>
          <h2>${data.testInfo.testName}</h2>
        </div>
        
        <div class="test-info">
          <div><strong>Class:</strong> ${data.testInfo.class}</div>
          <div><strong>Division:</strong> ${data.testInfo.division}</div>
          <div><strong>Subject:</strong> ${data.testInfo.subject}</div>
          <div><strong>Year:</strong> ${data.testInfo.year}</div>
          <div><strong>Date:</strong> ${data.testInfo.date}</div>
          <div><strong>Duration:</strong> ${data.testInfo.duration}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th class="roll-number">Roll No</th>
              <th class="student-name">Student Name</th>
              <th class="marks-cell">Subject 1</th>
              <th class="marks-cell">Subject 2</th>
              <th class="marks-cell">Subject 3</th>
            </tr>
          </thead>
          <tbody>
            ${data.students.map((student: any) => `
              <tr>
                <td class="roll-number">${student.rollNumber}</td>
                <td class="student-name">${student.studentName}</td>
                <td class="marks-cell"></td>
                <td class="marks-cell"></td>
                <td class="marks-cell"></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Create a blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-result-sheet-${data.testInfo.class}-${data.testInfo.division}-${data.testInfo.subject}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const onSubmit = (data: TestResultFormData) => {
    createPDFMutation.mutate(data);
  };

  const canGeneratePDF = watchedValues.year && watchedValues.periodicTestId && watchedValues.class && watchedValues.division && students.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-slate-900 dark:via-emerald-900/20 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-4">
            <Plus className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Add Test Result
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Generate printable PDF sheets for test result entry
          </p>
        </div>

        <div className="mb-2" />

        {/* Navigation Tabs */}
        <Tabs value="add" className="w-full max-w-5xl mx-auto">
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

          <TabsContent value="add" className="mt-8">
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-2xl max-w-5xl mx-auto">
              <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-teal-600/10 rounded-t-lg">
                <CardTitle className="text-2xl text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/test-results">
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                  Add Test Result
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
                                {filteredPeriodicTests.map((test) => (
                                  <SelectItem key={test.id} value={test.id.toString()}>
                                    {test.testName || `${test.subject} Test`} - Class {test.class}
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
                            <Select onValueChange={field.onChange} value={field.value} disabled={!!selectedTest}>
                              <FormControl>
                                <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                                  <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableClasses.map((className) => (
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

                    {/* Student Count Info */}
                    {watchedValues.class && watchedValues.division && (
                      <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Students Found</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {isLoadingStudents ? 'Loading...' : `${students.length} students in Class ${watchedValues.class} - Division ${watchedValues.division}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end pt-6">
                      <Button
                        type="submit"
                        disabled={!canGeneratePDF || createPDFMutation.isPending}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {createPDFMutation.isPending ? (
                          "Generating PDF..."
                        ) : (
                          <>
                            <FileDown className="h-5 w-5 mr-2" />
                            Create Printable PDF Sheet
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}